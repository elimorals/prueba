#!/usr/bin/env python3
"""
Script de prueba para verificar la API de embeddings multilingual
"""
import requests
import asyncio
import sys
import os

# Añadir el directorio backend al path para importar EmbeddingService
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services import EmbeddingService

def test_direct_api():
    """Prueba directa con requests"""
    print("🧪 Probando API directamente con requests...")
    
    def query(payload):
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json" 
        }
        response = requests.post(
            "https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud", 
            headers=headers, 
            json=payload
        )
        return response.json()

    # Texto de prueba en español (médico)
    texto_prueba = "El paciente presenta dolor abdominal agudo en cuadrante superior derecho"
    
    try:
        output = query({
            "inputs": texto_prueba,
            "parameters": {}
        })
        
        print(f"✅ Respuesta recibida:")
        print(f"   Tipo: {type(output)}")
        if isinstance(output, list):
            print(f"   Dimensiones: {len(output)}")
            print(f"   Primeros 5 valores: {output[:5]}")
        else:
            print(f"   Contenido: {output}")
            
        return output
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

async def test_embedding_service():
    """Prueba usando nuestro EmbeddingService"""
    print("\n🔧 Probando con EmbeddingService...")
    
    embedding_service = EmbeddingService("https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud")
    
    # Textos de prueba médicos en español
    textos_prueba = [
        "Dolor torácico precordial con irradiación al brazo izquierdo",
        "Cefalea tensional bilateral pulsátil",
        "Fractura de radio distal con desplazamiento",
        "Neumonía adquirida en la comunidad"
    ]
    
    try:
        for i, texto in enumerate(textos_prueba, 1):
            print(f"\n   Probando texto {i}: '{texto[:40]}...'")
            embedding = await embedding_service.encode(texto)
            
            print(f"   ✅ Embedding generado:")
            print(f"      Dimensiones: {len(embedding)}")
            print(f"      Tipo: {type(embedding)}")
            print(f"      Rango: [{min(embedding):.4f}, {max(embedding):.4f}]")
            
        print(f"\n✅ Todas las pruebas completadas exitosamente!")
        return True
        
    except Exception as e:
        print(f"❌ Error en EmbeddingService: {e}")
        return False

async def test_similarity():
    """Prueba de similitud entre textos médicos"""
    print("\n🔍 Probando similitud semántica...")
    
    embedding_service = EmbeddingService("https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud")
    
    # Textos similares
    texto1 = "dolor de cabeza intenso"
    texto2 = "cefalea severa"
    texto3 = "fractura de brazo"
    
    try:
        emb1 = await embedding_service.encode(texto1)
        emb2 = await embedding_service.encode(texto2)
        emb3 = await embedding_service.encode(texto3)
        
        # Calcular similitud coseno simple
        import numpy as np
        
        def cosine_similarity(a, b):
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
        
        sim_1_2 = cosine_similarity(emb1, emb2)
        sim_1_3 = cosine_similarity(emb1, emb3)
        
        print(f"   Similitud '{texto1}' vs '{texto2}': {sim_1_2:.4f}")
        print(f"   Similitud '{texto1}' vs '{texto3}': {sim_1_3:.4f}")
        
        if sim_1_2 > sim_1_3:
            print("   ✅ Correcto: textos médicos similares tienen mayor similitud")
        else:
            print("   ⚠️  Atención: similitud inesperada")
            
    except Exception as e:
        print(f"❌ Error en prueba de similitud: {e}")

def main():
    print("🚀 Iniciando pruebas del servicio de embeddings multilingual...")
    print("=" * 60)
    
    # Prueba directa
    direct_result = test_direct_api()
    
    if direct_result:
        # Prueba con nuestro servicio
        asyncio.run(test_embedding_service())
        
        # Prueba de similitud (requiere numpy)
        try:
            import numpy as np
            asyncio.run(test_similarity())
        except ImportError:
            print("\n⚠️  Saltando prueba de similitud (numpy no disponible)")
    
    print("\n" + "=" * 60)
    print("🎉 Pruebas completadas!")

if __name__ == "__main__":
    main()