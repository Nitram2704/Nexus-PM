import os
import django
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User
from apps.tasks.models import Task
from apps.projects.models import Project, Column
from apps.notifications.models import Notification

def test_notification():
    # 1. Get or create test users
    user1, _ = User.objects.get_or_create(email='user1@test.com', defaults={'username': f'user1_{uuid.uuid4().hex[:4]}'})
    user2, _ = User.objects.get_or_create(email='user2@test.com', defaults={'username': f'user2_{uuid.uuid4().hex[:4]}'})
    
    # 2. Get or create a project
    project, _ = Project.objects.get_or_create(
        name='Test Project Notification', 
        defaults={'owner': user1, 'key': 'TNOTIF'}
    )
    
    # 3. Get or create a column (handle position carefully)
    column = Column.objects.filter(project=project, name='Todo').first()
    if not column:
        # Find next position
        last_pos = Column.objects.filter(project=project).order_by('-position').first()
        pos = (last_pos.position + 1) if last_pos else 0
        column = Column.objects.create(project=project, name='Todo', position=pos)
    
    # 4. Create a task assigned to user2
    print("Creando tarea y asignándola a user2...")
    task = Task.objects.create(
        project=project,
        column=column,
        title=f'Tarea de prueba {uuid.uuid4().hex[:6]}',
        creator=user1,
        assignee=user2
    )
    
    # 5. Check if notification was created
    notif = Notification.objects.filter(user=user2, type='task_assigned').first()
    if notif:
        print(f"ÉXITO: Notificación creada para {user2.email}")
        print(f"Título: {notif.title}")
        print(f"Contenido: {notif.content}")
    else:
        print("ERROR: No se creó la notificación")


if __name__ == "__main__":
    test_notification()
