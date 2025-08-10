#!/usr/bin/env python3
"""
Test del chat con scroll automático
"""

import requests
import json
import sys

def test_chat_scroll():
    """Test del chat para verificar scroll automático"""
    
    backend_url = "http://127.0.0.1:8000"
    
    print("🧪 Test del chat con scroll automático...")
    print(f"🌐 URL: {backend_url}/api/v1/chat")
    print("-" * 50)
    
    # Mensaje largo para probar scroll
    test_data = {
        "mensaje": "Por favor, dame una explicación muy detallada y extensa sobre el sistema cardiovascular humano, incluyendo anatomía, fisiología, patologías comunes y tratamientos. Quiero que sea muy largo para probar el scroll automático.",
        "especialidad": "Cardiología",
        "conversacion_id": None,
        "archivos_adjuntos": [],
        "contexto_adicional": None
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-User-ID": "usuario_demo"
    }
    
    try:
        print("📝 Enviando mensaje largo para probar scroll...")
        response = requests.post(
            f"{backend_url}/api/v1/chat",
            json=test_data,
            headers=headers,
            timeout=120  # 2 minutos para respuesta larga
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            respuesta = data.get('respuesta', '')
            
            print("✅ Respuesta exitosa:")
            print(f"📏 Longitud de respuesta: {len(respuesta)} caracteres")
            print(f"🆔 Conversación ID: {data.get('conversacion_id', 'N/A')}")
            print(f"⏱️ Tiempo: {data.get('tiempo_respuesta', 'N/A')}s")
            
            # Verificar que la respuesta sea larga
            if len(respuesta) > 500:
                print("✅ Respuesta suficientemente larga para probar scroll")
                print("💡 Ahora verifica en la UI que:")
                print("   - La barra de desplazamiento sea visible")
                print("   - El scroll automático funcione durante la generación")
                print("   - El botón 'Ir al final' aparezca cuando no estés abajo")
                print("   - El texto se mantenga visible mientras se genera")
            else:
                print("⚠️ Respuesta no es suficientemente larga para probar scroll")
            
            return True
        else:
            print(f"❌ Error en la respuesta:")
            print(f"📄 Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Timeout: La respuesta tardó más de 2 minutos")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

def main():
    """Función principal"""
    print("🏥 Radix IA - Test de Scroll del Chat")
    print("=" * 50)
    
    success = test_chat_scroll()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 ¡Test completado!")
        print("💡 Verifica en la UI que el scroll automático funcione correctamente")
    else:
        print("❌ El test falló")
        print("💡 Verifica que el backend esté corriendo")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
