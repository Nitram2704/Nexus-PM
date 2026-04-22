from rest_framework import permissions
from .models import Member

class IsProjectMember(permissions.BasePermission):
    """
    Permite acceso solo a usuarios que son miembros del proyecto.
    """
    def has_object_permission(self, request, view, obj):
        # Si el objeto es el Proyecto mismo
        if hasattr(obj, 'members'):
            return obj.members.filter(user=request.user).exists()
        # Si el objeto tiene una relación con Proyecto (Member o Column)
        if hasattr(obj, 'project'):
            return obj.project.members.filter(user=request.user).exists()
        return False

class IsProjectOwnerOrAdmin(permissions.BasePermission):
    """
    Permite acceso solo a propietarios o administradores del proyecto.
    """
    def has_object_permission(self, request, view, obj):
        from .models import Project
        project = obj if isinstance(obj, Project) else getattr(obj, 'project', None)
        
        if not project:
            return False
            
        member = project.members.filter(user=request.user).first()
        return member and member.role in ['owner', 'admin']
