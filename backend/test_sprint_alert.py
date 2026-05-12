import os
import django
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User
from apps.tasks.models import Task, Sprint
from apps.projects.models import Project, Column, Member
from apps.notifications.models import Notification
from django.core.management import call_command

def test_sprint_expiration():
    # 1. Setup users and project
    owner, _ = User.objects.get_or_create(email='owner@test.com', defaults={'username': 'owner_sprint'})
    dev, _ = User.objects.get_or_create(email='dev@test.com', defaults={'username': 'dev_sprint'})
    
    project, _ = Project.objects.get_or_create(
        name='Sprint Alert Project', 
        defaults={'owner': owner, 'key': 'ALRT'}
    )
    
    # Ensure dev is a member
    Member.objects.get_or_create(project=project, user=dev, defaults={'role': 'developer'})
    Member.objects.get_or_create(project=project, user=owner, defaults={'role': 'owner'})
    
    # Columns
    todo, _ = Column.objects.get_or_create(project=project, name='Todo', defaults={'position': 10})
    done, _ = Column.objects.get_or_create(project=project, name='Done', defaults={'position': 11, 'is_done_column': True})
    
    # 2. Create an expiring sprint (expires in 24 hours)
    sprint = Sprint.objects.create(
        project=project,
        name='Sprint Expirando',
        status='active',
        start_date=timezone.now() - timedelta(days=5),
        end_date=timezone.now() + timedelta(hours=24)
    )
    
    # 3. Create tasks (2 pending, 1 done)
    Task.objects.create(project=project, sprint=sprint, column=todo, title='Pending 1', creator=owner)
    Task.objects.create(project=project, sprint=sprint, column=todo, title='Pending 2', creator=owner)
    Task.objects.create(project=project, sprint=sprint, column=done, title='Done 1', creator=owner)
    
    # 4. Run the command
    print("Ejecutando comando check_sprint_expiration...")
    call_command('check_sprint_expiration')
    
    # 5. Check notifications
    dev_notif = Notification.objects.filter(user=dev, type='expiration', title='¡Sprint próximo a vencer!').first()
    if dev_notif:
        print(f"ÉXITO: Notificación enviada a {dev.email}")
        print(f"Mensaje: {dev_notif.message}")
        if "2 tareas pendientes" in dev_notif.message:
            print("Conteo de tareas pendientes CORRECTO.")
    else:
        print("ERROR: No se envió la notificación al desarrollador")

if __name__ == "__main__":
    test_sprint_expiration()
