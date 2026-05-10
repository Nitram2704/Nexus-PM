from django.utils import timezone
from apps.tasks.models import Sprint, Task
from django.db.models import Sum, Count
import math

class ForesightEngine:
    """
    Motor proactivo de predicción para proyectos Nexus PM.
    Analiza el ritmo del sprint y la carga de los miembros para detectar riesgos.
    """
    
    def __init__(self, project):
        self.project = project
        self.active_sprint = Sprint.objects.filter(project=project, status='active').first()

    def get_sprint_foresight(self):
        if not self.active_sprint or not self.active_sprint.start_date or not self.active_sprint.end_date:
            return {
                "risk_level": "none",
                "risk_index": 0,
                "message": "Sin sprint activo o fechas no definidas.",
                "indicators": {}
            }

        tasks = Task.objects.filter(sprint=self.active_sprint)
        total_points = tasks.aggregate(Sum('story_points'))['story_points__sum'] or 0
        completed_points = tasks.filter(completed_at__isnull=False).aggregate(Sum('story_points'))['story_points__sum'] or 0
        
        # Tiempos
        now = timezone.now()
        total_duration = (self.active_sprint.end_date - self.active_sprint.start_date).total_seconds()
        elapsed_time = (now - self.active_sprint.start_date).total_seconds()
        remaining_time = (self.active_sprint.end_date - now).total_seconds()
        
        if total_duration <= 0 or remaining_time <= 0:
            return {
                "risk_level": "critical" if total_points > completed_points else "none",
                "risk_index": 100 if total_points > completed_points else 0,
                "message": "Sprint finalizado o tiempo agotado.",
                "indicators": {}
            }

        # Progresos
        time_progress = max(0.0, min(1.0, elapsed_time / total_duration))
        work_progress = completed_points / total_points if total_points > 0 else 1.0
        
        # Riesgo basado en desviación (Ideal Burndown)
        deviation = time_progress - work_progress
        risk_index = max(0, min(100, deviation * 150)) # Multiplicador para sensibilidad
        
        # Sobrecarga de miembros
        overloaded_members = self._get_overloaded_members(tasks)
        
        risk_level = "low"
        if risk_index > 25: risk_level = "medium"
        if risk_index > 60: risk_level = "high"
        
        # Si hay demasiados miembros sobrecargados, subir el riesgo
        if len(overloaded_members) >= 2:
            risk_level = "high" if risk_level == "medium" else risk_level

        return {
            "risk_level": risk_level,
            "risk_index": round(risk_index, 2),
            "indicators": {
                "time_elapsed_pct": round(time_progress * 100, 2),
                "work_completed_pct": round(work_progress * 100, 2),
                "overloaded_members": overloaded_members,
                "total_points": total_points,
                "completed_points": completed_points
            }
        }

    def _get_overloaded_members(self, tasks):
        """Detecta usuarios con más de 4 tareas activas en el sprint."""
        active_tasks = tasks.filter(completed_at__isnull=True, assignee__isnull=False)
        member_counts = active_tasks.values('assignee__email').annotate(count=Count('id'))
        
        overloaded = []
        for m in member_counts:
            if m['count'] >= 5:
                overloaded.append({
                    "email": m['assignee__email'],
                    "task_count": m['count']
                })
        return overloaded

    def run_simulation(self, capacity_multiplier=1.0, scope_multiplier=1.0, deadline_shift_days=0):
        """
        Simula un escenario "What-if" alterando variables del sprint activo.
        """
        base_foresight = self.get_sprint_foresight()
        if base_foresight["risk_level"] == "none" and not self.active_sprint:
            return base_foresight

        # Ajuste de Puntos (Scope)
        sim_total_points = base_foresight["indicators"]["total_points"] * scope_multiplier
        sim_completed_points = base_foresight["indicators"]["completed_points"]
        
        # Ajuste de Tiempo (Deadline)
        original_end = self.active_sprint.end_date
        sim_end = original_end + timezone.timedelta(days=deadline_shift_days)
        
        total_duration = (sim_end - self.active_sprint.start_date).total_seconds()
        now = timezone.now()
        elapsed_time = (now - self.active_sprint.start_date).total_seconds()
        
        if total_duration <= 0: return base_foresight
        
        time_progress = max(0.0, min(1.0, elapsed_time / total_duration))
        
        # Ajuste de Capacidad (Afecta el ritmo de completado proyectado)
        # La lógica aquí es: si la capacidad baja, la desviación aumenta.
        work_progress = sim_completed_points / sim_total_points if sim_total_points > 0 else 1.0
        
        # Factor de capacidad: Si capacity_multiplier < 1, el riesgo escala inversamente
        effective_deviation = (time_progress - work_progress) / capacity_multiplier
        
        sim_risk_index = max(0, min(100, effective_deviation * 150))
        
        sim_risk_level = "low"
        if sim_risk_index > 25: sim_risk_level = "medium"
        if sim_risk_index > 60: sim_risk_level = "high"
        
        return {
            "scenario": {
                "capacity": capacity_multiplier,
                "scope": scope_multiplier,
                "deadline_shift": deadline_shift_days
            },
            "risk_level": sim_risk_level,
            "risk_index": round(sim_risk_index, 2),
            "indicators": {
                "time_elapsed_pct": round(time_progress * 100, 2),
                "work_completed_pct": round(work_progress * 100, 2),
                "sim_total_points": sim_total_points,
                "original_risk_index": base_foresight["risk_index"]
            }
        }
