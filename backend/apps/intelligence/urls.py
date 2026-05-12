from django.urls import path
from .views import (
<<<<<<< HEAD
    GenerateBacklogView, ImportProposalView, GenerateUserStoriesView, 
    GenerateRecommendationsView, RecommendationListView, RecommendationUpdateView,
    ProjectChatView, PrioritizeBacklogView
=======
    GenerateBacklogView, ImportProposalView, GenerateUserStoriesView,
    ChatView, ChatHistoryView, OrchestrateEpicView, ForesightView, SimulationView, ProposedActionView
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
)

urlpatterns = [
    path('projects/<uuid:project_id>/ai/generate-backlog/', GenerateBacklogView.as_view(), name='ai-generate-backlog'),
    path('projects/<uuid:project_id>/ai/generate-user-stories/', GenerateUserStoriesView.as_view(), name='ai-generate-user-stories'),
    path('projects/<uuid:project_id>/ai/import-proposal/<uuid:proposal_id>/', ImportProposalView.as_view(), name='ai-import-proposal'),
<<<<<<< HEAD
    path('projects/<uuid:project_id>/ai/recommendations/', RecommendationListView.as_view(), name='ai-recommendations-list'),
    path('projects/<uuid:project_id>/ai/recommendations/generate/', GenerateRecommendationsView.as_view(), name='ai-recommendations-generate'),
    path('projects/<uuid:project_id>/ai/recommendations/<uuid:pk>/', RecommendationUpdateView.as_view(), name='ai-recommendations-update'),
    path('projects/<uuid:project_id>/ai/chat/', ProjectChatView.as_view(), name='ai-chat'),
    path('projects/<uuid:project_id>/ai/prioritize-backlog/', PrioritizeBacklogView.as_view(), name='ai-prioritize-backlog'),
=======
    path('projects/<uuid:project_id>/ai/chat/', ChatView.as_view(), name='ai-chat'),
    path('projects/<uuid:project_id>/ai/chat/history/', ChatHistoryView.as_view(), name='ai-chat-history'),
    path('projects/<uuid:project_id>/ai/orchestrate/', OrchestrateEpicView.as_view(), name='ai-orchestrate-epic'),
    path('projects/<uuid:project_id>/ai/foresight/', ForesightView.as_view(), name='ai-foresight'),
    path('projects/<uuid:project_id>/ai/simulate/', SimulationView.as_view(), name='ai-simulate'),
    
    # Confirmation Hub
    path('projects/<uuid:project_id>/actions/', ProposedActionView.as_view(), name='proposed-actions-list'),
    path('projects/<uuid:project_id>/actions/<uuid:action_id>/', ProposedActionView.as_view(), name='proposed-action-detail'),
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
]
