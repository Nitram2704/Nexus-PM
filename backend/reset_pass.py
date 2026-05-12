import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.accounts.models import User

user = User.objects.get(email='test@nexus.com')
user.set_password('Password123!')
user.save()
print(f"Password reset for {user.email}")
