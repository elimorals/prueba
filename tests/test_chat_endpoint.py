#!/usr/bin/env python3
"""
Script para probar el endpoint de chat desde el frontend
"""

import requests
import json
import sys

def test_chat_endpoint():
    """Probar el endpoint de chat"""
    
    # URL del backend
    backend_url = "http://127.0.0.1:8000"
    
    # Datos de prueba
    test_data = {
        "mensaje": "Hola, ¿cómo estás? Soy un médico y tengo una consulta sobre diabetes.",
        "especialidad": "General",
        "conversacion_id": None,
        "archivos_adjuntos": [],
        "contexto_adicional": None
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-User-ID": "usuario_demo"
    }
    
    print("🧪 Probando endpoint de chat...")
    print(f"🌐 URL: {backend_url}/api/v1/chat")
    print(f"📝 Mensaje: {test_data['mensaje']}")
    print(f"🏥 Especialidad: {test_data['especialidad']}")
    print("-" * 50)
    
    try:
        # Probar el endpoint
        response = requests.post(
            f"{backend_url}/api/v1/chat",
            json=test_data,
            headers=headers,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Respuesta exitosa:")
            print(f"💬 Respuesta: {data.get('respuesta', 'N/A')[:100]}...")
            print(f"🆔 Conversación ID: {data.get('conversacion_id', 'N/A')}")
            print(f"🎯 Confianza: {data.get('confianza', 'N/A')}")
            print(f"⏱️ Tiempo: {data.get('tiempo_respuesta', 'N/A')}s")
            print(f"🤖 Modelo: {data.get('modelo_usado', 'N/A')}")
            
            return True
        else:
            print(f"❌ Error en la respuesta:")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se puede conectar al backend")
        print("💡 Asegúrate de que el backend esté corriendo en http://127.0.0.1:8000")
        return False
        
    except requests.exceptions.Timeout:
        print("❌ Timeout: La respuesta tardó demasiado")
        return False
        
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def test_health_endpoint():
    """Probar el endpoint de health check"""
    
    backend_url = "http://127.0.0.1:8000"
    
    print("\n🏥 Probando health check...")
    
    try:
        response = requests.get(f"{backend_url}/health", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health check exitoso:")
            print(f"📊 Status: {data.get('status', 'N/A')}")
            print(f"🗄️ Database: {data.get('database', 'N/A')}")
            print(f"⏰ Timestamp: {data.get('timestamp', 'N/A')}")
            return True
        else:
            print(f"❌ Health check falló: {response.status_code}")
            print(f"📄 Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error en health check: {e}")
        return False

def main():
    """Función principal"""
    print("🏥 Radix IA - Test de Endpoints")
    print("=" * 50)
    
    # Probar health check primero
    health_ok = test_health_endpoint()
    
    if not health_ok:
        print("\n❌ El backend no está funcionando correctamente")
        print("💡 Verifica que el backend esté corriendo:")
        print("   cd backend && uvicorn main:app --reload --host 127.0.0.1 --port 8000")
        sys.exit(1)
    
    # Probar endpoint de chat
    chat_ok = test_chat_endpoint()
    
    print("\n" + "=" * 50)
    if chat_ok:
        print("🎉 ¡Todos los tests pasaron exitosamente!")
        print("✅ El chat IA está funcionando correctamente")
    else:
        print("❌ Los tests fallaron")
        print("💡 Revisa los errores anteriores y sigue las instrucciones en SOLUCION_ERRORES_CHAT.md")
    
    return 0 if chat_ok else 1

if __name__ == "__main__":
    sys.exit(main())
