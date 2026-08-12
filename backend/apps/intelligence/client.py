import json
import os
from decouple import config
from google import genai
from google.genai import types
from django.conf import settings

SYSTEM_PROMPT = """
Eres el NEXUS_COMMAND_CENTER (v3). Tu objetivo es gestionar proyectos Agile con precisión quirúrgica.

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
[Tu respuesta narrativa en lenguaje táctico]

EXEC_ACTION:
{"action": "...", "params": {...}}
"""

class BacklogAIClient:
    """
    Cliente para interactuar con la IA (Gemini 2.5 Flash) y gestionar el flujo de trabajo de Nexus-PM.
    Usa la nueva SDK google.genai v2.
    """
    
    def __init__(self):
        self.api_key = getattr(settings, 'GOOGLE_API_KEY', None) or config('GOOGLE_API_KEY', default=None)
        if not self.api_key or self.api_key == 'your-api-key-here':
            self.is_mock = True
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.model_name = 'gemini-2.5-flash'
                self.is_mock = False
            except Exception as e:
                print(f"Error configurando Gemini v2: {e}")
                self.is_mock = True

    def generate_backlog_from_description(self, description):
        """Genera una lista de épicas y tareas basadas en una descripción del proyecto."""
        if self.is_mock:
            return self._get_mock_backlog(description)

        prompt = f"""
        Genera un backlog JSON para el proyecto: "{description}"
        Formato: [{{"epic": "nombre", "items": [{{"title": "t", "description": "d", "type": "feature", "priority": "high"}}]}}]
        Responde SOLO el JSON.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en backlog generación: {e}")
            return self._get_mock_backlog(description)

    def generate_user_stories(self, requirement):
        """Genera historias de usuario detalladas a partir de un requerimiento."""
        if self.is_mock:
            return self._get_mock_stories(requirement)

        prompt = f"""
        Genera Historias de Usuario JSON para: "{requirement}"
        Formato: [{{"title": "t", "role": "r", "action": "a", "benefit": "b", "acceptance_criteria": ["c1"], "type": "story", "priority": "high"}}]
        Responde SOLO el JSON.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en user stories: {e}")
            return self._get_mock_stories(requirement)

    def chat_with_project(self, history, message, context):
        """Mantiene una conversación con contexto del proyecto."""
        return self.chat(message, context=context, history=history)

    def chat(self, message, context="", history=None):
        """Chat agéntico con contexto del proyecto."""
        if self.is_mock:
            return f"Nexus AI: Hola. Recibí tu mensaje: '{message}'. (Modo Mock)"

        if history is None:
            history = []

        history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])

        prompt = f"""
        {SYSTEM_PROMPT}

        CONTEXTO ACTUAL DEL PROYECTO:
        {context}

        HISTORIAL DE CONVERSACIÓN:
        {history_str}

        Mensaje del usuario: {message}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
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
        Actúa como un Agile Coach experto. Prioriza las siguientes tareas del backlog:
        {json.dumps(tasks_data)}

        Retorna SOLO un JSON con este formato exacto:
        {{"reasoning": "Tu explicación...", "ordered_ids": ["uuid-1", "uuid-2"]}}
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en priorización: {e}")
            return None

    def generate_sprint_summary(self, sprint_data, tasks_data):
        """Genera un resumen ejecutivo del sprint en formato Markdown."""
        if self.is_mock:
            return """# Resumen Ejecutivo del Sprint (MOCK)
## Estado General
El sprint ha progresado de manera estable, alcanzando un **80%** de los puntos planificados.

## Tareas Completadas
- Implementación de Autenticación (NEX-10)
- Diseño de Base de Datos (NEX-11)

## Tareas Pendientes
- Integración de API externa (NEX-12)

## Observaciones
El equipo muestra un buen ritmo (velocity). Se recomienda revisar los bloqueos en NEX-12 para el próximo sprint.
"""
        prompt = f"""
        Actúa como un Delivery Manager senior. Genera un resumen ejecutivo profesional y conciso para el siguiente Sprint en español:

        DATOS DEL SPRINT:
        {sprint_data}

        TAREAS (Título, Puntos, Estado):
        {tasks_data}

        EL RESUMEN DEBE INCLUIR (usando Markdown):
        1. Estado General y % de cumplimiento (Story Points completados vs totales).
        2. Tareas destacadas completadas.
        3. Tareas que quedaron pendientes y por qué (basado en el estado).
        4. Observaciones estratégicas sobre el ritmo de trabajo, posibles riesgos o sugerencias para la retrospectiva.

        Responde directamente en formato Markdown profesional.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text
        except Exception as e:
            print(f"Error en resumen sprint: {e}")
            return "Error al generar el resumen ejecutivo con IA. Por favor, intenta de nuevo."

    def get_foresight_recommendation(self, foresight_data):
        """Genera una recomendación táctica basada en datos de riesgo del sprint."""
        if self.is_mock:
            risk = foresight_data.get('risk_level', 'low')
            if risk in ['high', 'critical']:
                return "Recomendación: Peligro de incumplimiento. Mover tareas a 'Planning'."
            return "Recomendación: Equipo con buen ritmo."

        prompt = f"""
        {SYSTEM_PROMPT}
        Analiza los siguientes datos de riesgo de un Sprint:
        {json.dumps(foresight_data)}

        Genera una recomendación de 1 o 2 frases máximo. Directo. Táctico.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error en foresight recommendation AI: {e}")
            return "Analiza manualmente la carga."

    def get_simulation_analysis(self, simulation_data):
        """Genera un análisis narrativo de un escenario de simulación."""
        if self.is_mock:
            return f"SIM_REPORT: Riesgo proyectado {simulation_data['risk_level'].upper()}. Desviación: {simulation_data['risk_index']}%."

        prompt = f"""
        {SYSTEM_PROMPT}
        ESCENARIO SIMULADO:
        {json.dumps(simulation_data.get('scenario', {}))}

        RESULTADOS DE SIMULACIÓN:
        - Nivel de Riesgo: {simulation_data['risk_level']}
        - Índice de Riesgo: {simulation_data['risk_index']}
        - Progreso de Trabajo proyectado: {simulation_data['indicators']['work_completed_pct']}%

        Actúa como el Oráculo de Nexus. Describe brevemente (max 3 frases) el impacto de este escenario. Sé directo y brutalmente honesto.
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error en simulation analysis AI: {e}")
            return "No se pudo realizar el análisis táctico de simulación."

    def generate_recommendations(self, context):
        """Analiza el contexto del proyecto y sugiere mejoras, riesgos y consejos técnicos."""
        if self.is_mock:
            return [
                {"title": "Optimizar Backend", "description": "Se detectan cuellos de botella en la API.", "type": "technical"},
                {"title": "Riesgo de Deadline", "description": "La velocidad actual pone en riesgo el cierre.", "type": "risk"}
            ]

        prompt = f"""
        {SYSTEM_PROMPT}
        Analiza el siguiente contexto de proyecto y genera una lista de 3 a 5 recomendaciones.
        Cada recomendación debe tener un 'title', 'description' y un 'type' (uno de: 'risk', 'improvement', 'technical').
        
        CONTEXTO:
        {context}
        
        Retorna SOLO un JSON con el formato: [{{"title": "...", "description": "...", "type": "..."}}]
        """
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error en AI recommendations: {e}")
            return []

    def _get_mock_stories(self, requirement):
        return [{"role": "Usuario", "action": "X", "benefit": "Y", "title": "Mock Story", "acceptance_criteria": ["C1"], "priority": "high", "type": "story"}]

    def _get_mock_backlog(self, description):
        return [{"epic": "Mock Epic", "items": [{"title": "Mock Task", "description": "d", "type": "feature", "priority": "high"}]}]
