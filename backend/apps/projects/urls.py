from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ProjectViewSet, ColumnViewSet

router = SimpleRouter()
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'columns', ColumnViewSet, basename='column')

urlpatterns = [
    path('', include(router.urls)),
]
