import json
import os
from decouple import config
import google.generativeai as genai
from django.conf import settings

class BacklogAIClient:
    """
    Cliente para interactuar con la IA (Gemini) y generar propuestas de backlog.
    """
    
    def __init__(self):
        self.api_key = config('GOOGLE_API_KEY', default=None)
        # Si el token es el placeholder o no existe, usamos mock
        if not self.api_key or "tu_token_aqui" in self.api_key:
            self.is_mock = True
        else:
            try:
                genai.configure(api_key=self.api_key)
                # Usamos Gemma 4 (26B con 4B activos) para un balance óptimo de precisión y eficiencia
                self.model = genai.GenerativeModel('gemma-4-26b-a4b-it')
                self.is_mock = False
            except Exception as e:
                print(f"Error configurando Gemini: {e}")
                self.is_mock = True

    def generate_backlog(self, project_description):
        if self.is_mock:
            return self._get_mock_backlog(project_description)
        
        prompt = f"""
        Eres un experto Product Owner y Arquitecto de Software. 
        Tu tarea es generar un backlog de tareas técnicas y funcionales para el siguiente proyecto: 
        "{project_description}"
        
        REGLAS:
        1. Organiza las tareas por módulos o épicas.
        2. Cada tarea debe tener un título claro, descripción breve, tipo (feature, task, bug, story) y prioridad (high, medium, low).
        3. Genera al menos 2 épicas con 3 items cada una.
        4. LA RESPUESTA DEBE SER EXCLUSIVAMENTE UN JSON VÁLIDO. No incluyas texto explicativo antes o después.

        FORMATO JSON REQUERIDO:
        [
            {{
                "epic": "Nombre de la Épica",
                "items": [
                    {{
                        "title": "Título",
                        "description": "Descripción",
                        "type": "feature",
                        "priority": "high"
                    }}
                ]
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini API for backlog: {e}")
            return self._get_mock_backlog(project_description)

    def generate_user_stories(self, requirement):
        if self.is_mock:
            return self._get_mock_stories(requirement)
        
        prompt = f"""
        Eres un experto en metodologías ágiles. 
        Transforma el siguiente requerimiento en una lista de Historias de Usuario detalladas:
        "{requirement}"
        
        REGLAS:
        1. Cada historia debe seguir el formato: "Como [rol], quiero [acción], para [beneficio]".
        2. Incluye al menos 3 criterios de aceptación por historia.
        3. Define prioridad (high, medium, low).
        4. LA RESPUESTA DEBE SER EXCLUSIVAMENTE UN JSON VÁLIDO. No incluyas texto explicativo.

        FORMATO JSON REQUERIDO:
        [
            {{
                "title": "Título corto",
                "role": "Rol del usuario",
                "action": "acción que desea realizar",
                "benefit": "beneficio esperado",
                "acceptance_criteria": ["Criterio 1", "Criterio 2", "Criterio 3"],
                "type": "story",
                "priority": "high"
            }}
        ]
        """
        
        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error calling Gemini API for stories: {e}")
            return self._get_mock_stories(requirement)

    def _get_mock_stories(self, requirement):
        """Fallback mock data"""
        return [
            {
                "role": "Usuario",
                "action": "iniciar sesión con Google",
                "benefit": "no tener que recordar otra contraseña",
                "title": "Autenticación con Google (Mock)",
                "acceptance_criteria": [
                    "El botón de Google debe ser visible.",
                    "Redirección exitosa a Google.",
                    "Creación de cuenta automática si no existe."
                ],
                "priority": "high",
                "type": "story"
            }
        ]

    def _get_mock_backlog(self, description):
        """Fallback mock data"""
        return [
            {
                "epic": "Módulo: Autenticación (Mock)",
                "items": [
                    {"title": "Registro de usuarios", "description": "Flujo básico de registro.", "type": "feature", "priority": "high"}
                ]
            }
        ]
