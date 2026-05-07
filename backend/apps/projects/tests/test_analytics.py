from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from apps.projects.models import Project, Column
from apps.tasks.models import Task, Sprint
from apps.projects.analytics import ProjectAnalytics
from django.contrib.auth import get_user_model

User = get_user_model()

class AnalyticsTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', email='test@nexus.com', password='pass')
        self.project = Project.objects.create(name='Test Proj', owner=self.user)
        # Columns are created by signal, let's get them
        self.col_todo = self.project.columns.get(position=0)
        self.col_done = self.project.columns.get(is_done_column=True)

    def test_cycle_time_calculation(self):
        # Create task created 2 days ago, finished now
        t1 = Task.objects.create(
            project=self.project,
            title='T1',
            column=self.col_done,
            creator=self.user
        )
        # Force created_at update (auto_now_add bypass)
        past_date = timezone.now() - timedelta(days=2)
        Task.objects.filter(id=t1.id).update(created_at=past_date)
        t1.refresh_from_db()
        
        analytics = ProjectAnalytics(self.project)
        cycle_time = analytics.get_cycle_time()
        
        # Should be approx 2.0 days
        self.assertEqual(cycle_time, 2.0)

    def test_velocity_closed_sprints(self):
        # Create closed sprint (status is 'completed', not 'closed' in models)
        s1 = Sprint.objects.create(
            project=self.project,
            name='S1',
            status='completed',
            start_date=timezone.now() - timedelta(days=14),
            end_date=timezone.now() - timedelta(days=7)
        )
        # 10 points task
        Task.objects.create(
            project=self.project,
            sprint=s1,
            title='T2',
            column=self.col_done,
            creator=self.user,
            story_points=10
        )
        
        analytics = ProjectAnalytics(self.project)
        self.assertEqual(analytics.get_velocity(), 10.0)
