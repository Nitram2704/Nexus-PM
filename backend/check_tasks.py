import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.tasks.models import Task
from apps.projects.models import Project

project = Project.objects.filter(key='NEX').first()
if project:
    backlog = Task.objects.filter(project=project, sprint__isnull=True).count()
    sprint = Task.objects.filter(project=project, sprint__isnull=False).count()
    print(f"Project: {project.name} ({project.id})")
    print(f"Backlog tasks: {backlog}")
    print(f"Sprint tasks: {sprint}")
else:
    print("Project NEX not found")
