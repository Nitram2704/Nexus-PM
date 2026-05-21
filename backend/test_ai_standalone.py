import os
import sys
from unittest.mock import MagicMock

# 1. Mock manual de Django settings para que BacklogAIClient pueda importar sin fallar
mock_settings = MagicMock()
mock_settings.GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY', 'AIzaSyBeEXBP7iDzR4P7tgFaKNK_QHn7D0Z6jUY')
sys.modules['django.conf'] = MagicMock(settings=mock_settings)
sys.modules['django'] = MagicMock()

# Ahora podemos importar el cliente
from apps.intelligence.client import BacklogAIClient

def test_ai_integration():
    print("Iniciando prueba de Nexus AI (SDK v2 + Expertise)...")
    
    # Inicializamos el cliente con el rol de PM
    client = BacklogAIClient(roles=["product_manager", "tech_architect"])
    
    if client.is_mock:
        print("AVISO: El cliente esta en modo MOCK (no hay API Key valida).")
    
    # Prueba 1: Generación de Backlog Estratégico
    print("\n--- PRUEBA 1: Generacion de Backlog Estrategico ---")
    description = "Crear una plataforma de e-commerce para venta de cafe organico con suscripcion mensual."
    backlog = client.generate_backlog_from_description(description)
    
    if backlog:
        print("EXITO: Backlog generado con estructura estrategica.")
        # Verificamos si incluyó el nuevo análisis de riesgos/kpis
        for epic in backlog[:1]:
            print(f"Epica detectada: {epic.get('epic')}")
            if 'analysis' in epic:
                print(f"Analisis estrategico: OK (Riesgos: {epic['analysis'].get('risks')})")
            else:
                print("ERROR: La respuesta no contiene el nodo 'analysis'.")
    else:
        print("FALLO: No se recibio respuesta del generador de backlog.")

    # Prueba 2: Chat con el Strategic Advisor
    print("\n--- PRUEBA 2: Chat con Nexus Strategic Advisor ---")
    message = "Que tres riesgos tecnicos ves en implementar un sistema de suscripciones recurrentes?"
    response = client.chat_with_project(history=[], message=message, context="Proyecto de E-commerce de Cafe")
    
    if response:
        print("EXITO: Respuesta del chat recibida.")
        print(f"Respuesta corta: {response[:150]}...")
    else:
        print("FALLO: El chat no respondio.")

if __name__ == "__main__":
    try:
        test_ai_integration()
    except Exception as e:
        print(f"ERROR CRITICO durante el test: {e}")
