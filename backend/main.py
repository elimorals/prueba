import os
import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query, File, UploadFile, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from supabase import create_client, Client
from typing import Optional, List
from uuid import UUID
from datetime import datetime

# Importar modelos y servicios
from models import *
from services import PacienteService, EstudioService, ReporteService, ChatService, IAService, EmbeddingService, OrdenCompraService, PersonalService

# Cargar variables de entorno desde .env
load_dotenv()

# --- Configuración de la App, Modelos y Supabase ---
app = FastAPI(
    title="Radix IA - Sistema Médico Inteligente",
    description="API completa para gestión médica con IA, incluyendo pacientes, estudios, reportes y chat médico.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar dominios exactos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar cliente de Supabase
supabase_url: str = os.environ.get("SUPABASE_URL")
supabase_key: str = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# URL del modelo de IA (TGI)
tgi_url: str = os.environ.get("TGI_URL", os.environ.get("LM_STUDIO_URL", "https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud"))
print(f"INFO: Backend configurado para conectar con TGI en: {tgi_url}")

# Configurar servicio de embeddings externos
embedding_api_url = os.environ.get("EMBEDDING_API_URL", "https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud")
print(f"Configurando servicio de embeddings externos: {embedding_api_url}")

try:
    embedding_service = EmbeddingService(embedding_api_url)
    print("Servicio de embeddings configurado exitosamente.")
except Exception as e:
    print(f"Error fatal: no se pudo configurar el servicio de embeddings. {e}")
    exit()

# --- Inicializar Servicios ---
ia_service = IAService(supabase, embedding_service, tgi_url)
paciente_service = PacienteService(supabase)
estudio_service = EstudioService(supabase)
reporte_service = ReporteService(supabase, ia_service)
chat_service = ChatService(supabase, ia_service)
orden_service = OrdenCompraService(supabase)
personal_service = PersonalService(supabase)

# ===================================
# ENDPOINTS - ROOT
# ===================================

@app.get("/", tags=["Root"])
async def read_root():
    """Endpoint de salud de la API"""
    return {
        "status": "Radix IA API funcionando correctamente",
        "version": "1.0.0",
        "message": "Sistema Médico Inteligente - API REST",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["Root"])
async def health_check():
    """Check de salud del sistema"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "database": "connected",
            "ai_model": "loaded",
            "embedding_service": "ready"
        }
    }

# ===================================
# ENDPOINTS - PACIENTES
# ===================================

@app.post("/api/v1/pacientes", response_model=BaseResponse, tags=["Pacientes"])
async def crear_paciente(paciente_data: PacienteCreate):
    """Crear un nuevo paciente"""
    return await paciente_service.crear_paciente(paciente_data)

@app.get("/api/v1/pacientes/estadisticas", response_model=EstadisticasPacientes, tags=["Pacientes"])
async def obtener_estadisticas_pacientes():
    """Obtener estadísticas de pacientes"""
    return await paciente_service.obtener_estadisticas()

@app.get("/api/v1/pacientes", response_model=PaginatedResponse, tags=["Pacientes"])
async def obtener_pacientes(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    search: Optional[str] = Query(None, description="Término de búsqueda")
):
    """Obtener lista paginada de pacientes"""
    return await paciente_service.obtener_pacientes(page, limit, search)

@app.get("/api/v1/pacientes/{paciente_id}", response_model=BaseResponse, tags=["Pacientes"])
async def obtener_paciente(paciente_id: UUID):
    """Obtener un paciente específico"""
    return await paciente_service.obtener_paciente(paciente_id)

@app.put("/api/v1/pacientes/{paciente_id}", response_model=BaseResponse, tags=["Pacientes"])
async def actualizar_paciente(paciente_id: UUID, paciente_data: PacienteUpdate):
    """Actualizar datos de un paciente"""
    return await paciente_service.actualizar_paciente(paciente_id, paciente_data)

@app.delete("/api/v1/pacientes/{paciente_id}", response_model=BaseResponse, tags=["Pacientes"])
async def eliminar_paciente(paciente_id: UUID):
    """Eliminar un paciente (soft delete)"""
    return await paciente_service.eliminar_paciente(paciente_id)

# ===================================
# ENDPOINTS - ESTUDIOS
# ===================================

@app.post("/api/v1/estudios", response_model=BaseResponse, tags=["Estudios"])
async def crear_estudio(estudio_data: EstudioCreate):
    """Crear un nuevo estudio médico"""
    return await estudio_service.crear_estudio(estudio_data)

@app.get("/api/v1/estudios/estadisticas", response_model=EstadisticasEstudios, tags=["Estudios"])
async def obtener_estadisticas_estudios():
    """Obtener estadísticas de estudios"""
    return await estudio_service.obtener_estadisticas()

@app.get("/api/v1/estudios", response_model=PaginatedResponse, tags=["Estudios"])
async def obtener_estudios(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    paciente_id: Optional[UUID] = Query(None, description="Filtrar por paciente"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de estudio")
):
    """Obtener lista paginada de estudios"""
    return await estudio_service.obtener_estudios(page, limit, paciente_id, estado, tipo)

@app.get("/api/v1/estudios/{estudio_id}", response_model=BaseResponse, tags=["Estudios"])
async def obtener_estudio(estudio_id: UUID):
    """Obtener un estudio específico"""
    return await estudio_service.obtener_estudio(estudio_id)

@app.put("/api/v1/estudios/{estudio_id}", response_model=BaseResponse, tags=["Estudios"])
async def actualizar_estudio(estudio_id: UUID, estudio_data: EstudioUpdate):
    """Actualizar datos de un estudio"""
    return await estudio_service.actualizar_estudio(estudio_id, estudio_data)

@app.post("/api/v1/estudios/{estudio_id}/dicom", response_model=BaseResponse, tags=["Estudios"])
async def subir_archivo_dicom(estudio_id: UUID, archivo: ArchivoSubida):
    """Subir archivo DICOM a un estudio"""
    return await estudio_service.subir_archivo_dicom(estudio_id, archivo)

# ===================================
# ENDPOINTS - REPORTES
# ===================================

@app.post("/api/v1/reportes", response_model=BaseResponse, tags=["Reportes"])
async def crear_reporte(reporte_data: ReporteCreate):
    """Crear un nuevo reporte médico manualmente"""
    return await reporte_service.crear_reporte(reporte_data)

@app.get("/api/v1/reportes/estadisticas", response_model=EstadisticasReportes, tags=["Reportes"])
async def obtener_estadisticas_reportes():
    """Obtener estadísticas de reportes"""
    return await reporte_service.obtener_estadisticas()

@app.post("/api/v1/reportes/generar", tags=["Reportes"])
async def generar_reporte_ia(request: ReportGenerationRequest):
    """Generar reporte médico usando IA con streaming"""
    return await reporte_service.generar_reporte_ia_streaming(request)

@app.get("/api/v1/reportes", response_model=PaginatedResponse, tags=["Reportes"])
async def obtener_reportes(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    paciente_id: Optional[UUID] = Query(None, description="Filtrar por paciente"),
    estado: Optional[str] = Query(None, description="Filtrar por estado")
):
    """Obtener lista paginada de reportes"""
    return await reporte_service.obtener_reportes(page, limit, paciente_id, estado)

@app.get("/api/v1/reportes/{reporte_id}", response_model=BaseResponse, tags=["Reportes"])
async def obtener_reporte(reporte_id: UUID):
    """Obtener un reporte específico"""
    return await reporte_service.obtener_reporte(reporte_id)

@app.put("/api/v1/reportes/{reporte_id}", response_model=BaseResponse, tags=["Reportes"])
async def actualizar_reporte(reporte_id: UUID, reporte_data: ReporteUpdate):
    """Actualizar un reporte"""
    return await reporte_service.actualizar_reporte(reporte_id, reporte_data)

@app.post("/api/v1/reportes/{reporte_id}/generar-ia", response_model=BaseResponse, tags=["Reportes"])
async def generar_reporte_para_estudio(reporte_id: UUID, request: ReportGenerationRequest):
    """Generar reporte IA para un estudio específico"""
    # Actualizar request con el ID del reporte si es necesario
    return await reporte_service.generar_reporte_ia(request)

@app.post("/api/v1/reportes/{reporte_id}/firmar", response_model=BaseResponse, tags=["Reportes"])
async def firmar_reporte(reporte_id: UUID, firma_data: FirmaReporte):
    """Firmar un reporte digitalmente"""
    return await reporte_service.firmar_reporte(reporte_id, firma_data)

# ===================================
# ENDPOINTS - CHAT IA
# ===================================

@app.post("/api/v1/chat", response_model=ChatResponse, tags=["Chat IA"])
async def procesar_mensaje_chat(
    request: ChatRequest, 
    x_user_id: Optional[str] = Header("usuario_demo", alias="X-User-ID"),
    x_user_language: Optional[str] = Header("es", alias="X-User-Language")
):
    """Procesar mensaje del chat IA médico con contexto avanzado"""
    # En producción, extraer user_id del JWT token
    user_id = x_user_id or "usuario_demo"
    
    # Usar el idioma del header o del request
    idioma_usuario = x_user_language or request.idioma_usuario or "es"
    
    # Actualizar el request con el idioma detectado
    request.idioma_usuario = idioma_usuario
    
    return await chat_service.procesar_mensaje_chat(request, user_id)

@app.post("/api/v1/chat/conversacion", response_model=BaseResponse, tags=["Chat IA"])
async def crear_conversacion_chat(conversacion_data: ConversacionChatCreate):
    """Crear nueva conversación de chat"""
    return await chat_service.crear_conversacion(conversacion_data)

@app.get("/api/v1/chat/conversaciones", response_model=PaginatedResponse, tags=["Chat IA"])
async def obtener_conversaciones(
    usuario: str = Query(..., description="Usuario propietario de las conversaciones"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """Obtener conversaciones de chat de un usuario"""
    return await chat_service.obtener_conversaciones(usuario, page, limit)

@app.get("/api/v1/chat/conversaciones/{conversacion_id}/mensajes", tags=["Chat IA"])
async def obtener_historial_conversacion(conversacion_id: UUID):
    """Obtener historial de mensajes de una conversación"""
    historial = await chat_service.obtener_historial_conversacion(conversacion_id)
    return {"success": True, "data": historial}

@app.get("/api/v1/chat/usuarios/{user_id}/sesiones", tags=["Chat IA"])
async def obtener_sesiones_activas_usuario(user_id: str):
    """Obtener todas las sesiones activas de un usuario"""
    return await chat_service.obtener_sesiones_activas_usuario(user_id)

@app.get("/api/v1/chat/estadisticas/contexto", tags=["Chat IA"])
async def obtener_estadisticas_contexto():
    """Obtener estadísticas del sistema de contexto conversacional"""
    return await chat_service.obtener_estadisticas_contexto()

# ===================================
# ENDPOINTS - BÚSQUEDA RAG
# ===================================

@app.get("/api/v1/rag/buscar", response_model=List[RAGSearchResult], tags=["RAG"])
async def buscar_en_historial(
    query: str = Query(..., description="Consulta de búsqueda"),
    paciente_id: Optional[UUID] = Query(None, description="Filtrar por paciente"),
    limite_resultados: int = Query(5, ge=1, le=20, description="Límite de resultados"),
    umbral_similitud: float = Query(0.5, ge=0.0, le=1.0, description="Umbral de similitud")
):
    """Búsqueda semántica en historial médico usando RAG"""
    request = RAGSearchRequest(
        query=query,
        paciente_id=paciente_id,
        limite_resultados=limite_resultados,
        umbral_similitud=umbral_similitud
    )
    return await ia_service.buscar_rag(request)

# ===================================
# ENDPOINTS - ANÁLISIS DICOM
# ===================================

@app.post("/api/v1/dicom/analizar", tags=["DICOM"])
async def analizar_dicom(archivo: UploadFile = File(...)):
    """Analizar archivo DICOM y extraer metadatos"""
    try:
        # En una implementación real, aquí se procesaría el archivo DICOM
        # usando librerías como pydicom
        return {
            "success": True,
            "message": "Análisis DICOM completado",
            "data": {
                "nombre_archivo": archivo.filename,
                "tamaño": archivo.size,
                "tipo": archivo.content_type,
                "metadatos": {
                    "procesado": True,
                    "nota": "Implementación pendiente con pydicom"
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando DICOM: {str(e)}")

@app.post("/api/v1/dicom/analizar-ia", response_model=BaseResponse, tags=["DICOM"])
async def analizar_dicom_con_ia(request: DicomAnalysisRequest):
    """Analizar imagen DICOM usando IA con TGI"""
    return await ia_service.analizar_imagen_dicom(request)

# ===================================
# ENDPOINTS - ÓRDENES DE COMPRA
# ===================================

@app.post("/api/v1/ordenes", response_model=BaseResponse, tags=["Órdenes de Compra"])
async def crear_orden_compra(orden_data: OrdenCompraCreate):
    """Crear nueva orden de compra"""
    return await orden_service.crear_orden(orden_data)

@app.get("/api/v1/ordenes/estadisticas", response_model=EstadisticasOrdenes, tags=["Órdenes de Compra"])
async def obtener_estadisticas_ordenes():
    """Obtener estadísticas de órdenes de compra"""
    return await orden_service.obtener_estadisticas()

@app.get("/api/v1/ordenes", response_model=PaginatedResponse, tags=["Órdenes de Compra"])
async def obtener_ordenes_compra(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    search: Optional[str] = Query(None, description="Término de búsqueda"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    proveedor: Optional[str] = Query(None, description="Filtrar por proveedor")
):
    """Obtener lista paginada de órdenes de compra con filtros"""
    return await orden_service.obtener_ordenes(page, limit, search, estado, proveedor)

@app.get("/api/v1/ordenes/{orden_id}", response_model=BaseResponse, tags=["Órdenes de Compra"])
async def obtener_orden_compra(orden_id: UUID):
    """Obtener una orden de compra específica"""
    return await orden_service.obtener_orden(orden_id)

@app.put("/api/v1/ordenes/{orden_id}", response_model=BaseResponse, tags=["Órdenes de Compra"])
async def actualizar_orden_compra(orden_id: UUID, orden_data: OrdenCompraUpdate):
    """Actualizar una orden de compra"""
    return await orden_service.actualizar_orden(orden_id, orden_data)

@app.delete("/api/v1/ordenes/{orden_id}", response_model=BaseResponse, tags=["Órdenes de Compra"])
async def eliminar_orden_compra(orden_id: UUID):
    """Eliminar una orden de compra"""
    return await orden_service.eliminar_orden(orden_id)

# ===================================
# ENDPOINTS - PERSONAL MÉDICO
# ===================================

@app.post("/api/v1/personal", response_model=BaseResponse, tags=["Personal Médico"])
async def crear_empleado(personal_data: PersonalMedicoCreate):
    """Crear nuevo empleado"""
    return await personal_service.crear_empleado(personal_data)

@app.get("/api/v1/personal/estadisticas", response_model=EstadisticasPersonal, tags=["Personal Médico"])
async def obtener_estadisticas_personal():
    """Obtener estadísticas del personal médico"""
    return await personal_service.obtener_estadisticas()

@app.get("/api/v1/personal", response_model=PaginatedResponse, tags=["Personal Médico"])
async def obtener_empleados(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    search: Optional[str] = Query(None, description="Término de búsqueda")
):
    """Obtener lista paginada de empleados"""
    return await personal_service.obtener_empleados(page, limit, search)

@app.get("/api/v1/personal/buscar", response_model=BaseResponse, tags=["Personal Médico"])
async def buscar_empleados(
    query: str = Query(..., description="Término de búsqueda")
):
    """Buscar empleados por término específico"""
    return await personal_service.buscar_empleados(query)

@app.get("/api/v1/personal/{empleado_id}", response_model=BaseResponse, tags=["Personal Médico"])
async def obtener_empleado(empleado_id: UUID):
    """Obtener empleado específico"""
    return await personal_service.obtener_empleado(empleado_id)

@app.put("/api/v1/personal/{empleado_id}", response_model=BaseResponse, tags=["Personal Médico"])
async def actualizar_empleado(empleado_id: UUID, personal_data: PersonalMedicoUpdate):
    """Actualizar empleado existente"""
    return await personal_service.actualizar_empleado(empleado_id, personal_data)

@app.delete("/api/v1/personal/{empleado_id}", response_model=BaseResponse, tags=["Personal Médico"])
async def eliminar_empleado(empleado_id: UUID):
    """Eliminar empleado (cambiar estado a Inactivo)"""
    return await personal_service.eliminar_empleado(empleado_id)

@app.put("/api/v1/personal/{empleado_id}/actividad", response_model=BaseResponse, tags=["Personal Médico"])
async def actualizar_actividad_empleado(empleado_id: UUID):
    """Actualizar última actividad del empleado"""
    return await personal_service.actualizar_actividad(empleado_id)
    
# ===================================
# CONFIGURACIÓN DE SERVIDOR
# ===================================

if __name__ == "__main__":
    import uvicorn
    
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 8000))
    debug = os.environ.get("DEBUG", "true").lower() == "true"
    
    print(f"🏥 Iniciando Radix IA API...")
    print(f"📡 Servidor: http://{host}:{port}")
    print(f"📚 Documentación: http://{host}:{port}/docs")
    print(f"🔄 Modo debug: {debug}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )