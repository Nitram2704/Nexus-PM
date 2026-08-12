from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

class NotificationSetting(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notification_settings'
    )
    task_assigned = models.BooleanField(default=True)
    task_moved = models.BooleanField(default=True)
    task_comment = models.BooleanField(default=True)
    custom_alert = models.BooleanField(default=True)
    expiration = models.BooleanField(default=True)

    class Meta:
        db_table = 'notification_settings'
        verbose_name = 'Preferencias de Notificación'
        verbose_name_plural = 'Preferencias de Notificación'

    def __str__(self):
        return f"Settings for {self.user.email}"


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_notification_settings(sender, instance, created, **kwargs):
    if created:
        NotificationSetting.objects.get_or_create(user=instance)


class NotificationManager(models.Manager):
    def create(self, *args, **kwargs):
        user = kwargs.get('user')
        type_ = kwargs.get('type')
        if user and type_:
            try:
                setting, _ = NotificationSetting.objects.get_or_create(user=user)
                if not getattr(setting, type_, True):
                    return None
            except Exception:
                pass
        return super().create(*args, **kwargs)


class Notification(models.Model):
    TYPE_CHOICES = [
        ('task_assigned', 'Tarea Asignada'),
        ('task_moved', 'Tarea Movida'),
        ('task_comment', 'Nuevo Comentario'),
        ('custom_alert', 'Alerta de Sistema'),
        ('expiration', 'Vencimiento de Sprint'),
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

    objects = NotificationManager()

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self._state.adding:
            try:
                setting, _ = NotificationSetting.objects.get_or_create(user=self.user)
                if not getattr(setting, self.type, True):
                    return
            except Exception:
                pass
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.type}] {self.title} for {self.user.email}"

