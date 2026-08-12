from django.urls import path
from .views import (
    GenerateBacklogView, ImportProposalView, GenerateUserStoriesView,
    ChatView, ChatHistoryView, OrchestrateEpicView, ForesightView, SimulationView, ProposedActionView,
    PrioritizeBacklogView, AIRecommendationView
)

urlpatterns = [
    path('global/ai/chat/', ChatView.as_view(), name='ai-chat-global'),
    path('projects/<uuid:project_id>/ai/generate-backlog/', GenerateBacklogView.as_view(), name='ai-generate-backlog'),
    path('projects/<uuid:project_id>/ai/generate-user-stories/', GenerateUserStoriesView.as_view(), name='ai-generate-user-stories'),
    path('projects/<uuid:project_id>/ai/import-proposal/<uuid:proposal_id>/', ImportProposalView.as_view(), name='ai-import-proposal'),
    path('projects/<uuid:project_id>/ai/chat/', ChatView.as_view(), name='ai-chat'),
    path('projects/<uuid:project_id>/ai/chat/history/', ChatHistoryView.as_view(), name='ai-chat-history'),
    path('projects/<uuid:project_id>/ai/orchestrate/', OrchestrateEpicView.as_view(), name='ai-orchestrate-epic'),
    path('projects/<uuid:project_id>/ai/foresight/', ForesightView.as_view(), name='ai-foresight'),
    path('projects/<uuid:project_id>/ai/simulate/', SimulationView.as_view(), name='ai-simulate'),
    path('projects/<uuid:project_id>/ai/prioritize/', PrioritizeBacklogView.as_view(), name='ai-prioritize'),
    path('projects/<uuid:project_id>/ai/recommendations/', AIRecommendationView.as_view(), name='ai-recommendations'),

    # Confirmation Hub
    path('projects/<uuid:project_id>/actions/', ProposedActionView.as_view(), name='proposed-actions-list'),
    path('projects/<uuid:project_id>/actions/<uuid:action_id>/', ProposedActionView.as_view(), name='proposed-action-detail'),
]
