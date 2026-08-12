from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.projects.models import Project, Member
from apps.tasks.models import Task, Sprint

User = get_user_model()


class ChatAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')

        self.project = Project.objects.create(name='AI Proj', key='AIP', owner=self.user)
        Member.objects.create(project=self.project, user=self.user, role='owner')

    def test_chat_project(self):
        resp = self.client.post(
            reverse('ai-chat', args=[self.project.id]),
            {'content': 'Hola, dame un resumen del proyecto'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('content', resp.data)

    def test_chat_global_endpoint_unreachable(self):
        """BUG: The view supports project_id='global' but the URL pattern
        only accepts UUIDs, so this path is unreachable."""
        from django.urls.exceptions import NoReverseMatch
        with self.assertRaises(NoReverseMatch):
            reverse('ai-chat', args=['global'])

    def test_chat_history(self):
        self.client.post(
            reverse('ai-chat', args=[self.project.id]),
            {'content': 'Mensaje inicial'},
            format='json',
        )
        resp = self.client.get(reverse('ai-chat-history', args=[self.project.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_chat_empty_content_fails(self):
        resp = self.client.post(
            reverse('ai-chat', args=[self.project.id]),
            {'content': ''},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class GenerateBacklogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')

        self.project = Project.objects.create(name='AI Proj', key='AIP', owner=self.user)
        Member.objects.create(project=self.project, user=self.user, role='owner')

    def test_generate_backlog(self):
        resp = self.client.post(
            reverse('ai-generate-backlog', args=[self.project.id]),
            {'description': 'Una aplicación de e-commerce con carrito, pagos y gestión de inventario'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('data', resp.data)
        self.assertTrue(resp.data['data'])

    def test_generate_backlog_too_short(self):
        resp = self.client.post(
            reverse('ai-generate-backlog', args=[self.project.id]),
            {'description': 'Short'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class PrioritizeBacklogAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')

        self.project = Project.objects.create(name='PRI', key='PRI', owner=self.user)
        Member.objects.create(project=self.project, user=self.user, role='owner')
        self.backlog = self.project.columns.get(position=0)

    def test_prioritize_not_enough_tasks(self):
        resp = self.client.get(reverse('ai-prioritize', args=[self.project.id]))
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_prioritize_with_tasks(self):
        Task.objects.create(project=self.project, title='T1', key='PRI-1', creator=self.user, column=self.backlog)
        Task.objects.create(project=self.project, title='T2', key='PRI-2', creator=self.user, column=self.backlog)
        resp = self.client.get(reverse('ai-prioritize', args=[self.project.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('ordered_ids', resp.data)


class AIRecommendationsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')

        self.project = Project.objects.create(name='REC', key='REC', owner=self.user)
        Member.objects.create(project=self.project, user=self.user, role='owner')

    def test_generate_recommendations_fixed_status_field(self):
        """After fix: views.py:491 uses 'column__name' instead of 'status'.
        POST /ai/recommendations/ should no longer raise FieldError."""
        resp = self.client.post(reverse('ai-recommendations', args=[self.project.id]))
        # Should return 201 (created) or 200, NOT a 500 FieldError
        self.assertIn(resp.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])

    def test_list_recommendations(self):
        resp = self.client.get(reverse('ai-recommendations', args=[self.project.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIsInstance(resp.data, list)


class ForesightAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')

        self.project = Project.objects.create(name='FST', key='FST', owner=self.user)
        Member.objects.create(project=self.project, user=self.user, role='owner')

    def test_foresight(self):
        resp = self.client.get(reverse('ai-foresight', args=[self.project.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('ai_recommendation', resp.data)
