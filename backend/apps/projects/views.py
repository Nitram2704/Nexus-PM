from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.contrib.auth import get_user_model

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
        if self.action in ['retrieve']:
            return [IsAuthenticated(), IsProjectMember()]
        return super().get_permissions()

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
