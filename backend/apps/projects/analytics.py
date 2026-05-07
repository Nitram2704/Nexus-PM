from django.db import models
from django.db.models import Sum, Count, Avg
from django.utils import timezone
from datetime import timedelta
from apps.tasks.models import Task

class ProjectAnalytics:
    def __init__(self, project):
        self.project = project

    def get_velocity(self):
        """Calcula la velocidad media de los últimos 3 sprints cerrados."""
        closed_sprints = self.project.sprints.filter(
            status='closed'
        ).order_by('-end_date')[:3]
        
        if not closed_sprints.exists():
            return 0
            
        total_points = Task.objects.filter(
            sprint__in=closed_sprints,
            column__name__icontains='done' # Asumiendo que 'done' es el estado final
        ).aggregate(Sum('story_points'))['story_points__sum'] or 0
        
        return round(total_points / closed_sprints.count(), 1)

    def get_burndown_data(self):
        """Genera datos para el gráfico de burndown del sprint activo."""
        active_sprint = self.project.sprints.filter(status='active').first()
        if not active_sprint:
            return []
            
        start_date = active_sprint.start_date
        end_date = active_sprint.end_date
        total_days = (end_date - start_date).days + 1
        
        # Puntos totales al inicio
        total_points = Task.objects.filter(
            sprint=active_sprint
        ).aggregate(Sum('story_points'))['story_points__sum'] or 0
        
        data = []
        current_points = total_points
        
        # Calcular puntos quemados por día
        for day_offset in range(total_days):
            current_date = start_date + timedelta(days=day_offset)
            if current_date > timezone.now().date():
                break
                
            burned_today = Task.objects.filter(
                sprint=active_sprint,
                updated_at__date=current_date,
                column__name__icontains='done'
            ).aggregate(Sum('story_points'))['story_points__sum'] or 0
            
            current_points -= burned_today
            
            # Línea ideal
            ideal_points = total_points - (total_points / (total_days - 1) * day_offset) if total_days > 1 else 0
            
            data.append({
                "day": current_date.strftime("%d %b"),
                "remaining": float(current_points),
                "ideal": round(float(ideal_points), 1)
            })
            
        return data

    def get_cycle_time(self):
        """Tiempo medio de ciclo (de creación a completado)."""
        tasks = Task.objects.filter(
            project=self.project,
            column__name__icontains='done',
            created_at__isnull=False,
            updated_at__isnull=False
        )
        
        if not tasks.exists():
            return 0
            
        total_seconds = 0
        count = 0
        for task in tasks:
            # Una aproximación simple: tiempo entre creación y última actualización en Done
            delta = task.updated_at - task.created_at
            total_seconds += delta.total_seconds()
            count += 1
            
        avg_days = (total_seconds / count) / 86400 if count > 0 else 0
        return round(avg_days, 1)

    def get_summary(self):
        return {
            "velocity": self.get_velocity(),
            "cycle_time_days": self.get_cycle_time(),
            "burndown": self.get_burndown_data(),
            "health_score": self._calculate_health()
        }

    def _calculate_health(self):
        # Lógica dummy de salud del proyecto
        return 85 
