import os
from decouple import config
import google.generativeai as genai

api_key = config('GOOGLE_API_KEY', default=None)
if not api_key:
    print("No API key found.")
else:
    genai.configure(api_key=api_key)
    print("Listing models...")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(m.name)
    except Exception as e:
        print(f"Error: {e}")
