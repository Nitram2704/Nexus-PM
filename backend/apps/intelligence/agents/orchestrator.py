import json
from decouple import config
from google import genai
from google.genai import types

class AgentOrchestrator:
    """
    Maestro orquestador que simula el debate y creación de tareas por diferentes agentes.
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

    def _call_agent(self, role_prompt, epic_description):
        if self.is_mock:
            return [{"title": f"Mocking {role_prompt[:10]}", "description": "Mock desc", "type": "task", "priority": "medium"}]
            
        system_instruction = f"""
        Eres un agente altamente especializado en Nexus PM.
        Rol: {role_prompt}
        
        Debes leer la descripción de la "Épica" (Epic) y generar un array JSON de tickets/tareas que TÚ ejecutarías bajo tu rol.
        Formato obligatorio estricto en JSON:
        [
          {{
             "title": "Breve título técnico",
             "description": "Descripción detallada del cómo.",
             "type": "feature|bug|task|story",
             "priority": "high|medium|low"
          }}
        ]
        
        Responde ÚNICAMENTE el JSON crudo, sin bloques de código ```json ni texto adicional.
        """
        
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=f"ÉPICA: {epic_description}",
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.4,
                    response_mime_type="application/json"
                )
            )
            text = response.text
            # Cleanup incase of markdown wrapper
            if text.startswith("```json"): text = text[7:]
            if text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"Error orchestrando agente ({role_prompt[:15]}): {e}")
            return []

    def orchestrate_epic(self, epic_description):
        """
        Ejecuta los agentes en secuencia/paralelo y junta sus tareas.
        """
        agents = {
            "backend_architect": "Backend Architect. Piensa en modelos de datos, APIs, rendimiento, seguridad y servicios en la nube.",
            "frontend_specialist": "Frontend Specialist. Piensa en UI/UX, componentes React, TailwindCSS, estado global y accesibilidad.",
            "product_manager": "Product Manager. Piensa en Historias de Usuario, métricas, criterios de aceptación y alineación de negocio."
        }
        
        all_tasks = []
        for ai_id, role in agents.items():
            print(f"Orquestando a {ai_id}...")
            tasks = self._call_agent(role, epic_description)
            for t in tasks:
                t['ai_assignee'] = ai_id
            all_tasks.extend(tasks)
            
        return all_tasks
