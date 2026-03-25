from rest_framework import viewsets

from .models import AppUser, Goal
from .serializers import AppUserSerializer, GoalSerializer


class AppUserViewSet(viewsets.ModelViewSet):
    queryset = AppUser.objects.all().order_by("-created_at")
    serializer_class = AppUserSerializer


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer

    def get_queryset(self):
        queryset = Goal.objects.select_related("user").all().order_by("-created_at")
        user_id = self.request.query_params.get("user_id")
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        return queryset
