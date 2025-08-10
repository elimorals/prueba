#!/usr/bin/env python3
"""
Script de pruebas para la integración TGI de Hugging Face
Radix IA - Sistema Médico Inteligente
"""

import asyncio
import httpx
import json
import base64
from datetime import datetime

# Configuración
BACKEND_URL = "http://127.0.0.1:8000"
TGI_URL = "https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud"

async def test_tgi_direct():
    """Prueba directa del endpoint TGI para texto"""
    print("🧪 Probando TGI directo para texto...")
    
    request_data = {
        "model": "tgi",
        "messages": [
            {
                "role": "user",
                "content": "¿Qué es el paracetamol y para qué se usa?"
            }
        ],
        "stream": False,
        "temperature": 0.7,
        "max_tokens": 500
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{TGI_URL}/v1/chat/completions",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            result = response.json()
            print("✅ TGI directo: ÉXITO")
            print(f"📝 Respuesta: {result['choices'][0]['message']['content'][:200]}...")
            
    except Exception as e:
        print(f"❌ Error en TGI directo: {e}")

async def test_backend_chat():
    """Prueba del chat médico a través del backend"""
    print("\n🧪 Probando chat médico vía backend...")
    
    request_data = {
        "mensaje": "¿Cuáles son los síntomas de la neumonía?",
        "especialidad": "General",
        "conversacion_id": None,
        "archivos_adjuntos": []
    }
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/v1/chat/mensaje",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            result = response.json()
            print("✅ Chat médico backend: ÉXITO")
            print(f"📝 Respuesta: {result.get('respuesta', '')[:200]}...")
            
    except Exception as e:
        print(f"❌ Error en chat médico: {e}")

async def test_report_generation():
    """Prueba de generación de reportes médicos"""
    print("\n🧪 Probando generación de reportes...")
    
    request_data = {
        "paciente_id": "00000000-0000-0000-0000-000000000000",
        "tipo_estudio": "Radiografía de tórax",
        "contexto_clinico": "Paciente de 45 años con tos persistente y fiebre de 3 días de duración",
        "radiologo": "Dr. IA Asistente",
        "incluir_contexto_rag": True,
        "temperatura": 0.3
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/v1/reportes/generar",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            result = response.json()
            print("✅ Generación de reportes: ÉXITO")
            print(f"📝 Reporte ID: {result.get('data', {}).get('id', 'N/A')}")
            
    except Exception as e:
        print(f"❌ Error en generación de reportes: {e}")

async def test_dicom_analysis():
    """Prueba de análisis de imágenes DICOM"""
    print("\n🧪 Probando análisis de imágenes DICOM...")
    
    # Imagen de ejemplo en base64 (imagen pequeña de prueba)
    sample_image_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
    
    request_data = {
        "imagen_base64": sample_image_b64,
        "contexto_clinico": "Paciente con dolor torácico",
        "tipo_estudio": "Radiografía de tórax",
        "pregunta_especifica": "¿Hay signos de patología pulmonar?"
    }
    
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            response = await client.post(
                f"{BACKEND_URL}/api/v1/dicom/analizar-ia",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            result = response.json()
            print("✅ Análisis DICOM: ÉXITO")
            print(f"📝 Análisis: {result.get('data', {}).get('analisis', '')[:200]}...")
            
    except Exception as e:
        print(f"❌ Error en análisis DICOM: {e}")

async def test_backend_health():
    """Verifica que el backend esté funcionando"""
    print("🔍 Verificando estado del backend...")
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(f"{BACKEND_URL}/docs")
            if response.status_code == 200:
                print("✅ Backend en funcionamiento")
                return True
            else:
                print(f"⚠️ Backend responde con código: {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Backend no responde: {e}")
        return False

async def main():
    """Función principal de pruebas"""
    print("🏥 Radix IA - Pruebas de Integración TGI")
    print("=" * 50)
    print(f"⏰ Inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Verificar backend
    backend_ok = await test_backend_health()
    
    if backend_ok:
        # Pruebas del sistema
        await test_tgi_direct()
        await test_backend_chat()
        await test_report_generation()
        await test_dicom_analysis()
    else:
        print("\n❌ No se pueden ejecutar las pruebas: Backend no disponible")
        print("💡 Asegúrate de que el backend esté ejecutándose en http://127.0.0.1:8000")
    
    print("\n" + "=" * 50)
    print(f"⏰ Fin: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    print("🚀 Iniciando pruebas TGI...")
    asyncio.run(main())