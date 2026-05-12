from django.urls import path
from .views import (
    GenerateBacklogView, ImportProposalView, GenerateUserStoriesView, 
    GenerateRecommendationsView, RecommendationListView, RecommendationUpdateView,
    ProjectChatView, PrioritizeBacklogView
)

urlpatterns = [
    path('projects/<uuid:project_id>/ai/generate-backlog/', GenerateBacklogView.as_view(), name='ai-generate-backlog'),
    path('projects/<uuid:project_id>/ai/generate-user-stories/', GenerateUserStoriesView.as_view(), name='ai-generate-user-stories'),
    path('projects/<uuid:project_id>/ai/import-proposal/<uuid:proposal_id>/', ImportProposalView.as_view(), name='ai-import-proposal'),
    path('projects/<uuid:project_id>/ai/recommendations/', RecommendationListView.as_view(), name='ai-recommendations-list'),
    path('projects/<uuid:project_id>/ai/recommendations/generate/', GenerateRecommendationsView.as_view(), name='ai-recommendations-generate'),
    path('projects/<uuid:project_id>/ai/recommendations/<uuid:pk>/', RecommendationUpdateView.as_view(), name='ai-recommendations-update'),
    path('projects/<uuid:project_id>/ai/chat/', ProjectChatView.as_view(), name='ai-chat'),
    path('projects/<uuid:project_id>/ai/prioritize-backlog/', PrioritizeBacklogView.as_view(), name='ai-prioritize-backlog'),
]
