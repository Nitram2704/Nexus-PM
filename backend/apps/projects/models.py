from django.db import models
from django.conf import settings


class Project(models.Model):
    name = models.CharField(max_length=100)
    key = models.CharField(max_length=10, unique=True)  # Ej: NEX, PROJ
    description = models.TextField(blank=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="owned_projects"
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name="projects", 
        through="ProjectMember"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.key})"


class ProjectMember(models.Model):
    ROLE_CHOICES = [
        ("OWNER", "Owner"),
        ("ADMIN", "Admin"),
        ("MEMBER", "Member"),
        ("VIEWER", "Viewer"),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="MEMBER")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("project", "user")


class Column(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="columns")
    name = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=0)
    wip_limit = models.PositiveIntegerField(default=0)  # 0 = no limit

    class Meta:
        ordering = ["order"]
        unique_together = ("project", "order")

    def __str__(self):
        return f"{self.name} ({self.project.key})"


class Task(models.Model):
    PRIORITY_CHOICES = [
        ("LOW", "Low"),
        ("MEDIUM", "Medium"),
        ("HIGH", "High"),
        ("URGENT", "Urgent"),
    ]
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="tasks")
    column = models.ForeignKey(Column, on_delete=models.CASCADE, related_name="tasks")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default="MEDIUM")
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="assigned_tasks"
    )
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name="created_tasks"
    )
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"[{self.project.key}] {self.title}"


class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="history")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    field = models.CharField(max_length=50)  # Ej: 'column'
    old_value = models.TextField(blank=True, null=True)
    new_value = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Task histories"
        ordering = ["-created_at"]
