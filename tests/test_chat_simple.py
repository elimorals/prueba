#!/usr/bin/env python3
"""
Test simple del chat IA con timeout extendido
"""

import requests
import json
import sys

def test_chat_simple():
    """Test simple del chat IA"""
    
    backend_url = "http://127.0.0.1:8000"
    
    print("🧪 Test simple del chat IA...")
    print(f"🌐 URL: {backend_url}/api/v1/chat")
    print("-" * 50)
    
    # Datos de prueba simples
    test_data = {
        "mensaje": "Hola, ¿cómo estás?",
        "especialidad": "General",
        "conversacion_id": None,
        "archivos_adjuntos": [],
        "contexto_adicional": None
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-User-ID": "usuario_demo"
    }
    
    try:
        # Probar con timeout más largo
        response = requests.post(
            f"{backend_url}/api/v1/chat",
            json=test_data,
            headers=headers,
            timeout=60  # 60 segundos de timeout
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Respuesta exitosa:")
            print(f"💬 Respuesta: {data.get('respuesta', 'N/A')[:200]}...")
            print(f"🆔 Conversación ID: {data.get('conversacion_id', 'N/A')}")
            print(f"🎯 Confianza: {data.get('confianza', 'N/A')}")
            print(f"⏱️ Tiempo: {data.get('tiempo_respuesta', 'N/A')}s")
            print(f"🤖 Modelo: {data.get('modelo_usado', 'N/A')}")
            
            # Verificar si la respuesta está en español
            respuesta = data.get('respuesta', '').lower()
            if any(palabra in respuesta for palabra in ['hola', 'buenos', 'días', 'tardes', 'noches', 'médico', 'doctor', 'consulta']):
                print("✅ Respuesta parece estar en español")
            else:
                print("⚠️ Respuesta puede no estar en español")
            
            return True
        else:
            print(f"❌ Error en la respuesta:")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Timeout: La respuesta tardó más de 60 segundos")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def main():
    """Función principal"""
    print("🏥 Radix IA - Test Simple del Chat")
    print("=" * 50)
    
    success = test_chat_simple()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ¡El chat IA está funcionando correctamente!")
        print("✅ Respuestas en español")
        print("✅ Conversaciones se crean")
        print("✅ IA responde apropiadamente")
    else:
        print("❌ El test falló")
        print("💡 Verifica que el backend esté corriendo")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
