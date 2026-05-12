import os
import django
import json
import uuid

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.projects.models import Project
from apps.intelligence.client import BacklogAIClient
from apps.accounts.models import User
from apps.tasks.models import Task

def test_ai_features():
    project = Project.objects.first()
    user = User.objects.first()
    
    if not project or not user:
        print("FAIL: Project or user not found in DB. Run seed scripts first.")
        return

    print(f"Testing AI features for project: {project.name}")
    client = BacklogAIClient()

    # 1. Test User Story Generation
    print("\n--- Testing User Story Generation ---")
    requirement = "Pasarela de pagos con Stripe"
    print("Calling generate_user_stories...")
    stories = client.generate_user_stories(requirement)
    print(f"Generated {len(stories)} stories.")
    if len(stories) > 0:
        first = stories[0]
        print(f"First story format check: {first.get('role')} | {first.get('action')} | {first.get('benefit')}")
        if all(k in first for k in ['role', 'action', 'benefit', 'acceptance_criteria']):
            print("OK: Story format is correct.")
        else:
            print("ERROR: Story format is missing fields.")
    else:
        print("ERROR: No stories generated.")

    # 2. Test Backlog Prioritization
    print("\n--- Testing Backlog Prioritization ---")
    tasks = list(Task.objects.filter(project=project, sprint__isnull=True).values(
        'id', 'title', 'description', 'type', 'priority'
    )[:5])
    
    if len(tasks) >= 1:
        # Convert UUID to string for JSON serialization
        for t in tasks: t['id'] = str(t['id'])
        
        print("Calling prioritize_backlog...")
        result = client.prioritize_backlog(tasks)
        if result and 'reasoning' in result and 'ordered_ids' in result:
            print("OK: Prioritization returned reasoning and ordered IDs.")
            print(f"Reasoning: {result['reasoning'][:100]}...")
        else:
            print("ERROR: Prioritization failed or returned invalid format.")
    else:
        print("WARNING: Not enough tasks to test prioritization.")

    # 3. Test Project Chat
    print("\n--- Testing Project Chat ---")
    history = []
    message = "¿Qué puedes decirme sobre el estado actual de mi proyecto?"
    context = f"Proyecto: {project.name}. Tareas: {Task.objects.filter(project=project).count()}"
    
    print("Calling chat_with_project...")
    chat_response = client.chat_with_project(history, message, context)
    if chat_response:
        print("OK: Chat response received.")
        print(f"Agent: {chat_response[:100]}...")
    else:
        print("ERROR: Chat response failed.")

    print("\nFIN: AI Features testing completed.")

if __name__ == "__main__":
    test_ai_features()
