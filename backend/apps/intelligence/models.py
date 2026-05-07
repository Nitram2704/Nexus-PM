from django.db import models
from django.conf import settings
from apps.projects.models import Project
import uuid

class AIGenerationLog(models.Model):
    """
    Registra las peticiones a la IA para auditoría y control de costos.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ai_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    prompt_type = models.CharField(max_length=50) # 'backlog_gen', 'story_refine', etc.
    input_text = models.TextField()
    output_text = models.TextField(blank=True, null=True)
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class AIProposal(models.Model):
    """
    Almacena una propuesta de la IA (un conjunto de tareas sugeridas) 
    para que el usuario las revise y elija cuáles importar.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ai_proposals')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    description = models.TextField(help_text="Descripción que originó la propuesta")
    data = models.JSONField(help_text="Lista de tareas sugeridas en formato JSON")
    is_imported = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Propuesta para {self.project.name} - {self.created_at.date()}"

class AIConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='ai_conversations')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

class AIMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(AIConversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=[('user', 'User'), ('assistant', 'Assistant')])
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
