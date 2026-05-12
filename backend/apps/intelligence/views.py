from rest_framework import views, status, response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
<<<<<<< HEAD
from ..projects.models import Project
from ..projects.permissions import IsProjectMember
from .models import AIProposal, AIGenerationLog, Recommendation
from .serializers import GenerateBacklogSerializer, AIProposalSerializer, RecommendationSerializer
from .client import BacklogAIClient
from ..tasks.models import Task
=======
import json
from apps.projects.models import Project
from apps.projects.permissions import IsProjectMember
from django.db import models

from .models import AIProposal, AIGenerationLog, AIConversation, AIMessage, ProposedAction
from .serializers import (
    GenerateBacklogSerializer, AIProposalSerializer, AIMessageSerializer, 
    ChatInputSerializer, ProposedActionSerializer
)
from .client import BacklogAIClient
from .agents.orchestrator import AgentOrchestrator
from .foresight import ForesightEngine
from apps.tasks.models import Task
from apps.notifications.models import Notification
import threading

class ChatView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        # Support for global chat or specific project
        project = None
        if project_id != 'global':
            project = get_object_or_404(Project, id=project_id)
            # Check permissions only if project exists
            self.check_object_permissions(request, project)
        
        serializer = ChatInputSerializer(data=request.data)
        
        if serializer.is_valid():
            content = serializer.validated_data['content']
            
            # Get or create conversation (Global conversations use project=None)
            conversation, _ = AIConversation.objects.get_or_create(
                project=project,
                user=request.user
            )
            
            # Save user message
            AIMessage.objects.create(
                conversation=conversation,
                role='user',
                content=content
            )
            
            # Build context (Project-specific or Global)
            if project:
                context = self._build_context(project)
            else:
                context = self._build_global_context(request.user)
            
            # Fetch last 10 messages for history
            history_qs = conversation.messages.all().order_by('-created_at')[1:11]
            history = [{'role': m.role, 'content': m.content} for m in reversed(list(history_qs))]

            # Call AI
            client = BacklogAIClient()
            ai_response_text = client.chat(content, context, history=history)
            
            # Detect EXEC_ACTION
            action_metadata = None
            if 'EXEC_ACTION:' in ai_response_text:
                parts = ai_response_text.split('EXEC_ACTION:')
                ai_response_text = parts[0].strip()
                try:
                    action_metadata = json.loads(parts[1].strip())
                except:
                    pass

            # Save AI response
            ai_msg = AIMessage.objects.create(
                conversation=conversation,
                role='assistant',
                content=ai_response_text,
                action_metadata=action_metadata
            )
            
            # If there's an action, create a ProposedAction entry
            if action_metadata:
                ProposedAction.objects.create(
                    project=project,
                    user=request.user,
                    message=ai_msg,
                    action_type=action_metadata.get('action', 'UNKNOWN'),
                    params=action_metadata.get('params', {}),
                    status='PENDING'
                )
            
            conversation.save()
            return response.Response(AIMessageSerializer(ai_msg).data, status=status.HTTP_201_CREATED)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        return response.Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def _build_context(self, project):
        tasks = project.tasks.all()
        active_sprint = project.sprints.filter(status='active').first()
        
        # User Workload
        user_workload = tasks.values('assignee__first_name', 'assignee__email').annotate(
            count=models.Count('id'),
            points=models.Sum('story_points')
        )
        
        load_summary = []
        for uw in user_workload:
            name = uw['assignee__first_name'] or uw['assignee__email'] or "Sin asignar"
            load_summary.append(f"- {name}: {uw['count']} tareas ({uw['points'] or 0} pts)")

        # Column Distribution (Bottlenecks)
        col_dist = tasks.values('column__name').annotate(count=models.Count('id'))
        bottlenecks = [f"- {c['column__name']}: {c['count']}" for c in col_dist]

        # Recent Activity (last 5 movements/creations)
        # Assuming Task model has a history or just use last created/updated
        recent_tasks = tasks.order_by('-updated_at')[:5]
        activity = [f"- {t.title}: {t.column.name} (Modificado {t.updated_at.strftime('%H:%M')})" for t in recent_tasks]

        context = f"""
        PROYECTO: {project.name} ({project.key})
        SPRINT ACTIVO: {active_sprint.name if active_sprint else 'Ninguno'}
        
        ACTIVIDAD RECIENTE:
        {chr(10).join(activity)}

        DISTRIBUCIÓN DE CARGA POR EQUIPO:
        {chr(10).join(load_summary)}
        
        ESTADO DEL TABLERO (COLUMNAS):
        {chr(10).join(bottlenecks)}
        
        RESUMEN TOTAL:
        - Tareas totales: {tasks.count()}
        - Tareas completadas: {tasks.filter(column__name__icontains='done').count() or tasks.filter(column__name__icontains='completado').count()}
        - Tareas en progreso: {tasks.filter(column__name__icontains='progreso').count() or tasks.filter(column__name__icontains='progress').count()}
        """
        return context

    def _build_global_context(self, user):
        projects = Project.objects.filter(members=user)
        project_summaries = []
        
        for p in projects:
            task_count = p.tasks.count()
            done_count = p.tasks.filter(column__name__icontains='done').count() or p.tasks.filter(column__name__icontains='completado').count()
            project_summaries.append(f"- {p.name} ({p.key}): {task_count} tareas, {done_count} completadas.")

        context = f"""
        CONTEXTO_GLOBAL: El usuario no tiene un proyecto seleccionado actualmente (Dashboard).
        
        PROYECTOS_DEL_USUARIO:
        {chr(10).join(project_summaries)}
        
        INSTRUCCIÓN: Responde de forma general sobre el estado de su portafolio o asiste en la selección de un proyecto.
        """
        return context

class ChatHistoryView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        conversation = AIConversation.objects.filter(project=project, user=request.user).first()
        
        if not conversation:
            return response.Response([], status=status.HTTP_200_OK)
            
        messages = conversation.messages.all().order_by('created_at')
        return response.Response(AIMessageSerializer(messages, many=True).data)
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5

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

<<<<<<< HEAD
class GenerateRecommendationsView(views.APIView):
=======
class OrchestrateEpicView(views.APIView):
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        
<<<<<<< HEAD
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
=======
        # We assume the user passes {"epic_description": "We need a dashboard"}
        epic_description = request.data.get('epic_description')
        if not epic_description:
            return response.Response({"error": "epic_description is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # Spin up a thread to avoid blocking the HTTP request
        user = request.user
        def run_orchestration():
            orchestrator = AgentOrchestrator()
            tasks_data = orchestrator.orchestrate_epic(epic_description)
            
            # Auto-save tasks
            column = project.columns.first()
            created_count = 0
            for t in tasks_data:
                Task.objects.create(
                    project=project,
                    title=t.get('title', 'AI Proposed Task'),
                    description=t.get('description', ''),
                    type=t.get('type', 'task'),
                    priority=t.get('priority', 'medium'),
                    creator=user,
                    column=column,
                    ai_assignee=t.get('ai_assignee')
                )
                created_count += 1
            
            # Send Notification via Database (which the SSE stream picks up!)
            Notification.objects.create(
                user=user,
                type='success',
                title='Agentes Finalizaron',
                content=f'La orquestación de "{epic_description[:20]}..." completó. {created_count} tareas fueron añadidas al backlog.'
            )

        thread = threading.Thread(target=run_orchestration)
        thread.start()

        return response.Response({"message": "Orchestration started. You will be notified when complete."}, status=status.HTTP_202_ACCEPTED)

class ForesightView(views.APIView):
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
<<<<<<< HEAD
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
=======
        engine = ForesightEngine(project)
        foresight_data = engine.get_sprint_foresight()
        
        # Generar recomendación de IA si el riesgo es alto o si el usuario lo solicita implícitamente
        ai_client = BacklogAIClient()
        recommendation = ai_client.get_foresight_recommendation(foresight_data)
        foresight_data['ai_recommendation'] = recommendation

        return response.Response(foresight_data)

class SimulationView(views.APIView):
>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
    permission_classes = [IsAuthenticated, IsProjectMember]

    def post(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
<<<<<<< HEAD
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
=======
        
        capacity = float(request.data.get('capacity', 1.0))
        scope = float(request.data.get('scope', 1.0))
        deadline_shift = int(request.data.get('deadline_shift', 0))
        
        engine = ForesightEngine(project)
        simulation_data = engine.run_simulation(
            capacity_multiplier=capacity,
            scope_multiplier=scope,
            deadline_shift_days=deadline_shift
        )
        
        ai_client = BacklogAIClient()
        simulation_data['ai_analysis'] = ai_client.get_simulation_analysis(simulation_data)
        
        return response.Response(simulation_data)

class ProposedActionView(views.APIView):
    permission_classes = [IsAuthenticated, IsProjectMember]

    def get(self, request, project_id):
        project = get_object_or_404(Project, id=project_id)
        actions = ProposedAction.objects.filter(project=project, status='PENDING')
        return response.Response(ProposedActionSerializer(actions, many=True).data)

    def post(self, request, project_id, action_id):
        project = get_object_or_404(Project, id=project_id)
        action = get_object_or_404(ProposedAction, id=action_id, project=project)
        
        approve = request.data.get('approve', True)
        
        if not approve:
            action.status = 'REJECTED'
            action.save()
            return response.Response({"status": "REJECTED"})

        # Execute Action
        try:
            if action.action_type == 'CREATE_TASK':
                params = action.params
                Task.objects.create(
                    project=project,
                    title=params.get('title', 'AI Task'),
                    description=params.get('description', ''),
                    type=params.get('type', 'task'),
                    priority=params.get('priority', 'medium'),
                    creator=request.user,
                    column=project.columns.first()
                )
            
            action.status = 'EXECUTED'
            action.save()
            return response.Response({"status": "EXECUTED"})
        except Exception as e:
            return response.Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

>>>>>>> 75dcd634406652f743a9e246acf56553516793f5
