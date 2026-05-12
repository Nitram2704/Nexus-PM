from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tasks.models import Task
from .models import Notification

@receiver(post_save, sender=Task)
def notify_task_assignment(sender, instance, created, **kwargs):
    """
    Crea una notificación cuando se asigna una tarea a un usuario.
    """
    # Si la tarea tiene un asignado
    if instance.assignee:
        # Evitar notificar si el creador se asigna a sí mismo (opcional, pero suele ser mejor)
        # Para saber quién hizo el cambio 'real', a veces necesitamos middleware,
        # pero aquí usaremos el 'creator' como fallback si no tenemos más info.
        
        # Título y mensaje
        title = "Nueva tarea asignada"
        message = f"Te han asignado la tarea: {instance.title}"
        
        # Verificar si ya existe una notificación reciente para evitar duplicados en el mismo guardado
        # (Aunque post_save solo corre una vez por guardado)
        
        # Solo crear si el asignado no es el creador (o siempre, según preferencia)
        # Aquí lo haremos siempre que haya un asignado para cumplir el requerimiento.
        
        # Nota: Idealmente compararíamos el assignee previo, 
        # pero por simplicidad en esta fase, notificamos al assignee actual.
        
        # Buscar si ya notificamos esto (para no spamear en cada update menor de la tarea)
        # Podríamos usar un cache o un campo 'notified_assignee' en Task, 
        # pero vamos a crear la notificación si no existe una 'No leída' idéntica.
        
        exists = Notification.objects.filter(
            user=instance.assignee,
            task=instance.id,
            type='assignment',
            is_read=False,
            title=title
        ).exists()
        
        if not exists:
            Notification.objects.create(
                user=instance.assignee,
                task=instance,
                type='assignment',
                title=title,
                message=message,
                actor=instance.creator
            )
