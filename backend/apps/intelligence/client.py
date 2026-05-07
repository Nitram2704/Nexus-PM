import json
import os
from decouple import config
from google import genai
from google.genai import types
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
            print(f"Error con JSON mode v2 en backlog: {e}. Intentando parseo manual...")
            try:
                response = self.client.models.generate_content(model=self.model_name, contents=prompt)
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                return json.loads(text.strip())
            except Exception as e2:
                print(f"Error final v2 en backlog: {e2}")
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
            print(f"Error con JSON mode v2 en historias: {e}. Intentando parseo manual...")
            try:
                response = self.client.models.generate_content(model=self.model_name, contents=prompt)
                text = response.text
                if "```json" in text:
                    text = text.split("```json")[1].split("```")[0]
                elif "```" in text:
                    text = text.split("```")[1].split("```")[0]
                return json.loads(text.strip())
            except Exception as e2:
                print(f"Error final v2 en historias: {e2}")
                return self._get_mock_stories(requirement)


    def chat(self, message, context="", history=None):
        if self.is_mock:
            return f"Nexus AI: Hola. Recibí tu mensaje: '{message}'. (Modo Mock)"
        
        if history is None:
            history = []

        history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])

        system_prompt = f"""
        Eres Nexus AI, el Asistente Scrum Master avanzado para Nexus-PM.
        Tu misión es optimizar el flujo de trabajo (Flow) y la carga del equipo.
        
        CONTEXTO ACTUAL DEL PROYECTO:
        {context}
        
        HISTORIAL DE CONVERSACIÓN:
        {history_str}
        
        INSTRUCCIONES:
        1. Eres profesional, directo y táctico. Respondas como si estuvieras en una terminal de comando.
        2. Si el usuario te pide una auditoría o pregunta cómo va el equipo:
           - Analiza quién tiene más tareas/puntos.
           - Identifica cuellos de botella.
        3. NUEVO: Si recibes el comando `/nexus` o similar, genera una "NARRATIVA DE PROYECTO" (Wins y Risks).
        4. Siempre usa tablas Markdown para datos si es posible.
        5. Responde en español (Neutro o de España).
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=f"{system_prompt}\n\nMensaje del usuario: {message}"
            )
            return response.text
        except Exception as e:
            print(f"Error en chat AI v2: {e}")
            return "Lo siento, tuve un problema procesando tu solicitud tactical."

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

    def get_foresight_recommendation(self, foresight_data):
        """
        Genera una recomendación táctica basada en el análisis de riesgo actual.
        """
        if self.is_mock:
            risk = foresight_data.get('risk_level', 'low')
            if risk in ['high', 'critical']:
                return "Recomendación: Peligro de incumplimiento. Sugiere mover tareas del backlog a 'Planning' o aumentar el equipo."
            return "Recomendación: El equipo mantiene un buen ritmo. No se requieren ajustes inmediatos."
            
        prompt = f"""
        Analiza los siguientes datos de riesgo de un Sprint de desarrollo:
        {json.dumps(foresight_data)}
        
        Genera una recomendación de 1 o 2 frases máximo para el Scrum Master.
        Sé táctico, directo y profesional. Usa el nombre/email de los miembros si están sobrecargados.
        Responde en español.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            return response.text.strip()
        except Exception as e:
            print(f"Error en foresight recommendation AI: {e}")
            return "Analiza manualmente la carga; el motor de sugerencias temporalmente no disponible."
