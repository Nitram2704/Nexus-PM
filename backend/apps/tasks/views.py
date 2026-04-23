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
