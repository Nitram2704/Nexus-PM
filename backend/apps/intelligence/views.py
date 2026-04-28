from rest_framework import views, status, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.projects.models import Project
from apps.projects.permissions import IsProjectMember
from .models import AIProposal, AIGenerationLog
from .serializers import GenerateBacklogSerializer, AIProposalSerializer
from .client import BacklogAIClient
from apps.tasks.models import Task

class GenerateBacklogView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        serializer = GenerateBacklogSerializer(data=request.data)
        
        if serializer.is_valid():
            description = serializer.validated_data['description']
            client = BacklogAIClient()
            
            # Generar propuesta
            proposal_data = client.generate_backlog(description)
            
            # Guardar propuesta en BD
            proposal = AIProposal.objects.create(
                project=project,
                user=request.user,
                description=description,
                data=proposal_data
            )
            
            # Log de generación
            AIGenerationLog.objects.create(
                project=project,
                user=request.user,
                prompt_type='backlog_gen',
                input_text=description,
                output_text=str(proposal_data)
            )
            
            return response.Response(AIProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImportProposalView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id, proposal_id):
        proposal = get_object_or_404(AIProposal, id=proposal_id, project_id=project_id)
        
        if proposal.is_imported:
            return response.Response({"error": "Esta propuesta ya fue importada."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Format of selected_indices: ["epicIdx-itemIdx", ...]
        selected_keys = request.data.get('selected_indices', [])
        tasks_created = 0
        
        for key in selected_keys:
            try:
                e_idx, i_idx = map(int, key.split('-'))
                if e_idx < len(proposal.data):
                    epic = proposal.data[e_idx]
                    if i_idx < len(epic['items']):
                        item = epic['items'][i_idx]
                        Task.objects.create(
                            project=proposal.project,
                            title=item['title'],
                            description=f"[{epic['epic']}] {item['description']}",
                            type=item['type'],
                            priority=item['priority'],
                            creator=request.user,
                            column=proposal.project.columns.first()
                        )
                        tasks_created += 1
            except (ValueError, KeyError, IndexError):
                continue
        
        proposal.is_imported = True
        proposal.save()
        
        return response.Response({"message": f"Se crearon {tasks_created} tareas exitosamente."}, status=status.HTTP_201_CREATED)
