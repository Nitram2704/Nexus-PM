from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task, Sprint, Comment
from .serializers import TaskSerializer, TaskMoveSerializer, SprintSerializer, CommentSerializer
from apps.projects.permissions import IsProjectMember
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

class SprintViewSet(viewsets.ModelViewSet):
    queryset = Sprint.objects.all()
    serializer_class = SprintSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'status']

    def get_queryset(self):
        return Sprint.objects.filter(project__members__user=self.request.user).distinct()

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        sprint = self.get_object()
        if sprint.status != 'planning':
            return Response({"error": "Solo se pueden iniciar sprints en estado de planificación."}, status=status.HTTP_400_BAD_REQUEST)
        
        sprint.status = 'active'
        sprint.start_date = timezone.now()
        try:
            sprint.save()
            return Response(SprintSerializer(sprint).data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        sprint = self.get_object()
        if sprint.status != 'active':
            return Response({"error": "Solo se pueden finalizar sprints activos."}, status=status.HTTP_400_BAD_REQUEST)
        
        action_type = request.data.get('incomplete_action', 'backlog')
        sprint.status = 'completed'
        sprint.end_date = timezone.now()
        sprint.save()

        # Manejo de tareas incompletas
        incomplete_tasks = sprint.tasks.exclude(column__is_done_column=True)
        if action_type == 'backlog':
            incomplete_tasks.update(sprint=None)
        
        return Response(SprintSerializer(sprint).data)

    @action(detail=True, methods=['get'])
    def burndown(self, request, pk=None):
        """
        Retorna los datos del Burndown Chart para el sprint.
        Solo accesible para Propietarios y Administradores.
        """
        sprint = self.get_object()
        
        # Verificar permisos de rol (HU-32)
        from apps.projects.models import Member
        try:
            member = Member.objects.get(project=sprint.project, user=request.user)
            if member.role not in ['owner', 'admin']:
                return Response(
                    {"error": "No tienes permiso para ver reportes. Se requiere rol Admin o Propietario."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except Member.DoesNotExist:
            return Response({"error": "No eres miembro de este proyecto."}, status=status.HTTP_403_FORBIDDEN)

        if not sprint.start_date or not sprint.end_date:
            return Response({"error": "El sprint debe tener fechas de inicio y fin definidas para generar el burndown."}, status=status.HTTP_400_BAD_REQUEST)

        from django.db.models import Sum
        from datetime import timedelta
        
        total_points = sprint.tasks.aggregate(total=Sum('story_points'))['total'] or 0
        
        days = []
        current_date = sprint.start_date.date()
        end_date = sprint.end_date.date()
        
        # Generar lista de días del sprint
        temp_date = current_date
        while temp_date <= end_date:
            days.append(temp_date)
            temp_date += timedelta(days=1)
            
        data = []
        total_days = len(days) - 1
        
        for i, day in enumerate(days):
            completed_points = sprint.tasks.filter(
                completed_at__date__lte=day,
                column__is_done_column=True
            ).aggregate(total=Sum('story_points'))['total'] or 0
            
            actual = total_points - completed_points
            ideal = total_points - (total_points * (i / total_days)) if total_days > 0 else 0
            
            data.append({
                "day": day.strftime('%d/%m'),
                "actual": actual,
                "ideal": round(ideal, 2)
            })
            
        return Response(data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Genera un resumen ejecutivo del sprint usando IA.
        Solo accesible para Propietarios y Administradores.
        """
        sprint = self.get_object()
        
        # Verificar permisos (HU-27)
        from apps.projects.models import Member
        try:
            member = Member.objects.get(project=sprint.project, user=request.user)
            if member.role not in ['owner', 'admin']:
                return Response(
                    {"error": "No tienes permiso para generar resúmenes ejecutivos."}, 
                    status=status.HTTP_403_FORBIDDEN
                )
        except Member.DoesNotExist:
            return Response({"error": "No eres miembro de este proyecto."}, status=status.HTTP_403_FORBIDDEN)

        # Preparar datos para la IA
        sprint_data = {
            "name": sprint.name,
            "goal": sprint.goal,
            "status": sprint.status,
            "start": sprint.start_date.strftime('%Y-%m-%d') if sprint.start_date else "N/A",
            "end": sprint.end_date.strftime('%Y-%m-%d') if sprint.end_date else "N/A",
        }
        
        tasks = sprint.tasks.all().select_related('column')
        tasks_data = [
            {
                "key": t.key,
                "title": t.title,
                "points": t.story_points,
                "status": t.column.name if t.column else "Desconocido",
                "is_completed": t.column.is_done_column if t.column else False
            } for t in tasks
        ]

        from apps.intelligence.client import BacklogAIClient
        ai_client = BacklogAIClient()
        summary_text = ai_client.generate_sprint_summary(sprint_data, tasks_data)
        
        return Response({"summary": summary_text})

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'sprint', 'column', 'assignee', 'type', 'priority']

    def get_queryset(self):
        # El permiso IsProjectMember ya valida el acceso, 
        # pero filtramos por seguridad adicional.
        user = self.request.user
        return Task.objects.filter(project__members__user=user).distinct()

    def perform_create(self, serializer):
        project = serializer.validated_data['project']
        # Si no se especifica columna, tomar la primera del proyecto
        column = serializer.validated_data.get('column')
        if not column:
            column = project.columns.first()
        
        serializer.save(
            creator=self.request.user,
            column=column
        )

    @action(detail=True, methods=['post'], serializer_class=TaskMoveSerializer)
    def move(self, request, pk=None):
        task = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'task': task})
        if serializer.is_valid():
            task.column = serializer.validated_data['column']
            task.save()
            return Response(TaskSerializer(task).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['task']

    def get_queryset(self):
        return Comment.objects.filter(task__project__members__user=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
