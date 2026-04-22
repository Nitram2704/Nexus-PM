from rest_framework import serializers
from .models import Project, Column, Task, TaskHistory
from apps.accounts.serializers import UserSerializer


class TaskHistorySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskHistory
        fields = ["id", "field", "old_value", "new_value", "created_at", "user"]


class TaskSerializer(serializers.ModelSerializer):
    assignee = UserSerializer(read_only=True)
    history = TaskHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            "id", "project", "column", "title", "description", 
            "priority", "assignee", "creator", "order", 
            "created_at", "updated_at", "history"
        ]
        read_only_fields = ["creator", "project", "created_at", "updated_at"]


class ColumnSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)

    class Meta:
        model = Column
        fields = ["id", "name", "order", "wip_limit", "tasks"]


class ProjectSerializer(serializers.ModelSerializer):
    columns = ColumnSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Project
        fields = ["id", "name", "key", "description", "owner", "columns", "created_at"]
        read_only_fields = ["owner", "key", "created_at"]
