from django.db import models
from django.conf import settings
import uuid

class Notification(models.Model):
    TYPE_CHOICES = [
        ('task_assigned', 'Tarea Asignada'),
        ('task_moved', 'Tarea Movida'),
        ('task_comment', 'Nuevo Comentario'),
        ('custom_alert', 'Alerta de Sistema'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='notifications'
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200)
    content = models.TextField()
    link = models.CharField(max_length=500, blank=True, null=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type}] {self.title} for {self.user.email}"
