import os
import google.generativeai as genai
from decouple import config

api_key = config("GOOGLE_API_KEY", default="your-api-key-here")
genai.configure(api_key=api_key)

print("Listing available models...")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"Model: {m.name} | Display: {m.display_name}")
except Exception as e:
    print(f"Error: {e}")
