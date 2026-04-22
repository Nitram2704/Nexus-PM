from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from apps.projects.models import Project, Member, Column

User = get_user_model()

class ProjectAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='test@nexus.com',
            username='testuser',
            password='Password123!',
            first_name='Test',
            last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='other@nexus.com',
            username='otheruser',
            password='Password123!',
            first_name='Other',
            last_name='User'
        )
        self.login_url = reverse('auth-login')
        
        # Obtenemos token
        response = self.client.post(self.login_url, {
            'email': 'test@nexus.com',
            'password': 'Password123!'
        })
        self.access_token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_create_project_success(self):
        """Verifica que se puede crear un proyecto y se generan columnas."""
        url = reverse('project-list')
        data = {
            'name': 'New Project',
            'key': 'NEW',
            'description': 'A test project'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        project = Project.objects.get(key='NEW')
        self.assertEqual(project.owner, self.user)
        
        # Verificar miembro owner
        member = Member.objects.get(project=project, user=self.user)
        self.assertEqual(member.role, 'owner')
        
        # Verificar señales (columnas)
        self.assertEqual(Column.objects.filter(project=project).count(), 4)

    def test_list_projects_filtering(self):
        """Verifica que solo ves los proyectos donde eres miembro."""
        # Proyecto de otro usuario
        p2 = Project.objects.create(name="Stolen Project", key="STL", owner=self.other_user)
        Member.objects.create(project=p2, user=self.other_user, role='owner')
        
        # Mi proyecto
        url = reverse('project-list')
        self.client.post(url, {'name': 'Mine', 'key': 'MN'})
        
        response = self.client.get(url)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['key'], 'MN')

    def test_invite_member(self):
        """Verifica que el propietario puede invitar nuevos miembros."""
        p = Project.objects.create(name="Invite Test", key="INV", owner=self.user)
        Member.objects.create(project=p, user=self.user, role='owner')
        
        url = reverse('project-invite', args=[p.id])
        data = {
            'email': 'other@nexus.com',
            'role': 'developer'
        }
        response = self.client.post(url, data)
        if response.status_code != status.HTTP_201_CREATED:
            print(f"\nAPI Error: {response.data}")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Member.objects.filter(project=p, user=self.other_user).exists())
