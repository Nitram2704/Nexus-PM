from rest_framework import serializers
from .models import Task, Sprint, Comment
from apps.projects.models import Member, Column, Project
from django.contrib.auth import get_user_model

User = get_user_model()

class SprintSerializer(serializers.ModelSerializer):
    task_count = serializers.IntegerField(source='tasks.count', read_only=True)
    completed_count = serializers.SerializerMethodField()

    class Meta:
        model = Sprint
        fields = [
            'id', 'project', 'name', 'goal', 'status', 
            'start_date', 'end_date', 'task_count', 'completed_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def get_completed_count(self, obj):
        return obj.tasks.filter(column__is_done_column=True).count()

class TaskSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='column.name', read_only=True)
    creator_email = serializers.EmailField(source='creator.email', read_only=True)
    assignee_email = serializers.EmailField(source='assignee.email', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'project', 'sprint', 'column', 'title', 'description', 'key',
            'type', 'priority', 'status', 'assignee', 'assignee_email',
            'creator', 'creator_email', 'story_points', 'parent',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['key', 'creator', 'created_at', 'updated_at']

    def validate(self, data):
        # Para PATCH, tomamos los valores actuales de la instancia si no vienen en data
        project = data.get('project') or (self.instance.project if self.instance else None)
        assignee = data.get('assignee')
        column = data.get('column')
        sprint = data.get('sprint')

        # Validar que el sprint pertenezca al proyecto
        if sprint:
            if sprint.project != project:
                raise serializers.ValidationError({
                    "sprint": "El sprint seleccionado no pertenece a este proyecto."
                })

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

class CommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source='author.email', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'task', 'author', 'author_email', 'content', 'created_at']
        read_only_fields = ['author', 'created_at']
