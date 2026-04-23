import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User
from apps.projects.models import Project, Column
from apps.tasks.models import Task

def seed_project():
    user = User.objects.get(email='test@nexus.com')
    
    project, created = Project.objects.get_or_create(
        key='NEX',
        defaults={
            'name': 'Nexus Project',
            'owner': user,
            'description': 'Proyecto base para pruebas de Kanban'
        }
    )
    
    if created:
        # Crear la relación de Miembro como Propietario (importante para el filtrado de queryset)
        from apps.projects.models import Member
        Member.objects.create(
            project=project,
            user=user,
            role='owner'
        )

        # Crear Sprint activo
        from apps.tasks.models import Sprint
        sprint = Sprint.objects.create(
            project=project,
            name='Sprint 1',
            status='active'
        )

        # Usar columnas creadas por la señal post_save
        col1 = project.columns.get(position=0)
        
        # Crear tareas iniciales
        Task.objects.create(
            project=project, column=col1, sprint=sprint, title='Configurar Auth', 
            creator=user, priority='high'
        )
        Task.objects.create(
            project=project, column=col1, sprint=sprint, title='Diseñar Kanban', 
            creator=user, priority='medium'
        )
        print("Proyecto y tareas de prueba creados.")
    else:
        print("El proyecto NEX ya existe.")

if __name__ == '__main__':
    seed_project()
