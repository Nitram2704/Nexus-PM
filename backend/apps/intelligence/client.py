import json
import os
from django.conf import settings

class BacklogAIClient:
    """
    Cliente para interactuar con la IA (Claude) y generar propuestas de backlog.
    Incluye un modo 'Mock' para desarrollo sin API Key.
    """
    
    def __init__(self):
        self.api_key = os.getenv('ANTHROPIC_API_KEY')
        self.is_mock = not bool(self.api_key)

    def generate_backlog(self, project_description):
        if self.is_mock:
            return self._get_mock_backlog(project_description)
        
        return self._call_ai_api(project_description)

    def _call_ai_api(self, project_description):
        # Aquí iría la integración real con Anthropic/Claude
        # Por ahora, si no hay API key, usamos el mock
        return self._get_mock_backlog(project_description)

    def _get_mock_backlog(self, description):
        """
        Devuelve un backlog de prueba basado en palabras clave de la descripción.
        """
        desc_lower = description.lower()
        
        if "ecommerce" in desc_lower or "tienda" in desc_lower or "carrito" in desc_lower:
            return [
                {"title": "Configurar catálogo de productos", "description": "Definir modelos de datos para productos y categorías.", "type": "feature", "priority": "high"},
                {"title": "Implementar carrito de compras", "description": "Lógica para agregar, quitar y actualizar cantidades.", "type": "feature", "priority": "high"},
                {"title": "Integrar pasarela de pagos (Stripe)", "description": "Configurar webhooks y procesamiento de pagos seguros.", "type": "feature", "priority": "high"},
                {"title": "Diseñar flujo de checkout", "description": "Interfaz de usuario para dirección de envío y confirmación.", "type": "story", "priority": "medium"},
                {"title": "Historial de pedidos", "description": "Vista para que el usuario consulte sus compras anteriores.", "type": "feature", "priority": "low"},
            ]
        
        # Default mock backlog
        return [
            {"title": "Configurar entorno de desarrollo", "description": "Instalar dependencias y configurar variables de entorno.", "type": "task", "priority": "high"},
            {"title": "Diseñar arquitectura de base de datos", "description": "Definir esquemas y relaciones principales.", "type": "feature", "priority": "high"},
            {"title": "Implementar autenticación de usuarios", "description": "Login, registro y recuperación de contraseña.", "type": "feature", "priority": "high"},
            {"title": "Crear dashboard principal", "description": "Vista resumen con las métricas clave del sistema.", "type": "feature", "priority": "medium"},
            {"title": "Documentación de API", "description": "Generar Swagger o Redoc para los endpoints.", "type": "task", "priority": "low"},
        ]
