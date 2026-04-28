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

    def _call_ai_api(self, project_description):
        # En producción aquí llamaríamos a Anthropic
        return self._get_mock_backlog(project_description)

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
