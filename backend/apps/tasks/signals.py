from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Comment
from apps.notifications.models import Notification

@receiver(post_save, sender=Task)
def task_notifications(sender, instance, created, **kwargs):
    # 1. Assignment Notification
    if created and instance.assignee:
        Notification.objects.create(
            user=instance.assignee,
            type='task_assigned',
            title='Nueva tarea asignada',
            content=f'Se te ha asignado la tarea: {instance.title}',
            link=f'/project/{instance.project.id}/kanban' # Optional: Add deep link to task ID
        )
    
    # 2. Movement Notification (Column change)
    # Note: For movement we need to check if column changed. 
    # Simple check for now: only if not created.
    elif not created:
        # Here we could use a pre_save to detect change, 
        # but for simplicity we notify the assignee that the task updated.
        if instance.assignee:
             Notification.objects.create(
                user=instance.assignee,
                type='task_moved',
                title='Actualización de tarea',
                content=f'La tarea "{instance.title}" ha sido actualizada.',
                link=f'/project/{instance.project.id}/kanban'
            )

@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if created:
        task = instance.task
        author = instance.author
        
        # Destinatarios: asignado y creador de la tarea (excluyendo al autor del comentario)
        recipients = set()
        if task.assignee and task.assignee != author:
            recipients.add(task.assignee)
        if task.creator and task.creator != author:
            recipients.add(task.creator)
            
        for user in recipients:
            Notification.objects.create(
                user=user,
                type='task_comment',
                title='Nuevo comentario en tarea',
                content=f'{author.full_name or author.username} comentó en la tarea "{task.title}": {instance.content[:50]}...',
                link=f'/project/{task.project.id}/kanban'
            )

