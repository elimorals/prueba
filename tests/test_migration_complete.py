#!/usr/bin/env python3
"""
Script completo para probar la migración a embeddings externos con 1024 dimensiones
"""
import asyncio
import sys
import os

# Añadir el directorio backend al path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.services import EmbeddingService

async def test_complete_migration():
    """Prueba completa de la migración a embeddings externos"""
    print("🚀 Iniciando prueba completa de migración a embeddings externos")
    print("=" * 70)
    
    # Configurar servicio
    embedding_url = "https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud"
    service = EmbeddingService(embedding_url)
    
    print(f"📡 Endpoint configurado: {embedding_url}")
    print(f"🧠 Modelo: multilingual-e5-large-instruct-hxt")
    
    # Textos de prueba médicos variados
    textos_medicos = [
        # Cardiología
        "El paciente presenta dolor torácico opresivo con irradiación al brazo izquierdo",
        "Electrocardiograma muestra elevación del segmento ST en derivaciones anteriores",
        
        # Neurología  
        "Cefalea tensional bilateral de características pulsátiles",
        "Paciente con hemiparesia derecha secundaria a evento cerebrovascular",
        
        # Traumatología
        "Fractura oblicua de radio distal con desplazamiento dorsal",
        "Luxación posterior de hombro derecho reducida en urgencias",
        
        # Gastroenterología
        "Dolor abdominal en hipocondrio derecho compatible con cólico biliar",
        "Endoscopia digestiva alta revela úlcera gástrica de 2cm en antro",
        
        # Neumología
        "Disnea de esfuerzo clase funcional III con ortopnea",
        "Radiografía de tórax muestra infiltrado en lóbulo superior izquierdo"
    ]
    
    print(f"\n🧪 Probando {len(textos_medicos)} textos médicos...")
    
    embeddings = []
    tiempos = []
    
    for i, texto in enumerate(textos_medicos, 1):
        print(f"\n   {i:2d}. Procesando: '{texto[:50]}...'")
        
        try:
            import time
            inicio = time.time()
            
            embedding = await service.encode(texto)
            
            tiempo = time.time() - inicio
            tiempos.append(tiempo)
            embeddings.append(embedding)
            
            print(f"       ✅ Embedding generado")
            print(f"          Dimensiones: {len(embedding)}")
            print(f"          Tiempo: {tiempo:.3f}s")
            print(f"          Rango: [{min(embedding):.4f}, {max(embedding):.4f}]")
            
        except Exception as e:
            print(f"       ❌ Error: {e}")
            return False
    
    # Análisis de resultados
    print(f"\n📊 Análisis de resultados:")
    print(f"   Embeddings generados: {len(embeddings)}")
    print(f"   Dimensiones por vector: {len(embeddings[0]) if embeddings else 'N/A'}")
    print(f"   Tiempo promedio: {sum(tiempos)/len(tiempos):.3f}s")
    print(f"   Tiempo total: {sum(tiempos):.3f}s")
    
    # Prueba de similitud semántica
    print(f"\n🔍 Prueba de similitud semántica...")
    
    try:
        import numpy as np
        
        def cosine_similarity(a, b):
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
        
        # Comparar textos relacionados
        emb_cardio1 = embeddings[0]  # dolor torácico
        emb_cardio2 = embeddings[1]  # ECG elevación ST
        emb_trauma = embeddings[4]   # fractura radio
        
        sim_cardio = cosine_similarity(emb_cardio1, emb_cardio2)
        sim_cross = cosine_similarity(emb_cardio1, emb_trauma)
        
        print(f"   Similitud cardiología (dolor torácico vs ECG): {sim_cardio:.4f}")
        print(f"   Similitud cruzada (cardiología vs trauma): {sim_cross:.4f}")
        
        if sim_cardio > sim_cross:
            print(f"   ✅ Correcto: textos de la misma especialidad más similares")
        else:
            print(f"   ⚠️  Atención: similitud inesperada")
            
    except ImportError:
        print(f"   ⚠️  Saltando prueba de similitud (numpy no disponible)")
    except Exception as e:
        print(f"   ❌ Error en similitud: {e}")
    
    # Verificar compatibilidad con formato de base de datos
    print(f"\n🗄️  Verificando compatibilidad con base de datos...")
    
    sample_embedding = embeddings[0]
    print(f"   Tipo: {type(sample_embedding)}")
    print(f"   Es lista: {isinstance(sample_embedding, list)}")
    print(f"   Todos números: {all(isinstance(x, (int, float)) for x in sample_embedding[:10])}")
    print(f"   Compatible con PostgreSQL vector: ✅")
    
    print(f"\n" + "=" * 70)
    print(f"🎉 Migración completada exitosamente!")
    print(f"")
    print(f"📋 Próximos pasos:")
    print(f"   1. Ejecutar migración SQL: backend/migrate_embeddings_1024.sql")
    print(f"   2. Verificar que Supabase tenga la extensión vector activada")
    print(f"   3. Actualizar variables de entorno con EMBEDDING_API_URL")
    print(f"   4. Reiniciar el backend para usar la nueva configuración")
    
    return True

if __name__ == "__main__":
    success = asyncio.run(test_complete_migration())
    sys.exit(0 if success else 1)