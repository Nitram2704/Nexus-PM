from django.db import models
from django.conf import settings
from apps.tasks.models import Task
import uuid

class Notification(models.Model):
    """
    Sistema de notificaciones internas para Nexus-PM.
    """
    TYPE_CHOICES = [
        ('assignment', 'Asignación de tarea'),
        ('expiration', 'Vencimiento de sprint'),
        ('system', 'Sistema'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Enlace a la tarea (opcional)
    task = models.ForeignKey(
        Task, 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='notifications'
    )
    
    # Quién disparó la notificación (ej: quién asignó la tarea)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='actions_triggered'
    )
    
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        db_table = 'notifications'

    def __str__(self):
        return f"Notificación para {self.user.email}: {self.title}"
