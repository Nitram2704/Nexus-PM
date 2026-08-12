from django.db import models
from django.conf import settings
from ..projects.models import Project, Column
from django.core.exceptions import ValidationError
from django.utils import timezone
import uuid

class Sprint(models.Model):
    STATUS_CHOICES = [
        ('planning', 'Planificación'),
        ('active', 'Activo'),
        ('completed', 'Finalizado'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='sprints')
    name = models.CharField(max_length=100)
    goal = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    
    start_date = models.DateTimeField(null=True, blank=True)
    end_date = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.status}) - {self.project.name}"

    def clean(self):
        if self.status == 'active':
            active_sprints = Sprint.objects.filter(
                project=self.project, 
                status='active'
            ).exclude(id=self.id)
            if active_sprints.exists():
                raise ValidationError("Ya existe un sprint activo para este proyecto.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class Task(models.Model):
    TYPE_CHOICES = [
        ('feature', 'Característica'),
        ('bug', 'Error'),
        ('task', 'Tarea'),
        ('story', 'Historia de Usuario'),
    ]

    PRIORITY_CHOICES = [
        ('high', 'Alta'),
        ('medium', 'Media'),
        ('low', 'Baja'),
    ]

    AI_AGENT_CHOICES = [
        ('orchestrator', 'Orchestrator'),
        ('backend_architect', 'Backend Architect'),
        ('frontend_specialist', 'Frontend Specialist'),
        ('database_expert', 'Database Expert'),
        ('ui_designer', 'UI Designer'),
        ('product_manager', 'Product Manager'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    sprint = models.ForeignKey(Sprint, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    column = models.ForeignKey(Column, on_delete=models.SET_NULL, null=True, related_name='tasks')
    
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    key = models.CharField(max_length=20, unique=True, editable=False)
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='task')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    acceptance_criteria = models.JSONField(default=list, blank=True)
    
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='assigned_tasks'
    )
    ai_assignee = models.CharField(
        max_length=50, 
        choices=AI_AGENT_CHOICES, 
        blank=True, 
        null=True,
        help_text="If assigned to an AI agent, specify the agent role."
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='created_tasks'
    )
    
    story_points = models.PositiveIntegerField(default=0)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subtasks'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', '-created_at']

    def __str__(self):
        return f"[{self.key}] {self.title}"

    def save(self, *args, **kwargs):
        # Auto-generate key if not set (e.g. NEX-1, NEX-2)
        if not self.key and self.project:
            prefix = self.project.key
            existing = Task.objects.filter(project=self.project).order_by('-created_at').values_list('key', flat=True).first()
            if existing and existing.startswith(f"{prefix}-"):
                try:
                    next_num = int(existing.split('-', 1)[1]) + 1
                except (ValueError, IndexError):
                    next_num = 1
            else:
                next_num = 1
            self.key = f"{prefix}-{next_num}"

        # Set completed_at if moved to done column
        if self.column and self.column.is_done_column:
            if not self.completed_at:
                self.completed_at = timezone.now()
        else:
            self.completed_at = None

        super().save(*args, **kwargs)

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='task_comments'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.author.email} on {self.task.key}"
