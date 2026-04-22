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
    AddMemberSerializer
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
            return AddMemberSerializer
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

    @action(detail=True, methods=['post'], serializer_class=AddMemberSerializer)
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
