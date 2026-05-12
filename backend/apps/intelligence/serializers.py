from rest_framework import serializers

from .models import AIProposal, AIMessage, ProposedAction

class ProposedActionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProposedAction
        fields = ['id', 'action_type', 'params', 'status', 'created_at']

class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ['id', 'role', 'content', 'action_metadata', 'created_at']

class ChatInputSerializer(serializers.Serializer):
    content = serializers.CharField()


class GenerateBacklogSerializer(serializers.Serializer):
    description = serializers.CharField(min_length=10, max_length=1000)

class AIStoryProposalSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    type = serializers.ChoiceField(choices=['feature', 'bug', 'task', 'story'])
    priority = serializers.ChoiceField(choices=['high', 'medium', 'low'])

class AIProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIProposal
        fields = ['id', 'description', 'data', 'created_at', 'is_imported']


