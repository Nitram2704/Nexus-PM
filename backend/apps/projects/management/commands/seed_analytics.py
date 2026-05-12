from django.core.management.base import BaseCommand
from apps.projects.models import Project, ProjectMetricSnapshot
from django.utils import timezone
from datetime import timedelta
import random

class Command(BaseCommand):
    help = 'Puebla datos históricos de analíticas para demostración'

    def handle(self, *args, **options):
        projects = Project.objects.all()
        if not projects.exists():
            self.stdout.write(self.style.WARNING('No hay proyectos para poblar.'))
            return

        for project in projects:
            self.stdout.write(f'Poblando datos para el proyecto: {project.name}')
            today = timezone.now().date()
            
            # Crear snapshots para los últimos 14 días
            for i in range(13, -1, -1):
                date = today - timedelta(days=i)
                
                # Simular variaciones realistas
                velocity = 15 + random.uniform(-2, 3) + (i * 0.1)
                throughput = 10 + i + random.randint(-2, 2)
                cycle_time = 4.5 + random.uniform(-0.5, 1.0)
                flow_efficiency = 65 + random.uniform(0, 10)
                active_tasks = 20 + random.randint(-5, 5)
                completed_tasks = throughput * 2 # Acumulado
                
                ProjectMetricSnapshot.objects.update_or_create(
                    project=project,
                    date=date,
                    defaults={
                        'velocity': round(velocity, 1),
                        'throughput': throughput,
                        'cycle_time_avg': round(cycle_time, 1),
                        'flow_efficiency': round(flow_efficiency, 1),
                        'active_tasks_count': active_tasks,
                        'completed_tasks_count': completed_tasks
                    }
                )
        
        self.stdout.write(self.style.SUCCESS('Población de analíticas completada exitosamente.'))
