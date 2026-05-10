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
    Cliente para interactuar con la IA (Gemini/Gemma) y gestionar el flujo de trabajo de Nexus-PM.
    """
    
    def __init__(self):
        self.api_key = config('GOOGLE_API_KEY', default=None)
        if not self.api_key or "tu_token_aqui" in self.api_key:
            self.is_mock = True
        else:
            try:
                self.client = genai.Client(api_key=self.api_key)
                self.model_name = 'gemma-4-26b-a4b-it'
                self.is_mock = False
            except Exception as e:
                print(f"Error configurando Gemini v2: {e}")
                self.is_mock = True

    def generate_backlog(self, project_description):
        if self.is_mock:
            return self._get_mock_backlog(project_description)
        
        prompt = f"""
        Genera un backlog JSON para el proyecto: "{project_description}"
        Formato: [{{ "epic": "nombre", "items": [{{ "title": "t", "description": "d", "type": "feature", "priority": "high" }}] }}]
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
            print(f"Error con JSON mode v2 en backlog: {e}")
            return self._get_mock_backlog(project_description)

    def generate_user_stories(self, requirement):
        if self.is_mock:
            return self._get_mock_stories(requirement)
        
        prompt = f"""
        Genera Historias de Usuario JSON para: "{requirement}"
        Formato: [{{ "title": "t", "role": "r", "action": "a", "benefit": "b", "acceptance_criteria": ["c1"], "type": "story", "priority": "high" }}]
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
            print(f"Error con JSON mode v2 en historias: {e}")
            return self._get_mock_stories(requirement)

    def chat(self, message, context="", history=None):
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
            return "Lo siento, tuve un problema procesando tu solicitud tactical."

    def get_foresight_recommendation(self, foresight_data):
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
        if self.is_mock:
            return f"SIM_REPORT: Riesgo proyectado {simulation_data['risk_level'].upper()}. Desviación: {simulation_data['risk_index']}%."
            
        prompt = f"""
        {SYSTEM_PROMPT}
        ESCENARIO SIMULADO:
        {json.dumps(simulation_data['scenario'])}
        
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

    def _get_mock_stories(self, requirement):
        return [{"role": "Usuario", "action": "X", "benefit": "Y", "title": "Mock Story", "acceptance_criteria": ["C1"], "priority": "high", "type": "story"}]

    def _get_mock_backlog(self, description):
        return [{"epic": "Mock Epic", "items": [{"title": "Mock Task", "description": "d", "type": "feature", "priority": "high"}]}]
