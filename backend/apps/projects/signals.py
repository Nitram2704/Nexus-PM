from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project, Column

@receiver(post_save, sender=Project)
def create_default_columns(sender, instance, created, **kwargs):
    """
    Crea las 4 columnas básicas de Kanban al crear un nuevo proyecto.
    """
    if created:
        columns = [
            {'name': 'Por Hacer', 'position': 0, 'is_done_column': False},
            {'name': 'En Progreso', 'position': 1, 'is_done_column': False},
            {'name': 'En Revisión', 'position': 2, 'is_done_column': False},
            {'name': 'Hecho', 'position': 3, 'is_done_column': True},
        ]
        
        for col_data in columns:
            Column.objects.create(
                project=instance,
                **col_data
            )
