import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User
from apps.projects.models import Project

print("--- Listing Users ---")
for user in User.objects.all():
    print(f"ID: {user.id}, Email: {user.email}, Username: {user.username}")

print("\n--- Listing Projects ---")
for project in Project.objects.all():
    owner = project.owner.email if project.owner else "None"
    print(f"ID: {project.id}, Name: {project.name}, Owner: {owner}")
    members = [m.email for m in project.members.all()]
    print(f"  Members: {', '.join(members)}")
