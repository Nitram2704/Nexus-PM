import json
import os
from decouple import config
import google.generativeai as genai
from django.conf import settings

class BacklogAIClient:
    """
    Cliente para interactuar con la IA (Gemini/Gemma) y generar propuestas de backlog.
    """
    
    def __init__(self):
        self.api_key = config('GOOGLE_API_KEY', default=None)
        if not self.api_key or "tu_token_aqui" in self.api_key:
            self.is_mock = True
        else:
            try:
                genai.configure(api_key=self.api_key)
                self.model_name = 'gemma-4-26b-a4b-it'
                self.model = genai.GenerativeModel(self.model_name)
                self.is_mock = False
            except Exception as e:
                print(f"Error configurando Gemini: {e}")
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
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error con JSON mode en backlog: {e}. Intentando parseo manual...")
            try:
                response = self.model.generate_content(prompt)
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                return json.loads(text.strip())
            except Exception as e2:
                print(f"Error final en backlog: {e2}")
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
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Error con JSON mode en historias: {e}. Intentando parseo manual...")
            try:
                response = self.model.generate_content(prompt)
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                return json.loads(text.strip())
            except Exception as e2:
                print(f"Error final en historias: {e2}")
                return self._get_mock_stories(requirement)

    def _get_mock_stories(self, requirement):
        return [
            {
                "role": "Usuario",
                "action": "iniciar sesión con Google",
                "benefit": "no tener que recordar otra contraseña",
                "title": "Autenticación con Google (Fallback)",
                "acceptance_criteria": ["Criterio 1"],
                "priority": "high",
                "type": "story"
            }
        ]

    def _get_mock_backlog(self, description):
        return [{"epic": "Autenticación (Fallback)", "items": [{"title": "Login", "description": "d", "type": "feature", "priority": "high"}]}]
