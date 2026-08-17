import json
import os
import re
import logging
from decouple import config
from google import genai
from google.genai import types
from django.conf import settings

logger = logging.getLogger(__name__)

try:
    import groq as groq_sdk
except ImportError:
    groq_sdk = None

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


def _extract_json(text: str):
    """Extrae JSON de un texto que puede contener markdown o texto adicional."""
    if not text:
        return None
    # Buscar bloque ```json ... ```
    match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Buscar primer [ o {
    for start_char, end_char in [('[', ']'), ('{', '}')]:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        for i in range(start, len(text)):
            if text[i] == start_char:
                depth += 1
            elif text[i] == end_char:
                depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    break
    return None


class BacklogAIClient:
    """
    Cliente de IA dual: Gemini (primario) + Groq (fallback).
    
    Flujo:
    1. Intenta Gemini → si falla, intenta Groq
    2. Si ambos fallan, retorna mock/error
    
    Configuración:
    - GOOGLE_API_KEY: API key de Google AI Studio (obligatoria para Gemini)
    - GROQ_API_KEY: API key de Groq (opcional, para fallback)
    """

    def __init__(self):
        # Gemini (primario)
        self.gemini_key = getattr(settings, 'GOOGLE_API_KEY', None) or config('GOOGLE_API_KEY', default=None)
        self.gemini_client = None
        self.gemini_model = 'gemini-flash-latest'

        if self.gemini_key and self.gemini_key != 'your-api-key-here':
            try:
                self.gemini_client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                print(f"[NEXUS] Error configurando Gemini: {e}")

        # Groq (fallback)
        self.groq_key = getattr(settings, 'GROQ_API_KEY', None) or config('GROQ_API_KEY', default=None)
        self.groq_client = None
        self.groq_model = 'llama-3.3-70b-versatile'

        if self.groq_key and groq_sdk:
            try:
                self.groq_client = groq_sdk.Groq(api_key=self.groq_key)
            except Exception as e:
                print(f"[NEXUS] Error configurando Groq: {e}")

        # Mock si no hay ningún proveedor
        self.is_mock = not self.gemini_client and not self.groq_client

        provider = 'Gemini+Groq' if self.gemini_client and self.groq_client else (
            'Gemini' if self.gemini_client else ('Groq' if self.groq_client else 'MOCK')
        )
        logger.info("[NEXUS] AI Provider: %s", provider)

    # ── Generadores internos ──────────────────────────────────────────────

    def _generate_gemini(self, prompt, json_mode=False):
        """Genera contenido con Gemini."""
        config_kwargs = {}
        if json_mode:
            config_kwargs['response_mime_type'] = 'application/json'

        response = self.gemini_client.models.generate_content(
            model=self.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(**config_kwargs) if config_kwargs else None,
        )
        return response.text

    def _generate_groq(self, prompt, json_mode=False):
        """Genera contenido con Groq (OpenAI-compatible)."""
        messages = [{'role': 'user', 'content': prompt}]

        kwargs = {
            'model': self.groq_model,
            'messages': messages,
            'temperature': 0.3,
            'max_tokens': 4096,
        }

        if json_mode:
            # Groq no tiene response_format nativo, pero respetamos instrucciones
            pass

        response = self.groq_client.chat.completions.create(**kwargs)
        return response.choices[0].message.content

    def _generate(self, prompt, json_mode=False):
        """
        Generador dual: intenta Gemini → fallback Groq → error.
        Retorna (texto, proveedor_usado).
        """
        # 1. Intentar Gemini
        if self.gemini_client:
            try:
                text = self._generate_gemini(prompt, json_mode=json_mode)
                return text, 'gemini'
            except Exception as e:
                logger.warning("Gemini falló: %s. Intentando Groq...", e)

        # 2. Fallback a Groq
        if self.groq_client:
            try:
                text = self._generate_groq(prompt, json_mode=json_mode)
                return text, 'groq'
            except Exception as e:
                logger.warning("Groq también falló: %s", e)

        # 3. Sin proveedores disponibles
        return None, None

    def _generate_json(self, prompt):
        """
        Genera y parsea JSON. Intenta Gemini (con json_mode) → Groq (con parsing).
        Retorna (data, proveedor).
        """
        # Gemini con json_mode nativo
        if self.gemini_client:
            try:
                text = self._generate_gemini(prompt, json_mode=True)
                return json.loads(text), 'gemini'
            except Exception as e:
                logger.warning("Gemini JSON falló: %s. Intentando Groq...", e)

        # Groq con parsing manual
        if self.groq_client:
            try:
                text = self._generate_groq(prompt, json_mode=False)
                logger.info("Groq response length: %d", len(text) if text else 0)
                data = _extract_json(text)
                if data is not None:
                    return data, 'groq'
                logger.warning("Groq no retornó JSON válido. Response snippet: %s", text[:200] if text else 'None')
            except Exception as e:
                logger.warning("Groq JSON falló: %s", e)

        return None, None

    # ── API pública ───────────────────────────────────────────────────────

    def generate_backlog_from_description(self, description):
        """Genera una lista de épicas y tareas basadas en una descripción del proyecto."""
        if self.is_mock:
            return self._get_mock_backlog(description)

        prompt = f"""
        Genera un backlog JSON para el proyecto: "{description}"
        Formato: [{{"epic": "nombre", "items": [{{"title": "t", "description": "d", "type": "feature", "priority": "high"}}]}}]
        Responde SOLO el JSON.
        """
        data, provider = self._generate_json(prompt)
        if data is not None:
            return data
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
        data, provider = self._generate_json(prompt)
        if data is not None:
            return data
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
        text, provider = self._generate(prompt)
        if text:
            return text
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
        data, provider = self._generate_json(prompt)
        if data is not None:
            return data
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
        text, provider = self._generate(prompt)
        if text:
            return text
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
        text, provider = self._generate(prompt)
        if text:
            return text.strip()
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
        text, provider = self._generate(prompt)
        if text:
            return text.strip()
        return "No se pudo realizar el análisis táctico de simulación."

    def generate_recommendations(self, context):
        """Analiza el contexto del proyecto y sugiere mejoras, riesgos y consejos técnicos."""
        mock_data = [
            {"title": "Optimizar Backend", "description": "Se detectan cuellos de botella en la API.", "type": "technical"},
            {"title": "Riesgo de Deadline", "description": "La velocidad actual pone en riesgo el cierre.", "type": "risk"}
        ]
        if self.is_mock:
            return mock_data

        prompt = f"""
        {SYSTEM_PROMPT}
        Analiza el siguiente contexto de proyecto y genera una lista de 3 a 5 recomendaciones.
        Cada recomendación debe tener un 'title', 'description' y un 'type' (uno de: 'risk', 'improvement', 'technical').
        
        CONTEXTO:
        {context}
        
        Retorna SOLO un JSON con el formato: [{{"title": "...", "description": "...", "type": "..."}}]
        """
        data, provider = self._generate_json(prompt)
        if data is not None:
            return data
        return mock_data

    # ── Mock data ─────────────────────────────────────────────────────────

    def _get_mock_stories(self, requirement):
        return [{"role": "Usuario", "action": "X", "benefit": "Y", "title": "Mock Story", "acceptance_criteria": ["C1"], "priority": "high", "type": "story"}]

    def _get_mock_backlog(self, description):
        return [{"epic": "Mock Epic", "items": [{"title": "Mock Task", "description": "d", "type": "feature", "priority": "high"}]}]
