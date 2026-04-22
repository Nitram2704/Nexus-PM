from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Project, Column, Task, TaskHistory
from .serializers import ProjectSerializer, ColumnSerializer, TaskSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["patch"], url_path="move")
    def move_task(self, request, pk=None):
        task = self.get_object()
        new_column_id = request.data.get("column_id")
        new_order = request.data.get("order")

        if not new_column_id:
            return Response({"detail": "column_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        new_column = get_object_or_404(Column, id=new_column_id, project=task.project)
        old_column_name = task.column.name

        # Registrar en el historial si la columna cambió
        if task.column != new_column:
            TaskHistory.objects.create(
                task=task,
                user=request.user,
                field="column",
                old_value=old_column_name,
                new_value=new_column.name
            )
            task.column = new_column

        if new_order is not None:
            task.order = new_order

        task.save()
        return Response(TaskSerializer(task).data)
