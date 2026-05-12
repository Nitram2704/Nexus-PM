import os
import django
import json
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.projects.models import Project, Column
from apps.tasks.models import Sprint, Task
from apps.accounts.models import User
from apps.intelligence.client import BacklogAIClient

def test_sprint_summary():
    project = Project.objects.first()
    if not project:
        print("FAIL: No project found.")
        return

    print(f"Testing Sprint Summary for project: {project.name}")
    
    # Get or create an active sprint
    sprint = Sprint.objects.filter(project=project, status='active').first()
    if not sprint:
        sprint = Sprint.objects.create(
            project=project,
            name="Test Summary Sprint",
            status='active',
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=7)
        )
    
    # Ensure there are some tasks
    if sprint.tasks.count() == 0:
        done_col = Column.objects.filter(project=project, name='Done').first()
        todo_col = Column.objects.filter(project=project, name='To Do').first()
        
        Task.objects.create(project=project, sprint=sprint, column=done_col, title="Task 1 Completed", story_points=5)
        Task.objects.create(project=project, sprint=sprint, column=todo_col, title="Task 2 Pending", story_points=3)

    # Prepare data like the view does
    sprint_data = {
        "name": sprint.name,
        "goal": sprint.goal,
        "status": sprint.status,
        "start": sprint.start_date.strftime('%Y-%m-%d'),
        "end": sprint.end_date.strftime('%Y-%m-%d'),
    }
    
    tasks = sprint.tasks.all().select_related('column')
    tasks_data = [
        {
            "key": t.key,
            "title": t.title,
            "points": t.story_points,
            "status": t.column.name if t.column else "Desconocido",
            "is_completed": t.column.is_done_column if t.column else False
        } for t in tasks
    ]

    print("\n--- Generating AI Summary ---")
    ai_client = BacklogAIClient()
    summary = ai_client.generate_sprint_summary(sprint_data, tasks_data)
    
    if summary:
        print("SUCCESS: Summary generated!")
        print("-" * 30)
        print(summary[:300] + "...")
        print("-" * 30)
    else:
        print("FAIL: Summary generation returned nothing.")

if __name__ == "__main__":
    test_sprint_summary()
