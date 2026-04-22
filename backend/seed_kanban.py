import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User
from apps.projects.models import Project, Column, Task

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
        # Crear columnas base
        col1 = Column.objects.create(project=project, name='To Do', order=0)
        col2 = Column.objects.create(project=project, name='In Progress', order=1)
        col3 = Column.objects.create(project=project, name='Done', order=2)
        
        # Crear tareas iniciales
        Task.objects.create(
            project=project, column=col1, title='Configurar Auth', 
            creator=user, priority='HIGH', order=0
        )
        Task.objects.create(
            project=project, column=col1, title='Diseñar Kanban', 
            creator=user, priority='MEDIUM', order=1
        )
        print("Proyecto y tareas de prueba creados.")
    else:
        print("El proyecto NEX ya existe.")

if __name__ == '__main__':
    seed_project()
