import json
import os
import re
import logging
import time
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

    # 1. Buscar bloque ```json ... ```
    match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # 2. Buscar bloque ``` ... ``` (sin language tag)
    match = re.search(r'```\s*\n?(.*?)\n?\s*```', text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass

    # 3. Buscar primer [ o { con balanceo de brackets
    for start_char, end_char in [('[', ']'), ('{', '}')]:
        start = text.find(start_char)
        if start == -1:
            continue
        depth = 0
        in_string = False
        escape = False
        for i in range(start, len(text)):
            c = text[i]
            if escape:
                escape = False
                continue
            if c == '\\' and in_string:
                escape = True
                continue
            if c == '"' and not escape:
                in_string = not in_string
                continue
            if in_string:
                continue
            if c == start_char:
                depth += 1
            elif c == end_char:
                depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except json.JSONDecodeError:
                    break

    # 4. Try the whole text as JSON
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

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
        # Groq (primario - más generoso en tier gratuito)
        self.groq_key = getattr(settings, 'GROQ_API_KEY', None) or config('GROQ_API_KEY', default=None) or os.environ.get('GROQ_API_KEY')
        self.groq_client = None
        self.groq_model = 'llama-3.1-8b-instant'  # Fast, reliable model

        if self.groq_key and groq_sdk:
            try:
                self.groq_client = groq_sdk.Groq(api_key=self.groq_key)
                # Test model availability with current (non-deprecated) models
                for test_model in ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant', 'llama3-8b-8192', 'mixtral-8x7b-32768']:
                    try:
                        test_resp = self.groq_client.chat.completions.create(
                            model=test_model,
                            messages=[{'role': 'user', 'content': 'ok'}],
                            max_tokens=5,
                        )
                        self.groq_model = test_model
                        logger.info("[NEXUS] Groq model %s confirmed working", test_model)
                        break
                    except Exception as e:
                        logger.warning("[NEXUS] Groq model %s failed: %s", test_model, str(e)[:100])
                else:
                    # No models worked - disable Groq
                    self.groq_client = None
                    logger.warning("[NEXUS] No Groq models available, disabling Groq")
            except Exception as e:
                logger.warning("[NEXUS] Error configurando Groq: %s", e)

        # Gemini (secundario - quota limitada en free tier)
        self.gemini_key = getattr(settings, 'GOOGLE_API_KEY', None) or config('GOOGLE_API_KEY', default=None) or os.environ.get('GOOGLE_API_KEY')
        self.gemini_client = None
        self.gemini_model = 'gemini-flash-latest'

        if self.gemini_key and self.gemini_key != 'your-api-key-here':
            try:
                self.gemini_client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                logger.warning("[NEXUS] Error configurando Gemini: %s", e)

        # Mock si no hay ningún proveedor
        self.is_mock = not self.gemini_client and not self.groq_client

        provider = 'Groq+Gemini' if self.groq_client and self.gemini_client else (
            'Groq' if self.groq_client else ('Gemini' if self.gemini_client else 'MOCK')
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

        logger.info("Groq request: model=%s, prompt_len=%d", self.groq_model, len(prompt))
        response = self.groq_client.chat.completions.create(**kwargs)
        text = response.choices[0].message.content
        logger.info("Groq response: %d chars, finish_reason=%s", len(text) if text else 0, response.choices[0].finish_reason if response.choices else 'unknown')
        return text

    def _generate(self, prompt, json_mode=False):
        """
        Generador dual: intenta Groq → fallback Gemini → error.
        Incluye retry con backoff para rate limits.
        Retorna (texto, proveedor_usado).
        """
        MAX_RETRIES = 2
        RETRY_DELAY = 2  # seconds

        for attempt in range(MAX_RETRIES):
            # 1. Intentar Groq (quota generosa)
            if self.groq_client:
                try:
                    text = self._generate_groq(prompt, json_mode=json_mode)
                    return text, 'groq'
                except Exception as e:
                    logger.warning("Groq falló (attempt %d): %s", attempt + 1, e)
                    if '429' in str(e) or 'rate' in str(e).lower():
                        if attempt < MAX_RETRIES - 1:
                            logger.info("Rate limit detectado, esperando %ds...", RETRY_DELAY * (attempt + 1))
                            time.sleep(RETRY_DELAY * (attempt + 1))
                            continue

            # 2. Fallback a Gemini
            if self.gemini_client:
                try:
                    text = self._generate_gemini(prompt, json_mode=json_mode)
                    return text, 'gemini'
                except Exception as e:
                    logger.warning("Gemini falló (attempt %d): %s", attempt + 1, e)
                    if '429' in str(e) or 'rate' in str(e).lower() or 'RESOURCE_EXHAUSTED' in str(e):
                        if attempt < MAX_RETRIES - 1:
                            logger.info("Rate limit Gemini, esperando %ds...", RETRY_DELAY * (attempt + 1))
                            time.sleep(RETRY_DELAY * (attempt + 1))
                            continue

            # Only retry if we got a rate limit error
            if attempt < MAX_RETRIES - 1:
                # Check if last error was a rate limit
                time.sleep(1)

        # 3. Sin proveedores disponibles
        return None, None

    def _generate_json(self, prompt):
        """
        Genera y parsea JSON. Intenta Groq (sin json_mode) → Gemini (sin json_mode).
        Usa _extract_json para parsear la respuesta del texto plano.
        Retorna (data, proveedor).
        """
        # 1. Groq (sin json_mode — más generoso en quota)
        if self.groq_client:
            try:
                text = self._generate_groq(prompt, json_mode=False)
                if text:
                    logger.info("Groq respondió (%d chars), extrayendo JSON...", len(text))
                    data = _extract_json(text)
                    if data is not None:
                        logger.info("Groq JSON OK, type=%s", type(data).__name__)
                        return data, 'groq'
                    logger.warning("Groq no retornó JSON válido. Snippet: %s", text[:300])
            except Exception as e:
                logger.warning("Groq error: %s", e)

        # 2. Gemini (sin json_mode)
        if self.gemini_client:
            try:
                text = self._generate_gemini(prompt, json_mode=False)
                if text:
                    logger.info("Gemini respondió (%d chars), extrayendo JSON...", len(text))
                    data = _extract_json(text)
                    if data is not None:
                        logger.info("Gemini JSON OK, type=%s", type(data).__name__)
                        return data, 'gemini'
                    logger.warning("Gemini no retornó JSON válido. Snippet: %s", text[:300])
            except Exception as e:
                logger.warning("Gemini error: %s", e)

        return None, None

    # ── API pública ───────────────────────────────────────────────────────

    def generate_backlog_from_description(self, description):
        """Genera una lista de épicas y tareas basadas en una descripción del proyecto."""
        if self.is_mock:
            return self._get_mock_backlog(description)

        prompt = f"""Eres un Product Owner experto. Genera un backlog JSON para un proyecto Agile.

DESCRIPCIÓN DEL PROYECTO: "{description}"

REGLAS ESTRICTAS:
1. Genera entre 2 y 4 épicas.
2. Cada épica tiene entre 2 y 4 items (historias de usuario o tareas).
3. Cada item tiene: title, description, type (feature/bug/task/story), priority (high/medium/low).
4. NUNCA incluyas texto antes o después del JSON.
5. El JSON debe ser un array válido.

Formato exacto (responde SOLO el JSON, nada más):
[{{"epic": "Nombre de la Épica", "items": [{{"title": "Título de la tarea", "description": "Descripción detallada", "type": "feature", "priority": "high"}}]}}]

JSON:"""
        data, provider = self._generate_json(prompt)
        if data is not None:
            # Validate structure
            if isinstance(data, list) and len(data) > 0:
                return data
            # If AI returned a dict with 'epic' key, wrap it
            if isinstance(data, dict) and 'epic' in data:
                return [data]
        logger.warning("AI no generó backlog válido, usando fallback descriptivo")
        return self._get_descriptive_backlog(description)

    def generate_user_stories(self, requirement):
        """Genera historias de usuario detalladas a partir de un requerimiento."""
        if self.is_mock:
            return self._get_mock_stories(requirement)

        prompt = f"""Eres un Product Owner experto. Genera historias de usuario en formato JSON.

REQUERIMIENTO: "{requirement}"

REGLAS ESTRICTAS:
1. Genera entre 3 y 6 historias de usuario.
2. Cada historia tiene: title, role, action, benefit, acceptance_criteria (array de strings), type (story/feature/task), priority (high/medium/low).
3. El role debe ser un rol real (ej: "Desarrollador", "Product Owner", "Usuario final").
4. NUNCA incluyas texto antes o después del JSON.
5. El JSON debe ser un array válido.

Formato exacto (responde SOLO el JSON, nada más):
[{{"title": "Título de la historia", "role": "Rol del usuario", "action": "Qué quiere hacer", "benefit": "Para qué le sirve", "acceptance_criteria": ["Criterio 1", "Criterio 2"], "type": "story", "priority": "high"}}]

JSON:"""
        data, provider = self._generate_json(prompt)
        if data is not None:
            if isinstance(data, list) and len(data) > 0:
                return data
            if isinstance(data, dict) and 'title' in data:
                return [data]
        logger.warning("AI no generó stories válidas, usando fallback descriptivo")
        return self._get_descriptive_stories(requirement)

    def chat_with_project(self, history, message, context):
        """Mantiene una conversación con contexto del proyecto."""
        return self.chat(message, context=context, history=history)

    def chat(self, message, context="", history=None):
        """Chat agéntico con contexto del proyecto."""
        if self.is_mock:
            return f"Nexus AI: Hola. Recibí tu mensaje: '{message}'. No hay proveedores de IA configurados."

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
        default = {
            "reasoning": "No se pudo generar priorización con IA. Orden basado en la secuencia actual.",
            "ordered_ids": [t['id'] for t in tasks_data]
        }
        if self.is_mock:
            return default

        prompt = f"""Eres un Agile Coach experto. Prioriza las siguientes tareas del backlog por importancia y dependencias.

TAREAS:
{json.dumps(tasks_data, indent=2)}

REGLAS ESTRICTAS:
1. Analiza las tareas y ordénalas por prioridad real (no solo por el campo priority).
2. Considera dependencias lógicas: lo fundamental va primero.
3. Incluye TODOS los IDs en ordered_ids.
4. Explica tu razonamiento en reasoning.
5. NUNCA incluyas texto antes o después del JSON.

Formato exacto (responde SOLO el JSON, nada más):
{{"reasoning": "Tu explicación del ordenamiento...", "ordered_ids": ["id-1", "id-2"]}}

JSON:"""
        data, provider = self._generate_json(prompt)
        if data is not None:
            if isinstance(data, dict) and 'ordered_ids' in data:
                return data
        logger.warning("AI no generó priorización válida")
        return default

    def generate_sprint_summary(self, sprint_data, tasks_data):
        """Genera un resumen ejecutivo del sprint en formato Markdown."""
        if self.is_mock:
            return "No hay proveedores de IA configurados para generar el resumen del sprint."
        prompt = f"""Eres un Delivery Manager senior. Genera un resumen ejecutivo profesional y conciso para el siguiente Sprint en español.

DATOS DEL SPRINT:
{sprint_data}

TAREAS (Título, Puntos, Estado):
{tasks_data}

REGLAS ESTRICTAS:
1. El resumen debe incluir: Estado General (% cumplimiento), Tareas completadas, Tareas pendientes, Observaciones estratégicas.
2. Usa formato Markdown profesional.
3. Sé conciso pero informativo.
4. NUNCA incluyas texto antes o después del Markdown.

Responde directamente en formato Markdown:"""
        text, provider = self._generate(prompt)
        if text:
            return text
        return "Error al generar el resumen ejecutivo con IA. Por favor, intenta de nuevo."

    def get_foresight_recommendation(self, foresight_data):
        """Genera una recomendación táctica basada en datos de riesgo del sprint."""
        if self.is_mock:
            return "No hay proveedores de IA configurados para generar recomendaciones de foresight."

        prompt = f"""{SYSTEM_PROMPT}
Analiza los siguientes datos de riesgo de un Sprint:
{json.dumps(foresight_data)}

Genera una recomendación de 1 o 2 frases máximo. Directo. Táctico.
NUNCA incluyas texto antes o después de tu respuesta."""
        text, provider = self._generate(prompt)
        if text:
            return text.strip()
        return "Analiza manualmente la carga."

    def get_simulation_analysis(self, simulation_data):
        """Genera un análisis narrativo de un escenario de simulación."""
        if self.is_mock:
            return "No hay proveedores de IA configurados para generar análisis de simulación."

        prompt = f"""{SYSTEM_PROMPT}
ESCENARIO SIMULADO:
{json.dumps(simulation_data.get('scenario', {}))}

RESULTADOS DE SIMULACIÓN:
- Nivel de Riesgo: {simulation_data['risk_level']}
- Índice de Riesgo: {simulation_data['risk_index']}
- Progreso de Trabajo proyectado: {simulation_data['indicators']['work_completed_pct']}%

Actúa como el Oráculo de Nexus. Describe brevemente (max 3 frases) el impacto de este escenario. Sé directo y brutalmente honesto.
NUNCA incluyas texto antes o después de tu respuesta."""
        text, provider = self._generate(prompt)
        if text:
            return text.strip()
        return "No se pudo realizar el análisis táctico de simulación."

    def generate_recommendations(self, context):
        """Analiza el contexto del proyecto y sugiere mejoras, riesgos y consejos técnicos."""
        if self.is_mock:
            return []

        prompt = f"""Eres un consultor Agile senior. Analiza el contexto del proyecto y genera recomendaciones accionables.

CONTEXTO DEL PROYECTO:
{context}

REGLAS ESTRICTAS:
1. Genera entre 3 y 5 recomendaciones.
2. Cada recomendación tiene: title (string), description (string con acción concreta), type (uno de: "risk", "improvement", "technical").
3. Sé específico y accionable — nada genérico.
4. NUNCA incluyas texto antes o después del JSON.
5. El JSON debe ser un array válido.

Formato exacto (responde SOLO el JSON, nada más):
[{{"title": "Título de la recomendación", "description": "Descripción con acción concreta", "type": "improvement"}}]

JSON:"""
        data, provider = self._generate_json(prompt)
        if data is not None:
            if isinstance(data, list) and len(data) > 0:
                return data
        logger.warning("AI no generó recomendaciones válidas")
        return []

    # ── Fallbacks descriptivos (cuando la IA falla) ────────────────────────

    def _get_descriptive_stories(self, requirement):
        """Fallback: genera historias de usuario básicas basadas en el requerimiento."""
        return [{
            "title": f"Historia para: {requirement}",
            "role": "Usuario",
            "action": "interactuar con el sistema",
            "benefit": "lograr el objetivo del requerimiento",
            "acceptance_criteria": ["El sistema procesa el requerimiento correctamente"],
            "type": "story",
            "priority": "medium"
        }]

    def _get_descriptive_backlog(self, description):
        """Fallback: genera backlog básico basado en la descripción."""
        return [{
            "epic": f"Implementación: {description}",
            "items": [
                {"title": "Análisis de requerimientos", "description": f"Analizar los requerimientos para: {description}", "type": "task", "priority": "high"},
                {"title": "Diseño de arquitectura", "description": "Definir la arquitectura técnica del sistema", "type": "task", "priority": "high"},
                {"title": "Implementación core", "description": "Desarrollar la funcionalidad principal", "type": "feature", "priority": "high"},
                {"title": "Testing y validación", "description": "Probar y validar la implementación", "type": "task", "priority": "medium"}
            ]
        }]

    def _get_mock_stories(self, requirement):
        return []

    def _get_mock_backlog(self, description):
        return []
