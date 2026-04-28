from rest_framework import serializers
from .models import AIProposal

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
