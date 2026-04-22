from rest_framework import serializers
from .models import Task
from apps.projects.models import Member, Column
from django.contrib.auth import get_user_model

User = get_user_model()

class TaskSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='column.name', read_only=True)
    creator_email = serializers.EmailField(source='creator.email', read_only=True)
    assignee_email = serializers.EmailField(source='assignee.email', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'column', 'title', 'description', 'key',
            'type', 'priority', 'status', 'assignee', 'assignee_email',
            'creator', 'creator_email', 'story_points', 'parent',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['key', 'creator', 'created_at', 'updated_at']

    def validate(self, data):
        project = data.get('project')
        assignee = data.get('assignee')
        column = data.get('column')

        # Validar que el assignee sea miembro del proyecto
        if assignee:
            if not Member.objects.filter(project=project, user=assignee).exists():
                raise serializers.ValidationError({
                    "assignee": "El usuario asignado debe ser miembro del proyecto."
                })

        # Validar que la columna pertenezca al proyecto
        if column:
            if column.project != project:
                raise serializers.ValidationError({
                    "column": "La columna seleccionada no pertenece a este proyecto."
                })

        return data

class TaskMoveSerializer(serializers.Serializer):
    column = serializers.PrimaryKeyRelatedField(queryset=Column.objects.all())

    def validate_column(self, value):
        task = self.context.get('task')
        if value.project != task.project:
            raise serializers.ValidationError("La columna no pertenece al proyecto de la tarea.")
        return value
