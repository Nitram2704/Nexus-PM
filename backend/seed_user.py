import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User

def seed_user():
    email = 'test@nexus.com'
    if not User.objects.filter(email=email).exists():
        User.objects.create_user(
            username='testuser',
            email=email,
            password='Password123!',
            first_name='Test',
            last_name='User'
        )
        print(f"Usuario creado: {email} / Password123!")
    else:
        print(f"El usuario {email} ya existe.")

if __name__ == '__main__':
    seed_user()
