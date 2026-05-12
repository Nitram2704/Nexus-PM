from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.full_name')
    task_key = serializers.ReadOnlyField(source='task.key')
    
    class Meta:
        model = Notification
        fields = [
            'id', 'title', 'message', 'task', 'task_key', 
            'actor', 'actor_name', 'is_read', 'created_at'
        ]
