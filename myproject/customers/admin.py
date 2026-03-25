from django.contrib import admin

from .models import AppUser, Goal


@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name", "email", "created_at")


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ("title", "frequency", "user", "created_at")
