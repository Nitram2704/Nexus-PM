from rest_framework import serializers
from .models import Notification, NotificationSetting

class NotificationSerializer(serializers.ModelSerializer):
    created_at_human = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'type', 'title', 'content', 
            'link', 'is_read', 'created_at', 'created_at_human'
        ]
        read_only_fields = ['id', 'created_at']

    def get_created_at_human(self, obj):
        # Simplistic relative time or formatted string
        return obj.created_at.strftime("%d %b, %H:%M")

class NotificationSettingSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSetting
        fields = ['task_assigned', 'task_moved', 'task_comment', 'custom_alert', 'expiration']

