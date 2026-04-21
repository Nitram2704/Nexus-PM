from django.contrib import admin
from .models import LoginAttempt, User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["email", "full_name", "is_active", "is_staff", "created_at"]
    search_fields = ["email", "first_name", "last_name"]
    list_filter = ["is_active", "is_staff"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ["email", "ip_address", "succeeded", "attempted_at"]
    list_filter = ["succeeded"]
    search_fields = ["email", "ip_address"]
    readonly_fields = ["attempted_at"]
