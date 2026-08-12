from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from django.urls import reverse
from apps.projects.models import Project, Member, Column

User = get_user_model()


class ProjectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User',
        )
        self.other_user = User.objects.create_user(
            email='other@nexus.com',
            username='otheruser',
            password='Password123!',
            first_name='Other',
            last_name='User',
        )
        # Authenticate via JWT
        resp = self.client.post(reverse('auth-login'), {
            'email': 'test@nexus.com',
            'password': 'Password123!',
        })
        self.access_token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

        # Other user auth
        resp2 = self.client.post(reverse('auth-login'), {
            'email': 'other@nexus.com',
            'password': 'Password123!',
        })
        self.other_token = resp2.data['access']

    # ── CRUD ────────────────────────────────────────────────────────────

    def test_create_project(self):
        resp = self.client.post(reverse('project-list'), {
            'name': 'New Project',
            'key': 'NEW',
            'description': 'A test project',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        project = Project.objects.get(key='NEW')
        self.assertEqual(project.owner, self.user)
        self.assertTrue(Member.objects.filter(project=project, user=self.user, role='owner').exists())
        self.assertEqual(Column.objects.filter(project=project).count(), 4)

    def test_list_projects(self):
        Project.objects.create(name='P1', key='P1', owner=self.user)
        Member.objects.create(project=Project.objects.get(key='P1'), user=self.user, role='owner')
        resp = self.client.get(reverse('project-list'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_list_projects_excludes_non_member(self):
        p = Project.objects.create(name='Secret', key='SEC', owner=self.other_user)
        Member.objects.create(project=p, user=self.other_user, role='owner')
        resp = self.client.get(reverse('project-list'))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)

    def test_retrieve_project(self):
        p = Project.objects.create(name='Detail', key='DET', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        resp = self.client.get(reverse('project-detail', args=[p.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Detail')
        self.assertIn('columns', resp.data)

    def test_update_project_owner(self):
        p = Project.objects.create(name='Upd', key='UPD', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        resp = self.client.patch(reverse('project-detail', args=[p.id]), {'name': 'Updated'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Project.objects.get(id=p.id).name, 'Updated')

    def test_update_project_forbidden_for_developer(self):
        p = Project.objects.create(name='Nope', key='NPE', owner=self.other_user)
        Member.objects.create(project=p, user=self.other_user, role='owner')
        Member.objects.create(project=p, user=self.user, role='developer')
        resp = self.client.patch(reverse('project-detail', args=[p.id]), {'name': 'Hacked'})
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    # ── Members ─────────────────────────────────────────────────────────

    def test_invite_member(self):
        p = Project.objects.create(name='Invite', key='INV', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        resp = self.client.post(reverse('project-invite', args=[p.id]), {
            'email': 'other@nexus.com',
            'role': 'developer',
        })
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Member.objects.filter(project=p, user=self.other_user).exists())

    def test_invite_already_member(self):
        p = Project.objects.create(name='Dup', key='DUP', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        Member.objects.create(project=p, user=self.other_user, role='developer')
        resp = self.client.post(reverse('project-invite', args=[p.id]), {
            'email': 'other@nexus.com',
            'role': 'developer',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_member_role(self):
        p = Project.objects.create(name='Role', key='ROL', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        Member.objects.create(project=p, user=self.other_user, role='developer')
        resp = self.client.post(reverse('project-update-member-role', args=[p.id]), {
            'user_id': self.other_user.id,
            'role': 'admin',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(Member.objects.get(project=p, user=self.other_user).role, 'admin')

    def test_update_member_role_invalid(self):
        p = Project.objects.create(name='Role2', key='RL2', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        Member.objects.create(project=p, user=self.other_user, role='developer')
        resp = self.client.post(reverse('project-update-member-role', args=[p.id]), {
            'user_id': self.other_user.id,
            'role': 'owner',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_remove_member(self):
        p = Project.objects.create(name='Rem', key='REM', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        Member.objects.create(project=p, user=self.other_user, role='developer')
        resp = self.client.post(reverse('project-remove-member', args=[p.id]), {
            'user_id': self.other_user.id,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(Member.objects.filter(project=p, user=self.other_user).exists())

    def test_remove_owner_forbidden(self):
        p = Project.objects.create(name='NoDel', key='NDL', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        resp = self.client.post(reverse('project-remove-member', args=[p.id]), {
            'user_id': self.user.id,
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    # ── CSV Export ──────────────────────────────────────────────────────

    def test_export_csv(self):
        p = Project.objects.create(name='CSV', key='CSV', owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        resp = self.client.get(reverse('project-export-csv', args=[p.id]))
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('text/csv', resp.get('Content-Type', ''))
