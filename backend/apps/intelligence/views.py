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

class GenerateUserStoriesView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        serializer = GenerateBacklogSerializer(data=request.data)
        
        if serializer.is_valid():
            description = serializer.validated_data['description']
            client = BacklogAIClient()
            
            # Generar propuesta de Historias de Usuario
            proposal_data = client.generate_user_stories(description)
            
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
                prompt_type='story_gen',
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
        
        # Soportamos tanto indices como objetos completos (si el usuario editó)
        selected_items = request.data.get('items', [])
        selected_indices = request.data.get('selected_indices', [])
        tasks_created = 0

        # Si vienen items completos (editados en el frontend)
        if selected_items:
            for item in selected_items:
                self._create_task(proposal, item, request.user)
                tasks_created += 1
        # Si vienen solo índices (formato original)
        elif selected_indices:
            for key in selected_indices:
                try:
                    # Caso 1: Formato eIdx-iIdx (Backlog por épicas)
                    if '-' in str(key):
                        e_idx, i_idx = map(int, key.split('-'))
                        if e_idx < len(proposal.data):
                            epic = proposal.data[e_idx]
                            if i_idx < len(epic['items']):
                                item = epic['items'][i_idx]
                                # Formatear descripción con la épica
                                if 'epic' in epic:
                                    item['description'] = f"[{epic['epic']}] {item.get('description', '')}"
                                self._create_task(proposal, item, request.user)
                                tasks_created += 1
                    # Caso 2: Formato flat (Historias de Usuario)
                    else:
                        idx = int(key)
                        if idx < len(proposal.data):
                            item = proposal.data[idx]
                            self._create_task(proposal, item, request.user)
                            tasks_created += 1
                except (ValueError, KeyError, IndexError):
                    continue
        
        proposal.is_imported = True
        proposal.save()
        
        return response.Response({"message": f"Se crearon {tasks_created} tareas exitosamente."}, status=status.HTTP_201_CREATED)

    def _create_task(self, proposal, item, user):
        """Helper para crear una tarea a partir de un item de la IA."""
        description = item.get('description', '')
        
        # Si es formato US, construimos la descripción si no existe
        if 'role' in item and 'action' in item and 'benefit' in item:
            us_text = f"Como {item['role']}, quiero {item['action']}, para {item['benefit']}."
            description = f"{us_text}\n\n{description}".strip()

        Task.objects.create(
            project=proposal.project,
            title=item.get('title', 'Nueva Tarea'),
            description=description,
            type=item.get('type', 'task'),
            priority=item.get('priority', 'medium'),
            acceptance_criteria=item.get('acceptance_criteria', []),
            creator=user,
            column=proposal.project.columns.first()
        )
