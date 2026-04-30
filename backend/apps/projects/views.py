from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

from .models import Project, Member, Column
from .serializers import (
    ProjectSerializer, 
    ProjectDetailSerializer, 
    MemberSerializer, 
    InviteMemberSerializer,
    ColumnSerializer
)
from .permissions import IsProjectMember, IsProjectOwnerOrAdmin

User = get_user_model()

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proyectos.
    - El listado solo muestra proyectos donde el usuario es miembro.
    - Se asigna automáticamente al creador como 'Propietario'.
    """
    queryset = Project.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        if self.action == 'invite':
            return InviteMemberSerializer
        return ProjectSerializer

    def get_queryset(self):
        # Optimización: anotar conteo de miembros y filtrar por membresía
        return Project.objects.filter(
            members__user=self.request.user
        ).annotate(member_count=Count('members'))

    def perform_create(self, serializer):
        # Crear el proyecto
        project = serializer.save(owner=self.request.user)
        # Crear la relación de Miembro como Propietario
        Member.objects.create(
            project=project,
            user=self.request.user,
            role='owner'
        )

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy', 'invite']:
            return [IsAuthenticated(), IsProjectOwnerOrAdmin()]
        if self.action in ['retrieve', 'analytics']:
            return [IsAuthenticated(), IsProjectMember()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Retorna métricas para el dashboard del proyecto.
        - Distribución de prioridades.
        - Carga de trabajo por usuario.
        - Datos para Burndown Chart del sprint activo.
        """
        project = self.get_object()
        from apps.tasks.models import Task, Sprint

        # 1. Prioridades
        priority_counts = Task.objects.filter(project=project).values('priority').annotate(count=Count('id'))
        priorities_data = {item['priority']: item['count'] for item in priority_counts}

        # 2. Carga de trabajo (Tareas por usuario)
        workload_counts = Task.objects.filter(project=project).values('assignee__first_name', 'assignee__email').annotate(count=Count('id'))
        workload_data = [
            {
                "name": item['assignee__first_name'] or item['assignee__email'] or "Sin asignar",
                "tasks": item['count']
            } for item in workload_counts
        ]

        # 3. Datos de Burndown (Sprint activo)
        active_sprint = Sprint.objects.filter(project=project, status='active').first()
        burndown_data = []
        
        if active_sprint and active_sprint.start_date and active_sprint.end_date:
            total_points = Task.objects.filter(sprint=active_sprint).aggregate(total=Sum('story_points'))['total'] or 0
            
            # Generar puntos por día
            start = active_sprint.start_date.date()
            end = active_sprint.end_date.date()
            days_count = (end - start).days + 1
            
            # Obtener tareas completadas por día
            done_tasks = Task.objects.filter(
                sprint=active_sprint, 
                column__is_done_column=True
            ).values('updated_at__date').annotate(points=Sum('story_points')).order_by('updated_at__date')
            
            points_by_date = {item['updated_at__date']: item['points'] for item in done_tasks}
            
            cumulative_done = 0
            for i in range(days_count):
                current_date = start + timedelta(days=i)
                points_today = points_by_date.get(current_date, 0)
                cumulative_done += points_today
                
                # Línea ideal: baja de total_points a 0 linealmente
                ideal = total_points - (total_points / (days_count - 1) * i) if days_count > 1 else 0
                
                burndown_data.append({
                    "date": current_date.strftime("%d/%m"),
                    "actual": total_points - cumulative_done,
                    "ideal": round(max(0, ideal), 2)
                })

        return Response({
            "priorities": priorities_data,
            "workload": workload_data,
            "burndown": burndown_data,
            "sprint_name": active_sprint.name if active_sprint else None
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], serializer_class=InviteMemberSerializer)
    def invite(self, request, pk=None):
        """
        Invita a un usuario existente al proyecto.
        """
        project = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            role = serializer.validated_data['role']
            user_to_invite = User.objects.get(email=email)

            if Member.objects.filter(project=project, user=user_to_invite).exists():
                return Response(
                    {"error": "El usuario ya es miembro de este proyecto."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            Member.objects.create(
                project=project,
                user=user_to_invite,
                role=role
            )
            return Response({"message": f"Usuario {email} invitado exitosamente."}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ColumnViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las columnas del proyecto.
    """
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Column.objects.filter(project__members__user=self.request.user)

    @action(detail=True, methods=['post'])
    def clear_tasks(self, request, pk=None):
        """
        Borra todas las tareas dentro de una columna.
        """
        column = self.get_object()
        tasks_count = column.tasks.count()
        column.tasks.all().delete()
        return Response({
            "message": f"Se han eliminado {tasks_count} tareas de la columna.",
            "count": tasks_count
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def move_all(self, request, pk=None):
        """
        Mueve todas las tareas de esta columna a otra.
        """
        column = self.get_object()
        target_id = request.data.get('target_column_id')
        
        if not target_id:
            return Response({"error": "Debe especificar target_column_id."}, status=status.HTTP_400_BAD_REQUEST)
            
        if str(target_id) == str(column.id):
            return Response({"error": "No se puede mover tareas a la misma columna."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_column = Column.objects.get(pk=target_id, project=column.project)
        except Column.DoesNotExist:
            return Response({"error": "La columna destino no existe o no pertenece al mismo proyecto."}, status=status.HTTP_404_NOT_FOUND)
        
        tasks_count = column.tasks.count()
        column.tasks.all().update(column=target_column)
        
        return Response({
            "message": f"Se han movido {tasks_count} tareas a '{target_column.name}'.",
            "count": tasks_count
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reorder_tasks(self, request, pk=None):
        """
        Reordena las tareas dentro de esta columna.
        Se recibe una lista con los IDs de las tareas en el orden deseado.
        También asigna las tareas a esta columna si venían de otra.
        """
        column = self.get_object()
        task_ids = request.data.get('task_ids', [])
        
        if not isinstance(task_ids, list):
            return Response({"error": "task_ids debe ser una lista."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Obtenemos las tareas que pertenecen al proyecto para seguridad
        from apps.tasks.models import Task
        from django.db import transaction

        with transaction.atomic():
            for idx, task_id in enumerate(task_ids):
                try:
                    task = Task.objects.get(id=task_id, project=column.project)
                    task.column = column
                    task.order = idx
                    task.save()
                except Task.DoesNotExist:
                    continue

        return Response({"message": "Tareas reordenadas exitosamente."}, status=status.HTTP_200_OK)

