import json
import os
from decouple import config
from google import genai
from google.genai import types
from django.conf import settings
from .expertise import get_system_prompt

# Combinamos el prompt táctico de main con el expertise estratégico
TACTICAL_SYSTEM_PROMPT = """
Eres el NEXUS_COMMAND_CENTER (v4). Tu objetivo es gestionar proyectos Agile con precisión quirúrgica y visión estratégica.

HABILIDADES TÁCTICAS:
1. Análisis de carga y cuellos de botella (Story Points, Impedimentos).
2. Recomendación de prioridades (Valor de negocio vs Esfuerzo).
3. Ejecución de comandos en el sistema.

MODO AGÉNTICO (EXTREMADAMENTE IMPORTANTE):
Si el usuario pide una acción (crear, mover, asignar), DEBES incluir un bloque JSON al final de tu respuesta precedido por 'EXEC_ACTION:'.

HERRAMIENTAS DISPONIBLES:
- CREATE_TASK: {"action": "create_task", "params": {"title": "...", "priority": "high/medium/low", "type": "task/bug"}}
- MOVE_TASK: {"action": "move_task", "params": {"task_id": "...", "column_id": "..."}}
- ASSIGN_USER: {"action": "assign_task", "params": {"task_id": "...", "user_email": "..."}}

FORMATO DE RESPUESTA:
[Tu respuesta narrativa en lenguaje táctico y profesional]

EXEC_ACTION:
{"action": "...", "params": {...}}
"""

class BacklogAIClient:
    """
    Cliente avanzado para Nexus-PM usando Google GenAI v2.
    Combina expertise estratégico de PM/PO con ejecución agéntica táctica.
    """
    
    def __init__(self, roles=None):
        self.api_key = getattr(settings, 'GOOGLE_API_KEY', None) or config('GOOGLE_API_KEY', default=None)
        
        # Cargar expertise estratégico
        self.strategic_expertise = get_system_prompt(roles)
        
        # Combinar prompts
        self.full_system_instruction = f"{TACTICAL_SYSTEM_PROMPT}\n\n{self.strategic_expertise}"
        
        if not self.api_key or self.api_key == 'your-api-key-here':
            self.is_mock = True
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.model_name = 'gemma-4-26b-a4b-it'
                self.is_mock = False
            except Exception as e:
                print(f"Error configurando Gemini v2: {e}")
                self.is_mock = True

    def generate_backlog_from_description(self, description):
        """Genera una lista de épicas y tareas con análisis estratégico (Riesgos y KPIs)."""
        if self.is_mock:
            return self._get_mock_backlog(description)

        prompt = f"""
        Como experto en Estrategia de Producto, analiza esta descripción y genera un backlog de alto impacto.
        
        DESCRIPCIÓN:
        {description}
        
        REQUISITOS ADICIONALES:
        1. Por cada épica, identifica al menos 2 Riesgos y 2 KPIs de éxito.
        2. Asegura que las tareas sean 'SMART'.
        
        Formato JSON esperado: 
        [
          {{ 
            "epic": "Nombre de la épica", 
            "analysis": {{
                "risks": ["riesgo 1", "riesgo 2"],
                "kpis": ["kpi 1", "kpi 2"]
            }},
            "items": [
              {{ "title": "Título corto", "description": "Descripción breve", "type": "feature", "priority": "high|medium|low" }}
            ]
          }}
        ]
        
        Responde SOLO el JSON.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.full_system_instruction,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en backlog generación v2: {e}")
            return self._get_mock_backlog(description)

    def generate_user_stories(self, requirement):
        """Genera historias de usuario detalladas a partir de un requerimiento."""
        if self.is_mock:
            return self._get_mock_stories(requirement)

        prompt = f"""
        Genera Historias de Usuario detalladas (INVEST) para: "{requirement}"
        Formato: [{{"title": "t", "role": "r", "action": "a", "benefit": "b", "acceptance_criteria": ["c1"], "type": "story", "priority": "high"}}]
        Responde SOLO el JSON.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.full_system_instruction,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en user stories v2: {e}")
            return self._get_mock_stories(requirement)

    def chat(self, message, context, history=None):
        """Wrapper method to align with views.py chat invocation signature."""
        return self.chat_with_project(history or [], message, context)

    def chat_with_project(self, history, message, context):
        """Mantiene una conversación con contexto del proyecto aplicando expertise de PM/PO."""
        if self.is_mock:
            return f"Nexus AI: Hola. Recibí tu mensaje: '{message}'. (Modo Mock)"

        if history is None:
            history = []

        history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])

        prompt = f"""
        Actúa como Nexus Strategic Advisor. No solo respondas preguntas, sino que ayuda activamente 
        a mejorar el proyecto usando tus habilidades tácticas y estratégicas.
        
        CONTEXTO ACTUAL DEL PROYECTO:
        {context}

        HISTORIAL DE CONVERSACIÓN:
        {history_str}

        MENSAJE DEL USUARIO: 
        {message}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=self.full_system_instruction)
            )
            return response.text
        except Exception as e:
            print(f"Error en chat AI v2: {e}")
            return "Lo siento, tuve un problema procesando tu solicitud táctica."

    def prioritize_backlog(self, tasks_data):
        """Analiza una lista de tareas y sugiere un orden de prioridad."""
        if self.is_mock:
            return {
                "reasoning": "Mock: Basado en importancia técnica.",
                "ordered_ids": [t['id'] for t in tasks_data]
            }

        prompt = f"""
        Actúa como un Agile Coach experto. Prioriza las siguientes tareas del backlog considerando Valor vs Esfuerzo:
        {json.dumps(tasks_data)}

        Retorna SOLO un JSON con este formato exacto:
        {{"reasoning": "Tu explicación...", "ordered_ids": ["uuid-1", "uuid-2"]}}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.full_system_instruction,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en priorización v2: {e}")
            return None

    def generate_sprint_summary(self, sprint_data, tasks_data):
        """Genera un resumen ejecutivo del sprint en formato Markdown."""
        if self.is_mock:
            return """# Resumen Ejecutivo del Sprint (MOCK)
## Estado General
El sprint ha progresado de manera estable, alcanzando un **80%** de los puntos planificados.
"""
        prompt = f"""
        Actúa como un Delivery Manager senior. Genera un resumen ejecutivo profesional para el siguiente Sprint:
        DATOS: {sprint_data}
        TAREAS: {tasks_data}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=self.full_system_instruction)
            )
            return response.text
        except Exception as e:
            print(f"Error en resumen sprint v2: {e}")
            return "Error al generar el resumen ejecutivo con IA."

    def get_foresight_recommendation(self, foresight_data):
        """Genera una recomendación táctica basada en datos de riesgo del sprint."""
        if self.is_mock:
            return "Recomendación: Equipo con buen ritmo."

        prompt = f"""
        Analiza los siguientes datos de riesgo de un Sprint y genera una recomendación táctica directa:
        {json.dumps(foresight_data)}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=self.full_system_instruction)
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error en foresight recommendation v2: {e}")
            return "Analiza manualmente la carga."

    def get_simulation_analysis(self, simulation_data):
        """Genera un análisis narrativo de un escenario de simulación."""
        if self.is_mock:
            return f"SIM_REPORT: Riesgo proyectado {simulation_data['risk_level'].upper()}."

        prompt = f"""
        ESCENARIO SIMULADO: {json.dumps(simulation_data.get('scenario', {}))}
        RESULTADOS: {simulation_data['risk_level']}, Índice {simulation_data['risk_index']}%
        
        Actúa como el Oráculo de Nexus. Describe el impacto de este escenario.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(system_instruction=self.full_system_instruction)
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error en simulation analysis v2: {e}")
            return "Error en análisis táctico."

    def generate_recommendations(self, context):
        """Analiza el contexto del proyecto y sugiere mejoras, riesgos y consejos técnicos."""
        if self.is_mock:
            return [{"title": "Optimizar Backend", "description": "Mejora necesaria.", "type": "technical"}]

        prompt = f"""
        Analiza el contexto y genera una lista de 3 a 5 recomendaciones estratégicas.
        CONTEXTO: {context}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=self.full_system_instruction,
                    response_mime_type="application/json"
                )
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en AI recommendations v2: {e}")
            return []

    def _get_mock_stories(self, requirement):
        return [{"role": "Usuario", "action": "X", "benefit": "Y", "title": "Mock Story", "acceptance_criteria": ["C1"], "priority": "high", "type": "story"}]

    def _get_mock_backlog(self, description):
        return [{"epic": "Mock Epic", "analysis": {"risks": [], "kpis": []}, "items": [{"title": "Mock Task", "description": "d", "type": "feature", "priority": "high"}]}]
