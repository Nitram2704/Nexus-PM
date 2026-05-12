import os
import json
import google.generativeai as genai
from django.conf import settings

class BacklogAIClient:
    def __init__(self):
        # Configurar la API key desde settings
        genai.configure(api_key=settings.GOOGLE_API_KEY)
        # Usar un modo mock si no hay API key para desarrollo local
        self.is_mock = not settings.GOOGLE_API_KEY or settings.GOOGLE_API_KEY == 'your-api-key-here'
        
        self.model = genai.GenerativeModel(
            model_name='gemma-4-26b-a4b-it', # Usando el nuevo modelo Gemma 4
            generation_config={
                "temperature": 0.4,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
        )

    def generate_backlog_from_description(self, description):
        """
        Genera una lista de épicas y tareas basadas en una descripción del proyecto.
        """
        if self.is_mock:
            return [
                {
                    "epic": "Gestión de Usuarios",
                    "items": [
                        {"title": "Login de usuarios", "description": "Permitir acceso con email y password", "type": "feature", "priority": "high"},
                        {"title": "Registro de usuarios", "description": "Formulario de registro", "type": "feature", "priority": "high"}
                    ]
                }
            ]

        prompt = f"""
        Actúa como un Senior Product Manager. Basado en la siguiente descripción de proyecto, 
        genera una estructura inicial de backlog organizada por épicas.
        
        DESCRIPCIÓN:
        {description}
        
        Formato JSON esperado: 
        [
          {{ 
            "epic": "Nombre de la épica", 
            "items": [
              {{ "title": "Título corto", "description": "Descripción breve", "type": "feature", "priority": "high|medium|low" }}
            ]
          }}
        ]
        
        Responde SOLO el JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Limpiar posibles bloques de código markdown
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error en IA Backlog: {e}")
            return None

    def generate_user_stories(self, requirement):
        """
        Genera historias de usuario detalladas a partir de un requerimiento.
        """
        if self.is_mock:
            return [
                {
                    "title": "Pago con tarjeta",
                    "role": "cliente",
                    "action": "pagar con mi tarjeta",
                    "benefit": "completar mi compra rápido",
                    "acceptance_criteria": ["Validar tarjeta", "Confirmar pago"],
                    "type": "story",
                    "priority": "high"
                }
            ]

        prompt = f"""
        Actúa como un Business Analyst experto. Genera historias de usuario detalladas para el siguiente requerimiento:
        {requirement}
        
        Formato JSON esperado: 
        [
          {{ 
            "title": "Título corto", 
            "role": "rol", 
            "action": "acción deseada", 
            "benefit": "beneficio esperado", 
            "acceptance_criteria": ["criterio 1", "criterio 2", "criterio 3"], 
            "type": "story", 
            "priority": "high|medium|low" 
          }}
        ]
        
        Responde SOLO el JSON.
        """
        
        try:
            response = self.model.generate_content(prompt)
            text = response.text.replace('```json', '').replace('```', '').strip()
            return json.loads(text)
        except Exception as e:
            print(f"Error en IA Stories: {e}")
            return None

    def chat_with_project(self, history, message, context):
        """
        Mantiene una conversación con contexto del proyecto.
        """
        if self.is_mock:
            return "Este es un mensaje de prueba del asistente Nexus AI."

        prompt = f"""
        Eres Nexus Agent, un asistente virtual integrado en una herramienta de gestión de proyectos.
        Tienes acceso al contexto del proyecto actual. Ayuda al usuario con sus dudas, sugiere mejoras 
        o ayuda a definir tareas.
        
        CONTEXTO:
        {context}
        
        REGLA ESPECIAL: Si sugieres crear una nueva tarea, incluye al final de tu mensaje este tag: 
        [SUGGESTION: {{"title": "Título", "description": "Descripción", "type": "task", "priority": "medium"}}]
        
        MENSAJE DEL USUARIO:
        {message}
        """

        try:
            # Convertir historial de dict a Content si es necesario (el SDK lo hace automático usualmente)
            chat = self.model.start_chat(history=history or [])
            response = chat.send_message(prompt)
            return response.text
        except Exception as e:
            print(f"Error en chat: {e}")
            return "Lo siento, tuve un problema técnico al procesar tu mensaje."

    def prioritize_backlog(self, tasks_data):
        """
        Analiza una lista de tareas y sugiere un orden de prioridad.
        Retorna JSON con la lista ordenada de IDs y el razonamiento.
        """
        if self.is_mock:
            return {
                "reasoning": "Mock: Basado en importancia técnica.",
                "ordered_ids": [t['id'] for t in tasks_data]
            }

        prompt = f"""
        Actúa como un Agile Coach experto. Prioriza las siguientes tareas del backlog de un proyecto de software:
        
        DATA:
        {tasks_data}
        
        REGLAS:
        1. Considera el valor de negocio, complejidad técnica y dependencias.
        2. Explica brevemente tu razonamiento general.
        3. Retorna un JSON con este formato exacto:
        {{
            "reasoning": "Tu explicación...",
            "ordered_ids": ["uuid-1", "uuid-2", ...]
        }}
        
        IMPORTANTE: Responde ÚNICAMENTE el bloque JSON. No incluyas texto antes o después.
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Limpiar posibles bloques de código markdown y extraer solo el contenido JSON
            raw_text = response.text
            
            # Buscar el bloque JSON en caso de que la IA incluya texto antes o después
            import re
            json_match = re.search(r'(\{.*\})', raw_text, re.DOTALL)
            if json_match:
                text = json_match.group(1)
            else:
                text = raw_text.replace('```json', '').replace('```', '').strip()
                
            return json.loads(text)
        except Exception as e:
            print(f"Error en priorización: {e}")
            if 'response' in locals() and hasattr(response, 'text'):
                print(f"Raw AI response: {response.text}")
            return None

    def generate_sprint_summary(self, sprint_data, tasks_data):
        """
        Genera un resumen ejecutivo del sprint.
        """
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
            response = self.model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Error en resumen sprint: {e}")
            return "Error al generar el resumen ejecutivo con IA. Por favor, intenta de nuevo."
