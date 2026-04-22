from rest_framework import serializers
from .models import Project, Member, Column
from django.contrib.auth import get_user_model

User = get_user_model()

class MemberSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Member
        fields = ['id', 'user', 'user_email', 'user_name', 'role', 'joined_at']
        read_only_fields = ['joined_at']


class ColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = Column
        fields = ['id', 'name', 'position', 'is_done_column']


class ProjectSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'key', 'description', 'is_archived', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_key(self, value):
        return value.upper()

    def create(self, validated_data):
        # El owner se asigna en la vista para mayor claridad
        project = Project.objects.create(**validated_data)
        return project


class ProjectDetailSerializer(ProjectSerializer):
    members = MemberSerializer(many=True, read_only=True)
    columns = ColumnSerializer(many=True, read_only=True)

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + ['members', 'columns']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=Member.ROLE_CHOICES[1:]) # No permite invitar como 'owner'

    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("El usuario con este correo no existe en la plataforma.")
        return value
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
