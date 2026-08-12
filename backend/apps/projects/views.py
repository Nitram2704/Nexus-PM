import csv
import io

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Sum
from django.contrib.auth import get_user_model
from django.http import HttpResponse
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
from .analytics import ProjectAnalytics

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
        if self.action in ['update', 'partial_update', 'destroy', 'invite', 'update_member_role', 'remove_member']:
            return [IsAuthenticated(), IsProjectOwnerOrAdmin()]
        if self.action in ['retrieve', 'analytics', 'export_csv']:
            return [IsAuthenticated(), IsProjectMember()]
        return super().get_permissions()

    @action(detail=True, methods=['get'])
    def analytics(self, request, pk=None):
        """
        Retorna métricas avanzadas para el dashboard del proyecto.
        - Distribución de prioridades.
        - Carga de trabajo por usuario.
        - Burndown Chart (Sprint activo).
        - Velocidad y Cycle Time (Módulo Velocity Scan).
        """
        project = self.get_object()
        from apps.tasks.models import Task, Sprint
        
        # Engine de analíticas avanzado
        engine = ProjectAnalytics(project)
        scan_data = engine.get_summary()

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

        # 3. Datos de Sprint Activo
        active_sprint = Sprint.objects.filter(project=project, status='active').first()

        return Response({
            "priorities": priorities_data,
            "workload": workload_data,
            "burndown": scan_data['burndown'],
            "velocity": scan_data['velocity'],
            "cycle_time": scan_data['cycle_time_days'],
            "health_score": scan_data['health_score'],
            "sprint_name": active_sprint.name if active_sprint else None
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def hud_analytics(self, request, pk=None):
        """
        Retorna el historial de snapshots para los gráficos del HUD.
        """
        project = self.get_object()
        from .models import ProjectMetricSnapshot
        from .serializers import ProjectMetricSnapshotSerializer
        from .analytics import ProjectAnalytics
        
        # Trigger calculation (actualización forzada para hoy)
        engine = ProjectAnalytics(project)
        engine.create_snapshot()
        
        snapshots = ProjectMetricSnapshot.objects.filter(project=project).order_by('date')
        serializer = ProjectMetricSnapshotSerializer(snapshots, many=True)
        
        return Response(serializer.data, status=status.HTTP_200_OK)

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

    @action(detail=True, methods=['post'])
    def reorder_columns(self, request, pk=None):
        """
        Reordena las columnas del proyecto.
        Recibe una lista de IDs de columnas en el orden deseado.
        """
        project = self.get_object()
        column_ids = request.data.get('column_ids', [])
        
        if not isinstance(column_ids, list):
            return Response({"error": "column_ids debe ser una lista."}, status=status.HTTP_400_BAD_REQUEST)
            
        from django.db import transaction
        from .models import Column
        
        with transaction.atomic():
            for idx, col_id in enumerate(column_ids):
                try:
                    column = Column.objects.get(id=col_id, project=project)
                    column.position = idx
                    column.save()
                except Column.DoesNotExist:
                    continue
                    
        return Response({"message": "Columnas reordenadas exitosamente."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def velocity(self, request, pk=None):
        """
        Retorna la velocidad del equipo (story points planificados vs completados) por sprint.
        Solo accesible para Propietarios y Administradores.
        """
        project = self.get_object()
        
        # Verificar permisos de rol (HU-31)
        try:
            member = Member.objects.get(project=project, user=request.user)
            if member.role not in ['owner', 'admin']:
                return Response(
                    {"error": "No tienes permiso para ver reportes. Se requiere rol Admin o Propietario."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except Member.DoesNotExist:
            return Response({"error": "No eres miembro de este proyecto."}, status=status.HTTP_403_FORBIDDEN)
        
        from apps.tasks.models import Sprint, Task
        from django.db.models import Sum, Q
        
        # Obtener todos los sprints del proyecto
        sprints = Sprint.objects.filter(project=project).order_by('created_at')
        
        data = []
        for s in sprints:
            stats = Task.objects.filter(sprint=s).aggregate(
                planned=Sum('story_points', default=0),
                completed=Sum('story_points', filter=Q(column__is_done_column=True), default=0)
            )
            data.append({
                "name": s.name,
                "planned": stats['planned'] or 0,
                "completed": stats['completed'] or 0
            })
            
        return Response(data)

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        """
        Exporta el backlog del proyecto como CSV (RPT-03).
        Solo accesible para miembros del proyecto.
        """
        project = self.get_object()
        from apps.tasks.models import Task

        buffer = io.StringIO()
        writer = csv.writer(buffer)
        writer.writerow(['key', 'title', 'type', 'priority', 'status', 'assignee', 'story_points', 'sprint'])

        tasks = Task.objects.filter(project=project).select_related('column', 'assignee', 'sprint')
        for task in tasks:
            writer.writerow([
                task.key,
                task.title,
                task.type,
                task.priority,
                task.column.name if task.column else '',
                task.assignee.email if task.assignee else 'Sin asignar',
                task.story_points,
                task.sprint.name if task.sprint else '',
            ])

        # charset utf-8-sig: el BOM se escribe una sola vez al codificar el contenido completo
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="{project.key}-backlog.csv"'
        response.write(buffer.getvalue())
        return response

    @action(detail=True, methods=['post'])
    def update_member_role(self, request, pk=None):
        """
        Cambia el rol de un miembro del proyecto (PRJ-06).
        Solo Owner/Admin. No se puede asignar 'owner' ni cambiar el rol del propietario.
        """
        project = self.get_object()
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')

        allowed_roles = ['admin', 'developer', 'viewer']
        if new_role not in allowed_roles:
            return Response(
                {"error": f"Rol inválido. Debe ser uno de: {', '.join(allowed_roles)}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            member = Member.objects.get(project=project, user_id=user_id)
        except (Member.DoesNotExist, ValueError):
            return Response(
                {"error": "El usuario no es miembro de este proyecto."},
                status=status.HTTP_404_NOT_FOUND
            )

        if member.user_id == project.owner_id:
            return Response(
                {"error": "No se puede cambiar el rol del propietario del proyecto."},
                status=status.HTTP_400_BAD_REQUEST
            )

        member.role = new_role
        member.save()
        return Response(
            {"message": f"Rol de {member.user.email} actualizado a '{new_role}'."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """
        Elimina a un miembro del proyecto (PRJ-06).
        Solo Owner/Admin. No se puede eliminar al propietario.
        """
        project = self.get_object()
        user_id = request.data.get('user_id')

        try:
            member = Member.objects.get(project=project, user_id=user_id)
        except (Member.DoesNotExist, ValueError):
            return Response(
                {"error": "El usuario no es miembro de este proyecto."},
                status=status.HTTP_404_NOT_FOUND
            )

        if member.user_id == project.owner_id or member.role == 'owner':
            return Response(
                {"error": "No se puede eliminar al propietario del proyecto."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = member.user.email
        member.delete()
        return Response(
            {"message": f"Miembro {email} eliminado del proyecto."},
            status=status.HTTP_200_OK
        )


class ColumnViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar las columnas del proyecto.
    """
    queryset = Column.objects.all()
    serializer_class = ColumnSerializer
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get_queryset(self):
        return Column.objects.filter(project__members__user=self.request.user)

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        position = project.columns.count()
        serializer.save(position=position)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.tasks.exists():
            return Response({"error": "No se puede eliminar una columna con tareas activas."}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)

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

