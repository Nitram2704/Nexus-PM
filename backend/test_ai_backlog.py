import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.projects.models import Project
from apps.intelligence.client import BacklogAIClient
from apps.intelligence.models import AIProposal
from apps.accounts.models import User
from apps.tasks.models import Task

def test_ai_backlog():
    project = Project.objects.first()
    user = User.objects.first()
    
    print(f"Testing for project: {project.name}")
    print(f"Testing for user: {user.email}")
    
    # 1. Test Client
    client = BacklogAIClient()
    description = "Una app para gestionar una biblioteca con prestamos y multas."
    proposal_data = client.generate_backlog(description)
    
    print("\nAI Proposal Data:")
    print(json.dumps(proposal_data, indent=2))
    
    if not proposal_data:
        print("FAIL: No proposal data generated")
        return

    # 2. Test Proposal Saving
    proposal = AIProposal.objects.create(
        project=project,
        user=user,
        description=description,
        data=proposal_data
    )
    print(f"\nProposal saved with ID: {proposal.id}")

    # 3. Test Importation Logic (subset of tasks)
    selected_indices = [0, 1]
    tasks_before = Task.objects.count()
    
    for idx in selected_indices:
        item = proposal.data[idx]
        Task.objects.create(
            project=project,
            title=item['title'],
            description=item['description'],
            type=item['type'],
            priority=item['priority'],
            creator=user,
            column=project.columns.first()
        )
    
    tasks_after = Task.objects.count()
    print(f"\nTasks before: {tasks_before}")
    print(f"Tasks after: {tasks_after}")
    
    if tasks_after == tasks_before + 2:
        print("\nSUCCESS: AI backlog generation and importation logic works!")
    else:
        print("\nFAIL: Tasks were not created correctly")

if __name__ == "__main__":
    test_ai_backlog()
