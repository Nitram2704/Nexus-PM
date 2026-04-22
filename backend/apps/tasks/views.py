from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer, TaskMoveSerializer
from apps.projects.permissions import IsProjectMember
from django_filters.rest_framework import DjangoFilterBackend

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['project', 'column', 'assignee', 'type', 'priority']

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
