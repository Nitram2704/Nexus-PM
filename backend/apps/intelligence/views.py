from rest_framework import views, status, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from ..projects.models import Project
from ..projects.permissions import IsProjectMember
from .models import AIProposal, AIGenerationLog, Recommendation
from .serializers import GenerateBacklogSerializer, AIProposalSerializer, RecommendationSerializer
from .client import BacklogAIClient
from ..tasks.models import Task

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

class GenerateRecommendationsView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        
        # Build project summary
        tasks = Task.objects.filter(project=project)
        total_tasks = tasks.count()
        done_tasks = tasks.filter(column__is_done_column=True).count()
        
        summary = f"Proyecto: {project.name}. Total tareas: {total_tasks}, Completadas: {done_tasks}."
        if total_tasks > 0:
            summary += " Tareas recientes: " + ", ".join([t.title for t in tasks.order_by('-created_at')[:5]])
            
        client = BacklogAIClient()
        recs_data = client.generate_recommendations(summary)
        
        created_recs = []
        for rec in recs_data:
            obj = Recommendation.objects.create(
                project=project,
                title=rec.get('title', 'Recomendación'),
                description=rec.get('description', ''),
                type=rec.get('type', 'improvement')
            )
            created_recs.append(obj)
            
        # Log de generación
        AIGenerationLog.objects.create(
            project=project,
            user=request.user,
            prompt_type='recommendations_gen',
            input_text=summary,
            output_text=str(recs_data)
        )
            
        return response.Response(
            RecommendationSerializer(created_recs, many=True).data,
            status=status.HTTP_201_CREATED
        )

class RecommendationListView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        recs = Recommendation.objects.filter(project=project)
        return response.Response(RecommendationSerializer(recs, many=True).data)

class RecommendationUpdateView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def patch(self, request, project_id, pk):
        rec = get_object_or_404(Recommendation, id=pk, project_id=project_id)
        new_status = request.data.get('status')
        
        if new_status in ['pending', 'applied', 'discarded']:
            rec.status = new_status
            rec.save()
            return response.Response(RecommendationSerializer(rec).data)
            
        return response.Response({"error": "Estado inválido."}, status=status.HTTP_400_BAD_REQUEST)

class ProjectChatView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        message = request.data.get('message')
        history = request.data.get('history', [])
        
        if not message:
            return response.Response({"error": "Mensaje requerido"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Build project context
        tasks = Task.objects.filter(project=project)
        context = f"Proyecto: {project.name}. Descripción: {project.description}. "
        context += f"Tareas totales: {tasks.count()}. "
        context += "Columnas: " + ", ".join([c.name for c in project.columns.all()])
        
        client = BacklogAIClient()
        ai_response = client.chat_with_project(history, message, context)
        
        # Log de generación
        AIGenerationLog.objects.create(
            project=project,
            user=request.user,
            prompt_type='chat',
            input_text=message,
            output_text=ai_response
        )
        
        return response.Response({"response": ai_response})

class PrioritizeBacklogView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_id):
        """Genera una sugerencia de priorización"""
        project = get_object_or_404(Project, id=project_id)
        # Verificar permisos de objeto manualmente ya que es un APIView simple
        self.check_object_permissions(request, project)
        
        # Solo priorizamos tareas que NO están en sprints activos
        tasks_qs = Task.objects.filter(project=project, sprint__isnull=True)
        tasks_count = tasks_qs.count()
        
        if tasks_count < 2:
            return response.Response({
                "error": f"No hay suficientes tareas en el backlog para priorizar (encontradas: {tasks_count}). Necesitas al menos 2."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        tasks = tasks_qs.values('id', 'title', 'description', 'type', 'priority', 'story_points')
        
        # Convertir UUIDs a strings para evitar errores de serialización en el cliente de IA
        tasks_list = []
        for t in tasks:
            t_copy = dict(t)
            t_copy['id'] = str(t_copy['id'])
            tasks_list.append(t_copy)

        client = BacklogAIClient()
        try:
            suggestion = client.prioritize_backlog(tasks_list)
        except Exception as e:
            print(f"CRITICAL ERROR in AI Prioritization: {e}")
            return response.Response({"error": "Error interno al procesar la priorización."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        if not suggestion:
            return response.Response({"error": "La IA no pudo generar una sugerencia válida. Revisa los logs."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        return response.Response(suggestion)

    def post(self, request, project_id):
        """Aplica la priorización sugerida"""
        project = get_object_or_404(Project, id=project_id)
        ordered_ids = request.data.get('ordered_ids', [])
        
        if not ordered_ids:
            return response.Response({"error": "Lista de IDs requerida."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Actualizar el campo 'order' de las tareas
        for index, task_id in enumerate(ordered_ids):
            Task.objects.filter(id=task_id, project=project).update(order=index)
            
        return response.Response({"message": "Priorización aplicada correctamente."})
