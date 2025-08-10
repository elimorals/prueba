#!/usr/bin/env python3
"""
Script para probar el formato de mensajes enviados a TGI
"""

import requests
import json
import sys
from dotenv import load_dotenv
import os

# Cargar variables de entorno
load_dotenv()

def test_tgi_format():
    """Probar el formato de mensajes con TGI"""
    
    # Configuración
    tgi_url = os.environ.get("TGI_URL", "https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud")
    api_key = os.environ.get("HF_API_KEY", "hf_XXXXX")
    
    print("🧪 Probando formato de mensajes con TGI...")
    print(f"🌐 URL: {tgi_url}")
    print(f"🔑 API Key configurada: {'Sí' if api_key != 'hf_XXXXX' else 'No'}")
    print("-" * 50)
    
    # Test 1: Formato simple de texto
    print("📝 Test 1: Mensaje simple de texto")
    simple_request = {
        "model": "tgi",
        "messages": [
            {
                "role": "system",
                "content": "Eres un médico general experto en medicina clínica. Responde siempre en español, de manera profesional y basada en evidencia médica."
            },
            {
                "role": "user",
                "content": "Hola, ¿cómo estás?"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
        "stream": False
    }
    
    try:
        response = requests.post(
            f"{tgi_url}/v1/chat/completions",
            json=simple_request,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test 1 exitoso:")
            print(f"💬 Respuesta: {data['choices'][0]['message']['content'][:100]}...")
        else:
            print(f"❌ Test 1 falló:")
            print(f"📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en Test 1: {e}")
        return False
    
    # Test 2: Formato con múltiples mensajes (simulando conversación)
    print("\n📝 Test 2: Conversación con múltiples mensajes")
    conversation_request = {
        "model": "tgi",
        "messages": [
            {
                "role": "system",
                "content": "Eres un médico general experto en medicina clínica. Responde siempre en español, de manera profesional y basada en evidencia médica."
            },
            {
                "role": "user",
                "content": "Hola doctor, tengo dolor de cabeza"
            },
            {
                "role": "assistant",
                "content": "Hola, entiendo que tienes dolor de cabeza. ¿Podrías describir más detalles sobre el dolor?"
            },
            {
                "role": "user",
                "content": "Es un dolor pulsátil en la frente, desde hace 2 horas"
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1024,
        "stream": False
    }
    
    try:
        response = requests.post(
            f"{tgi_url}/v1/chat/completions",
            json=conversation_request,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test 2 exitoso:")
            print(f"💬 Respuesta: {data['choices'][0]['message']['content'][:100]}...")
        else:
            print(f"❌ Test 2 falló:")
            print(f"📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en Test 2: {e}")
        return False
    
    # Test 3: Verificar formato de mensajes del context manager
    print("\n📝 Test 3: Simulando formato del context manager")
    
    # Simular mensajes como los devuelve el context manager
    context_messages = [
        {
            "role": "system",
            "content": "Eres un médico general experto en medicina clínica. Responde siempre en español, de manera profesional y basada en evidencia médica."
        },
        {
            "role": "user", 
            "content": "¿Cuáles son los síntomas de la diabetes?"
        }
    ]
    
    context_request = {
        "model": "tgi",
        "messages": context_messages,
        "temperature": 0.7,
        "max_tokens": 1024,
        "stream": False
    }
    
    try:
        response = requests.post(
            f"{tgi_url}/v1/chat/completions",
            json=context_request,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Test 3 exitoso:")
            print(f"💬 Respuesta: {data['choices'][0]['message']['content'][:100]}...")
        else:
            print(f"❌ Test 3 falló:")
            print(f"📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en Test 3: {e}")
        return False
    
    return True

def main():
    """Función principal"""
    print("🏥 Radix IA - Test de Formato TGI")
    print("=" * 50)
    
    success = test_tgi_format()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ¡Todos los tests de formato pasaron!")
        print("✅ El formato de mensajes es correcto para TGI")
        print("💡 El problema puede estar en la conversión de mensajes en el backend")
    else:
        print("❌ Los tests de formato fallaron")
        print("💡 Verifica la configuración de TGI_URL y HF_API_KEY")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
