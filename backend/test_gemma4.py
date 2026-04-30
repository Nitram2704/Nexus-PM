import os
import django
import sys
import json

# Configurar entorno de Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexus.settings')
django.setup()

from apps.intelligence.client import BacklogAIClient

def test_user_story_generation():
    print("--- Probando generacion de Historias de Usuario con Gemma 4 ---")
    client = BacklogAIClient()
    
    if client.is_mock:
        print("ERROR: El cliente esta en modo MOCK. Revisa la GOOGLE_API_KEY en .env")
        return

    requirement = "Modulo de gestion de inventario con alertas de stock bajo y reportes de movimientos diarios."
    
    try:
        stories = client.generate_user_stories(requirement)
        
        print("\nRespuesta recibida de la IA:")
        print(json.dumps(stories, indent=2, ensure_ascii=False))
        
        # Validaciones básicas
        if isinstance(stories, list) and len(stories) > 0:
            print(f"\nExito: Se generaron {len(stories)} historias.")
            first = stories[0]
            required_keys = ["role", "action", "benefit", "acceptance_criteria"]
            if all(k in first for k in required_keys):
                print("Formato de HU: CORRECTO")
            else:
                missing = [k for k in required_keys if k not in first]
                print(f"Formato de HU: INCOMPLETO (faltan: {missing})")
        else:
            print("\nError: La respuesta no es una lista valida.")
            
    except Exception as e:
        print(f"\nError durante la prueba: {str(e)}")

if __name__ == "__main__":
    test_user_story_generation()
