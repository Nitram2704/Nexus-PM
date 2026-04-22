from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.db import transaction
from .models import Task

@receiver(pre_save, sender=Task)
def generate_task_key(sender, instance, **kwargs):
    "Genera una clave única para la tarea antes de guardarla (ej: NEX-1)."
    if not instance.key:
        # Usamos una transacción atómica para evitar colisiones de contador
        with transaction.atomic():
            project = instance.project
            # Recargar el proyecto bloqueando la fila para actualización
            from apps.projects.models import Project
            project = Project.objects.select_for_update().get(id=project.id)
            
            project.task_counter += 1
            project.save()
            
            instance.key = f"{project.key}-{project.task_counter}"
