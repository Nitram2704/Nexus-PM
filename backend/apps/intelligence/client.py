import json
import os
from django.conf import settings

class BacklogAIClient:
    """
    Cliente para interactuar con la IA (Claude) y generar propuestas de backlog.
    Organiza los ítems por módulo/épica.
    """
    
    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.is_mock = not bool(self.api_key)

    def generate_backlog(self, project_description):
        if self.is_mock:
            return self._get_mock_backlog(project_description)
        
        return self._call_ai_api(project_description)

    def generate_user_stories(self, requirement):
        """
        Genera historias de usuario detalladas a partir de un requerimiento.
        """
        if self.is_mock:
            return self._get_mock_stories(requirement)
        
        return self._call_ai_api_for_stories(requirement)

    def _call_ai_api(self, project_description):
        # En producción aquí llamaríamos a Anthropic
        return self._get_mock_backlog(project_description)

    def _call_ai_api_for_stories(self, requirement):
        # En producción aquí llamaríamos a Anthropic con un prompt de US
        return self._get_mock_stories(requirement)

    def _get_mock_stories(self, requirement):
        """
        Devuelve historias de usuario mockeadas con formato Como/Quiero/Para.
        """
        return [
            {
                "role": "Usuario",
                "action": "iniciar sesión con Google",
                "benefit": "no tener que recordar otra contraseña",
                "title": "Autenticación con Google",
                "acceptance_criteria": [
                    "El botón de Google debe ser visible en la pantalla de login.",
                    "Al hacer clic, debe redirigir a la cuenta de Google.",
                    "Si el usuario no existe, debe crearse automáticamente."
                ],
                "priority": "high",
                "type": "story"
            },
            {
                "role": "Usuario",
                "action": "recibir notificaciones push",
                "benefit": "enterarme al instante de cambios en mis tareas",
                "title": "Notificaciones en tiempo real",
                "acceptance_criteria": [
                    "Pedir permiso al usuario al entrar por primera vez.",
                    "Enviar notificación cuando se me asigne una tarea.",
                    "Enviar notificación cuando una tarea cambie de estado."
                ],
                "priority": "medium",
                "type": "story"
            }
        ]

    def _get_mock_backlog(self, description):
        """
        Devuelve un backlog organizado por épicas.
        """
        desc_lower = description.lower()
        
        if "ecommerce" in desc_lower or "tienda" in desc_lower:
            return [
                {
                    "epic": "Módulo: Catálogo y Productos",
                    "items": [
                        {"title": "Definir modelos de productos", "description": "Atributos, categorías y variantes.", "type": "task", "priority": "high"},
                        {"title": "CRUD de productos para Admin", "description": "Interfaz para gestionar el inventario.", "type": "feature", "priority": "high"},
                        {"title": "Buscador de productos", "description": "Búsqueda por nombre y filtros por categoría.", "type": "feature", "priority": "medium"}
                    ]
                },
                {
                    "epic": "Módulo: Ventas y Checkout",
                    "items": [
                        {"title": "Carrito de compras persistente", "description": "Almacenamiento en LocalStorage o DB.", "type": "feature", "priority": "high"},
                        {"title": "Integración con Stripe/PayPal", "description": "Procesamiento de pagos seguro.", "type": "feature", "priority": "high"},
                        {"title": "Generación de facturas PDF", "description": "Envío automático al completar compra.", "type": "task", "priority": "low"}
                    ]
                }
            ]
        
        # Default mock backlog (Software SaaS general)
        return [
            {
                "epic": "Módulo: Autenticación",
                "items": [
                    {"title": "Registro con validación de email", "description": "Asegurar que el correo sea válido.", "type": "feature", "priority": "high"},
                    {"title": "OAuth con Google/Github", "description": "Login social para mayor conversión.", "type": "feature", "priority": "medium"}
                ]
            },
            {
                "epic": "Módulo: Core / Gestión",
                "items": [
                    {"title": "Dashboard de métricas", "description": "Gráficos resumen del estado del sistema.", "type": "story", "priority": "high"},
                    {"title": "Exportación de reportes (Excel/CSV)", "description": "Permitir descarga de datos históricos.", "type": "task", "priority": "medium"}
                ]
            }
        ]
