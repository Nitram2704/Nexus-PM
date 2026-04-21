from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.conf import settings


class User(AbstractUser):
    """Custom user model extending Django's AbstractUser."""

    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True, default="")
    avatar = models.URLField(blank=True, default="")  # URL to avatar (Gravatar, etc.)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name"]

    class Meta:
        db_table = "users"
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.email


class LoginAttempt(models.Model):
    """Track failed login attempts for rate limiting."""

    email = models.EmailField(db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    attempted_at = models.DateTimeField(auto_now_add=True)
    succeeded = models.BooleanField(default=False)

    class Meta:
        db_table = "login_attempts"
        ordering = ["-attempted_at"]

    @classmethod
    def is_locked(cls, email: str) -> bool:
        """Return True if the email has ≥5 failed attempts in the last 15 minutes."""
        max_attempts = getattr(settings, "LOGIN_MAX_ATTEMPTS", 5)
        lockout_minutes = getattr(settings, "LOGIN_LOCKOUT_MINUTES", 15)
        window = timezone.now() - timedelta(minutes=lockout_minutes)

        failed_count = cls.objects.filter(
            email=email,
            succeeded=False,
            attempted_at__gte=window,
        ).count()

        return failed_count >= max_attempts

    @classmethod
    def lockout_remaining_seconds(cls, email: str) -> int:
        """Return seconds remaining until lockout expires."""
        lockout_minutes = getattr(settings, "LOGIN_LOCKOUT_MINUTES", 15)
        window = timezone.now() - timedelta(minutes=lockout_minutes)

        oldest_failed = (
            cls.objects.filter(
                email=email,
                succeeded=False,
                attempted_at__gte=window,
            )
            .order_by("attempted_at")
            .first()
        )

        if not oldest_failed:
            return 0

        unlock_at = oldest_failed.attempted_at + timedelta(minutes=lockout_minutes)
        remaining = (unlock_at - timezone.now()).total_seconds()
        return max(0, int(remaining))

    @classmethod
    def record(cls, email: str, ip_address: str | None, succeeded: bool) -> None:
        cls.objects.create(email=email, ip_address=ip_address, succeeded=succeeded)

    @classmethod
    def clear_failed(cls, email: str) -> None:
        """Clear all failed attempts after a successful login."""
        cls.objects.filter(email=email, succeeded=False).delete()
