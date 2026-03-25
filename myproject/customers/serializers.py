from rest_framework import serializers
from .models import AppUser, Goal


class AppUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = "__all__"


class GoalSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Goal
        fields = "__all__"

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"