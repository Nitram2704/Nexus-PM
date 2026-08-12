from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.tasks.models import Sprint, Task
from apps.notifications.models import Notification
from apps.projects.models import Member

class Command(BaseCommand):
    help = 'Revisa los sprints que vencen en 48 horas y envía notificaciones.'

    def handle(self, *args, **options):
        now = timezone.now()
        threshold = now + timedelta(hours=48)
        
        # Sprints activos que vencen pronto y no han sido notificados hoy
        expiring_sprints = Sprint.objects.filter(
            status='active',
            end_date__lte=threshold,
            end_date__gt=now
        )
        
        self.stdout.write(f"Revisando {expiring_sprints.count()} sprints próximos a vencer...")
        
        for sprint in expiring_sprints:
            # Contar tareas pendientes (que no están en la columna 'Done')
            pending_tasks_count = Task.objects.filter(
                sprint=sprint,
                column__is_done_column=False
            ).count()
            
            # Solo notificar si hay tareas pendientes
            if pending_tasks_count == 0:
                continue
                
            # Obtener miembros del proyecto
            members = Member.objects.filter(project=sprint.project)
            
            title = "¡Sprint próximo a vencer!"
            message = (
                f"El sprint '{sprint.name}' vence el {sprint.end_date.strftime('%d/%m %H:%M')}. "
                f"Quedan {pending_tasks_count} tareas pendientes."
            )
            
            for member in members:
                # Evitar duplicados para este sprint en las últimas 24 horas
                last_24h = now - timedelta(hours=24)
                already_notified = Notification.objects.filter(
                    user=member.user,
                    type='expiration',
                    title=title,
                    created_at__gte=last_24h
                ).exists()
                
                if not already_notified:
                    Notification.objects.create(
                        user=member.user,
                        type='expiration',
                        title=title,
                        content=message,
                        link=f'/project/{sprint.project.id}/kanban'
                    )
                    self.stdout.write(self.style.SUCCESS(f"Notificación enviada a {member.user.email} para el sprint {sprint.name}"))

