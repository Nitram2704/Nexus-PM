from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import TaskViewSet, SprintViewSet

router = SimpleRouter()
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'sprints', SprintViewSet, basename='sprint')

urlpatterns = [
    path('', include(router.urls)),
]
