from django.urls import path
from .views import GenerateBacklogView, ImportProposalView, GenerateUserStoriesView

urlpatterns = [
    path('projects/<uuid:project_id>/ai/generate-backlog/', GenerateBacklogView.as_view(), name='ai-generate-backlog'),
    path('projects/<uuid:project_id>/ai/generate-user-stories/', GenerateUserStoriesView.as_view(), name='ai-generate-user-stories'),
    path('projects/<uuid:project_id>/ai/import-proposal/<uuid:proposal_id>/', ImportProposalView.as_view(), name='ai-import-proposal'),
]
