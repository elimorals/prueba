# services.py - Radix IA
"""
Capa de servicios que contiene toda la lógica de negocio del sistema médico.
Incluye servicios para pacientes, estudios, reportes, chat IA y búsqueda RAG.
"""

import os
import time
import hashlib
import asyncio
from typing import List, Optional, Dict, Any, Tuple, AsyncGenerator
from uuid import UUID, uuid4
from datetime import datetime, timedelta
from math import ceil

import httpx
from supabase import Client
from context_manager import ContextManager, get_context_manager

from models import (
    # Pacientes
    Paciente, PacienteCreate, PacienteUpdate, EstadisticasPacientes,
    # Estudios
    Estudio, EstudioCreate, EstudioUpdate, EstadisticasEstudios,
    # Reportes
    Reporte, ReporteCreate, ReporteUpdate, ReportGenerationRequest, 
    FirmaReporte, EstadisticasReportes,
    # Chat
    ConversacionChat, ConversacionChatCreate, MensajeChat, MensajeChatCreate,
    ChatRequest, ChatResponse, ChatMessage,
    # RAG
    RAGSearchRequest, RAGSearchResult,
    # Órdenes de Compra
    OrdenCompra, OrdenCompraCreate, OrdenCompraUpdate, OrdenDetalle,
    OrdenDetalleCreate, EstadisticasOrdenes, EstadoOrdenEnum,
    # Personal Médico
    PersonalMedico, PersonalMedicoCreate, PersonalMedicoUpdate, EstadisticasPersonal,
    EstadoPersonalEnum, TurnoEnum, DepartamentoEnum,
    # Otros
    LMStudioRequest, TGIRequest, TGIImageRequest, DicomAnalysisRequest,
    PaginatedResponse, BaseResponse, ArchivoSubida,
    # Enums
    EstadoReporteEnum, EspecialidadEnum, RolChatEnum
)

# ===================================
# CONFIGURACIÓN Y UTILIDADES
# ===================================

class EmbeddingService:
    """Servicio para generar embeddings usando API externa de Hugging Face"""
    
    def __init__(self, api_url: str):
        self.api_url = api_url
        self.headers = {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    async def encode(self, text: str) -> List[float]:
        """Generar embedding para un texto usando la API externa"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    self.api_url,
                    headers=self.headers,
                    json={
                        "inputs": text,
                        "parameters": {}
                    }
                )
                
                if not response.is_success:
                    raise Exception(f"Error en API de embeddings: {response.status_code} - {response.text}")
                
                result = response.json()
                
                # El resultado puede venir en diferentes formatos
                if isinstance(result, list):
                    # Si es una lista directa de números
                    if result and isinstance(result[0], (int, float)):
                        return result
                    # Si es una lista con un vector anidado (caso actual)
                    elif result and isinstance(result[0], list):
                        return result[0]  # El vector está en el primer elemento
                    # Si es una lista con objetos
                    elif result and isinstance(result[0], dict) and 'embedding' in result[0]:
                        return result[0]['embedding']
                    else:
                        return result[0] if result else []  # Asumir que el primer elemento es el vector
                elif isinstance(result, dict):
                    # Si es un objeto con la clave embedding
                    if 'embedding' in result:
                        return result['embedding']
                    elif 'embeddings' in result:
                        return result['embeddings'][0] if isinstance(result['embeddings'][0], list) else result['embeddings']
                    else:
                        # Buscar cualquier lista de números
                        for value in result.values():
                            if isinstance(value, list) and len(value) > 0 and isinstance(value[0], (int, float)):
                                return value
                
                raise ValueError(f"Formato de respuesta inesperado: {result}")
                
        except httpx.TimeoutException:
            raise Exception("Timeout al generar embedding")
        except Exception as e:
            print(f"Error generando embedding: {e}")
            raise e
    
    def encode_sync(self, text: str) -> List[float]:
        """Versión síncrona para compatibilidad (usar encode() preferentemente)"""
        import asyncio
        return asyncio.run(self.encode(text))

class DatabaseService:
    """Clase base para servicios que interactúan con la base de datos"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def handle_db_error(self, error: Exception) -> Dict[str, Any]:
        """Maneja errores de base de datos de forma consistente"""
        return {
            "success": False,
            "message": f"Error de base de datos: {str(error)}",
            "data": None
        }

# ===================================
# SERVICIO DE PACIENTES
# ===================================

class PacienteService(DatabaseService):
    """Servicio para gestión completa de pacientes"""
    
    async def crear_paciente(self, paciente_data: PacienteCreate) -> BaseResponse:
        """Crear un nuevo paciente con número automático"""
        try:
            # Generar número de paciente automático
            numero_result = self.supabase.rpc('generate_patient_number').execute()
            numero_paciente = numero_result.data
            
            # Preparar datos para inserción
            paciente_dict = paciente_data.model_dump()
            paciente_dict['numero_paciente'] = numero_paciente
            
            # Convertir contacto_emergencia a JSONB si existe
            if paciente_dict.get('contacto_emergencia'):
                paciente_dict['contacto_emergencia'] = paciente_dict['contacto_emergencia']
            
            # Insertar en base de datos
            result = self.supabase.table('pacientes').insert(paciente_dict).execute()
            
            return BaseResponse(
                success=True,
                message="Paciente creado exitosamente",
                data=result.data[0] if result.data else None
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_pacientes(self, page: int = 1, limit: int = 10, 
                               search: Optional[str] = None) -> PaginatedResponse:
        """Obtener lista paginada de pacientes con búsqueda opcional"""
        try:
            offset = (page - 1) * limit
            
            # Construir query base
            query = self.supabase.table('pacientes').select('*', count='exact')
            
            # Aplicar filtros de búsqueda si se proporciona
            if search:
                query = query.or_(f'nombre.ilike.%{search}%,'
                                f'apellido.ilike.%{search}%,'
                                f'numero_paciente.ilike.%{search}%,'
                                f'email.ilike.%{search}%')
            
            # Aplicar paginación y ordenamiento
            query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
            
            result = query.execute()
            
            # Calcular metadatos de paginación
            total = result.count if result.count else 0
            pages = ceil(total / limit) if total > 0 else 1
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            )
            
        except Exception as e:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=1
            )
    
    async def obtener_paciente(self, paciente_id: UUID) -> BaseResponse:
        """Obtener un paciente específico por ID"""
        try:
            result = self.supabase.table('pacientes').select('*').eq('id', str(paciente_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Paciente no encontrado",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Paciente encontrado",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def actualizar_paciente(self, paciente_id: UUID, 
                                 paciente_data: PacienteUpdate) -> BaseResponse:
        """Actualizar datos de un paciente"""
        try:
            # Preparar datos para actualización (solo campos no nulos)
            update_data = {k: v for k, v in paciente_data.model_dump().items() 
                          if v is not None}
            
            if not update_data:
                return BaseResponse(
                    success=False,
                    message="No se proporcionaron datos para actualizar",
                    data=None
                )
            
            result = self.supabase.table('pacientes').update(update_data).eq('id', str(paciente_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Paciente no encontrado o no se pudo actualizar",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Paciente actualizado exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def eliminar_paciente(self, paciente_id: UUID) -> BaseResponse:
        """Eliminar un paciente (soft delete)"""
        try:
            # Cambiar estado a 'Inactivo' en lugar de eliminar físicamente
            result = self.supabase.table('pacientes').update({
                'estado': 'Inactivo'
            }).eq('id', str(paciente_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Paciente no encontrado",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Paciente marcado como inactivo",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_estadisticas(self) -> EstadisticasPacientes:
        """Obtener estadísticas de pacientes"""
        try:
            result = self.supabase.rpc('v_estadisticas_pacientes').execute()
            
            if result.data:
                stats = result.data[0]
                return EstadisticasPacientes(
                    total_pacientes=stats.get('total_pacientes', 0),
                    pacientes_activos=stats.get('pacientes_activos', 0),
                    pacientes_inactivos=stats.get('pacientes_inactivos', 0),
                    pacientes_seguimiento=stats.get('pacientes_seguimiento', 0),
                    nuevos_este_mes=stats.get('nuevos_este_mes', 0),
                    edad_promedio=float(stats.get('edad_promedio', 0))
                )
            
            return EstadisticasPacientes(
                total_pacientes=0,
                pacientes_activos=0,
                pacientes_inactivos=0,
                pacientes_seguimiento=0,
                nuevos_este_mes=0,
                edad_promedio=0.0
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas de pacientes: {e}")
            return EstadisticasPacientes(
                total_pacientes=0,
                pacientes_activos=0,
                pacientes_inactivos=0,
                pacientes_seguimiento=0,
                nuevos_este_mes=0,
                edad_promedio=0.0
            )

# ===================================
# SERVICIO DE ESTUDIOS
# ===================================

class EstudioService(DatabaseService):
    """Servicio para gestión completa de estudios médicos"""
    
    async def crear_estudio(self, estudio_data: EstudioCreate) -> BaseResponse:
        """Crear un nuevo estudio médico"""
        try:
            # Generar número de estudio automático
            numero_result = self.supabase.rpc('generate_study_number').execute()
            numero_estudio = numero_result.data
            
            # Preparar datos para inserción
            estudio_dict = estudio_data.model_dump()
            estudio_dict['numero_estudio'] = numero_estudio
            estudio_dict['paciente_id'] = str(estudio_dict['paciente_id'])
            
            # Convertir metadatos DICOM a JSONB si existe
            if estudio_dict.get('metadatos_dicom'):
                estudio_dict['metadatos_dicom'] = estudio_dict['metadatos_dicom']
            
            result = self.supabase.table('estudios').insert(estudio_dict).execute()
            
            return BaseResponse(
                success=True,
                message="Estudio creado exitosamente",
                data=result.data[0] if result.data else None
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_estudios(self, page: int = 1, limit: int = 10,
                              paciente_id: Optional[UUID] = None,
                              estado: Optional[str] = None,
                              tipo: Optional[str] = None) -> PaginatedResponse:
        """Obtener lista paginada de estudios con filtros"""
        try:
            offset = (page - 1) * limit
            
            # Construir query con joins para obtener datos del paciente
            query = self.supabase.table('estudios').select(
                '*,pacientes(nombre,apellido,numero_paciente)', 
                count='exact'
            )
            
            # Aplicar filtros
            if paciente_id:
                query = query.eq('paciente_id', str(paciente_id))
            if estado:
                query = query.eq('estado', estado)
            if tipo:
                query = query.eq('tipo_estudio', tipo)
            
            # Aplicar paginación y ordenamiento
            query = query.range(offset, offset + limit - 1).order('fecha_estudio', desc=True)
            
            result = query.execute()
            
            total = result.count if result.count else 0
            pages = ceil(total / limit) if total > 0 else 1
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            )
            
        except Exception as e:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=1
            )
    
    async def obtener_estudio(self, estudio_id: UUID) -> BaseResponse:
        """Obtener un estudio específico con datos del paciente"""
        try:
            result = self.supabase.table('estudios').select(
                '*,pacientes(nombre,apellido,numero_paciente,fecha_nacimiento)'
            ).eq('id', str(estudio_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Estudio no encontrado",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Estudio encontrado",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def actualizar_estudio(self, estudio_id: UUID, 
                                estudio_data: EstudioUpdate) -> BaseResponse:
        """Actualizar datos de un estudio"""
        try:
            update_data = {k: v for k, v in estudio_data.model_dump().items() 
                          if v is not None}
            
            if not update_data:
                return BaseResponse(
                    success=False,
                    message="No se proporcionaron datos para actualizar",
                    data=None
                )
            
            result = self.supabase.table('estudios').update(update_data).eq('id', str(estudio_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Estudio no encontrado o no se pudo actualizar",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Estudio actualizado exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def subir_archivo_dicom(self, estudio_id: UUID, 
                                 archivo: ArchivoSubida) -> BaseResponse:
        """Subir archivo DICOM a un estudio"""
        try:
            # Obtener estudio actual
            estudio_result = await self.obtener_estudio(estudio_id)
            if not estudio_result.success:
                return estudio_result
            
            estudio = estudio_result.data
            archivos_actuales = estudio.get('archivos_dicom', [])
            archivos_actuales.append(archivo.url)
            
            # Actualizar estudio con el nuevo archivo
            result = self.supabase.table('estudios').update({
                'archivos_dicom': archivos_actuales,
                'estado': 'En Proceso'  # Cambiar estado cuando se sube archivo
            }).eq('id', str(estudio_id)).execute()
            
            return BaseResponse(
                success=True,
                message="Archivo DICOM subido exitosamente",
                data={"archivo": archivo.model_dump(), "estudio": result.data[0] if result.data else None}
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_estadisticas(self) -> EstadisticasEstudios:
        """Obtener estadísticas de estudios"""
        try:
            # Obtener estadísticas básicas
            result = self.supabase.from_('v_estadisticas_estudios').select('*').execute()
            
            # Obtener distribución por modalidad
            modalidad_result = self.supabase.table('estudios').select(
                'tipo_estudio'
            ).execute()
            
            # Contar por modalidad
            modalidades = {}
            if modalidad_result.data:
                for item in modalidad_result.data:
                    tipo = item['tipo_estudio']
                    modalidades[tipo] = modalidades.get(tipo, 0) + 1
            
            if result.data:
                stats = result.data[0]
                return EstadisticasEstudios(
                    total_estudios=stats.get('total_estudios', 0),
                    pendientes=stats.get('pendientes', 0),
                    en_proceso=stats.get('en_proceso', 0),
                    completados=stats.get('completados', 0),
                    cancelados=stats.get('cancelados', 0),
                    criticos=stats.get('criticos', 0),
                    urgentes=stats.get('urgentes', 0),
                    esta_semana=stats.get('esta_semana', 0),
                    por_modalidad=modalidades
                )
            
            return EstadisticasEstudios(
                total_estudios=0,
                pendientes=0,
                en_proceso=0,
                completados=0,
                cancelados=0,
                criticos=0,
                urgentes=0,
                esta_semana=0,
                por_modalidad=modalidades
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas de estudios: {e}")
            return EstadisticasEstudios(
                total_estudios=0,
                pendientes=0,
                en_proceso=0,
                completados=0,
                cancelados=0,
                criticos=0,
                urgentes=0,
                esta_semana=0,
                por_modalidad={}
            )

# ===================================
# SERVICIO DE IA Y RAG
# ===================================

class IAService:
    """Servicio para funcionalidades de IA, incluyendo generación de reportes y RAG"""
    
    def __init__(self, supabase: Client, embedding_service: EmbeddingService, 
                 tgi_url: str):
        self.supabase = supabase
        self.embedding_service = embedding_service
        self.tgi_url = tgi_url  # URL del endpoint TGI de Hugging Face
        # Mantener compatibilidad temporal
        self.lm_studio_url = tgi_url
    
    async def buscar_rag(self, request: RAGSearchRequest) -> List[RAGSearchResult]:
        """Realizar búsqueda semántica usando RAG"""
        try:
            # Generar embedding de la consulta
            query_embedding = await self.embedding_service.encode(request.query)
            
            # Parámetros para la función RPC
            rpc_params = {
                'query_embedding': query_embedding,
                'match_threshold': request.umbral_similitud,
                'match_count': request.limite_resultados
            }
            
            # Filtrar por paciente si se especifica
            if request.paciente_id:
                rpc_params['paciente_filter'] = str(request.paciente_id)
            
            # Ejecutar búsqueda (usar función temporal para 1024 dimensiones)
            result = self.supabase.rpc('match_report_embeddings_1024', rpc_params).execute()
            
            # Convertir resultados
            resultados = []
            if result.data:
                for item in result.data:
                    resultados.append(RAGSearchResult(
                        id=item['id'],
                        reporte_id=item['reporte_id'],
                        paciente_id=item['paciente_id'],
                        contenido=item['contenido'],
                        similitud=item['similarity']
                    ))
            
            return resultados
            
        except Exception as e:
            print(f"Error en búsqueda RAG: {e}")
            return []
    
    async def analizar_imagen_dicom(self, request: DicomAnalysisRequest) -> BaseResponse:
        """Analizar imagen DICOM usando modelo multimodal con TGI"""
        start_time = time.time()
        
        try:
            # Construir prompt para análisis de imagen médica
            prompt = f"""Eres un radiólogo experto. Analiza la siguiente imagen médica DICOM y proporciona un análisis detallado en español.

CONTEXTO CLÍNICO: {request.contexto_clinico or 'No especificado'}
TIPO DE ESTUDIO: {request.tipo_estudio or 'No especificado'}
PREGUNTA ESPECÍFICA: {request.pregunta_especifica or 'Análisis general'}

Proporciona:
1. DESCRIPCIÓN TÉCNICA: Calidad de la imagen, proyección, contraste
2. HALLAZGOS RADIOLÓGICOS: Descripción detallada de hallazgos
3. IMPRESIÓN DIAGNÓSTICA: Conclusiones principales
4. RECOMENDACIONES: Estudios adicionales si es necesario

Mantén un lenguaje médico profesional y preciso."""

            # Preparar mensaje multimodal para TGI
            multimodal_message = {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{request.imagen_base64}"
                        }
                    }
                ]
            }
            
            # Preparar solicitud TGI para imagen
            tgi_request = TGIImageRequest(
                messages=[multimodal_message],
                temperature=0.3,
                max_tokens=1500,
                stream=False
            )
            
            # Realizar solicitud a TGI
            async with httpx.AsyncClient(timeout=300.0) as client:  # Más tiempo para análisis de imagen
                response = await client.post(
                    f"{self.tgi_url}/v1/chat/completions",
                    json=tgi_request.model_dump(),
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
            
            ai_response = response.json()
            analisis_resultado = ai_response['choices'][0]['message']['content']
            
            # Calcular tiempo de análisis
            tiempo_analisis = int(time.time() - start_time)
            
            return BaseResponse(
                success=True,
                message="Análisis de imagen DICOM completado exitosamente",
                data={
                    "analisis": analisis_resultado,
                    "tiempo_procesamiento": tiempo_analisis,
                    "modelo_usado": "TGI Multimodal",
                    "contexto_clinico": request.contexto_clinico,
                    "tipo_estudio": request.tipo_estudio
                }
            )
            
        except httpx.HTTPStatusError as e:
            error_detail = f"Error HTTP {e.response.status_code}: {e.response.text}"
            return BaseResponse(
                success=False,
                message=f"Error en análisis de imagen: {error_detail}",
                data=None
            )
        except Exception as e:
            return BaseResponse(
                success=False,
                message=f"Error inesperado en análisis de imagen: {str(e)}",
                data=None
            )
    
    async def generar_reporte_con_ia(self, request: ReportGenerationRequest) -> BaseResponse:
        """Generar reporte médico usando IA con contexto RAG opcional"""
        start_time = time.time()
        
        try:
            # Obtener contexto RAG si se solicita
            contexto_rag = ""
            if request.incluir_contexto_rag:
                rag_request = RAGSearchRequest(
                    query=f"{request.tipo_estudio} {request.contexto_clinico}",
                    paciente_id=request.paciente_id,
                    limite_resultados=3,
                    umbral_similitud=0.6
                )
                rag_results = await self.buscar_rag(rag_request)
                
                if rag_results:
                    contexto_rag = "\\n\\nCONTEXTO DE CASOS SIMILARES:\\n"
                    for i, result in enumerate(rag_results, 1):
                        contexto_rag += f"Caso {i}: {result.contenido[:200]}...\\n"
            
            # Construir prompt especializado
            prompt = f"""
            Eres un radiólogo experto especializado en {request.tipo_estudio}. 
            Genera un reporte radiológico completo, estructurado y profesional en español.
            
            INFORMACIÓN DEL CASO:
            - Tipo de Estudio: {request.tipo_estudio}
            - Contexto Clínico: {request.contexto_clinico}
            - Radiólogo: {request.radiologo}
            
            {contexto_rag}
            
            INSTRUCCIONES:
            1. Genera un reporte con las siguientes secciones obligatorias:
               - TÉCNICA: Descripción de la técnica radiológica utilizada
               - HALLAZGOS: Descripción detallada de los hallazgos observados
               - IMPRESIÓN DIAGNÓSTICA: Conclusiones diagnósticas principales
               - RECOMENDACIONES: Recomendaciones clínicas si corresponde
            
            2. Utiliza terminología médica precisa y profesional
            3. Sé específico pero conciso
            4. Mantén un tono profesional y objetivo
            5. Si hay hallazgos normales, indícalo claramente
            
            Genera el reporte ahora:
            """
            
            # Preparar solicitud a TGI
            messages = [ChatMessage(role=RolChatEnum.USER, content=prompt)]
            tgi_request = TGIRequest(
                messages=messages,
                temperature=request.temperatura,
                max_tokens=2048,
                stream=False
            )
            
            # Realizar solicitud a TGI
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(
                    f"{self.tgi_url}/v1/chat/completions", 
                    json=tgi_request.model_dump(),
                    headers={"Content-Type": "application/json"}
                )
                response.raise_for_status()
            
            ai_response = response.json()
            reporte_generado = ai_response['choices'][0]['message']['content']
            
            # Calcular tiempo de generación
            tiempo_generacion = int(time.time() - start_time)
            
            # Estimar confianza basada en longitud y palabras clave
            confianza = self._calcular_confianza_reporte(reporte_generado)
            
            # Generar número de reporte
            numero_result = self.supabase.rpc('generate_report_number').execute()
            numero_reporte = numero_result.data if numero_result.data else f"REP{int(time.time())}"
            
            # Guardar reporte en base de datos
            reporte_data = {
                'numero_reporte': numero_reporte,
                'paciente_id': str(request.paciente_id),
                'estudio_id': str(request.estudio_id) if request.estudio_id else None,
                'tipo_estudio': request.tipo_estudio,
                'radiologo': request.radiologo,
                'reporte_generado': reporte_generado,
                'confianza_ia': confianza,
                'tiempo_generacion': tiempo_generacion,
                'modelo_ia_usado': tgi_request.model,
                'estado': EstadoReporteEnum.BORRADOR,
                # Extraer secciones del reporte
                'hallazgos': self._extraer_seccion(reporte_generado, 'HALLAZGOS'),
                'impresion_diagnostica': self._extraer_seccion(reporte_generado, 'IMPRESIÓN DIAGNÓSTICA'),
                'tecnica': self._extraer_seccion(reporte_generado, 'TÉCNICA'),
                'recomendaciones': self._extraer_seccion(reporte_generado, 'RECOMENDACIONES')
            }
            
            insert_result = self.supabase.table('reportes').insert(reporte_data).execute()
            
            if insert_result.data:
                reporte_id = insert_result.data[0]['id']
                
                # Generar y guardar embedding para RAG
                await self._generar_embedding_reporte(
                    reporte_id, request.paciente_id, reporte_generado
                )
                
                return BaseResponse(
                    success=True,
                    message="Reporte generado exitosamente por IA",
                    data={
                        "reporte": insert_result.data[0],
                        "tiempo_generacion": tiempo_generacion,
                        "confianza_ia": confianza
                    }
                )
            
            return BaseResponse(
                success=False,
                message="Reporte generado pero no se pudo guardar en base de datos",
                data=None
            )
            
        except httpx.RequestError as e:
            return BaseResponse(
                success=False,
                message=f"Error de conexión con el servicio de IA: {str(e)}",
                data=None
            )
        except Exception as e:
            return BaseResponse(
                success=False,
                message=f"Error generando reporte: {str(e)}",
                data=None
            )
    
    def _calcular_confianza_reporte(self, reporte: str) -> float:
        """Calcular confianza del reporte basada en heurísticas"""
        try:
            # Factores que indican calidad
            factores_positivos = 0
            
            # Verificar presencia de secciones clave
            secciones = ['TÉCNICA', 'HALLAZGOS', 'IMPRESIÓN', 'RECOMENDACIONES']
            for seccion in secciones:
                if seccion in reporte.upper():
                    factores_positivos += 0.2
            
            # Verificar longitud adecuada
            if 200 <= len(reporte) <= 2000:
                factores_positivos += 0.1
            
            # Verificar terminología médica
            terminos_medicos = ['normal', 'anormal', 'hallazgo', 'diagnóstico', 'recomiendo']
            for termino in terminos_medicos:
                if termino.lower() in reporte.lower():
                    factores_positivos += 0.02
            
            return min(1.0, max(0.3, factores_positivos))
            
        except:
            return 0.7  # Confianza por defecto
    
    def _extraer_seccion(self, reporte: str, seccion: str) -> str:
        """Extraer una sección específica del reporte"""
        try:
            lines = reporte.split('\n')
            capturando = False
            contenido = []
            
            for line in lines:
                if seccion.upper() in line.upper():
                    capturando = True
                    continue
                elif capturando and any(s in line.upper() for s in ['TÉCNICA', 'HALLAZGOS', 'IMPRESIÓN', 'RECOMENDACIONES']):
                    break
                elif capturando:
                    contenido.append(line.strip())
            
            return '\n'.join(contenido).strip()
            
        except:
            return ""
    
    async def _generar_embedding_reporte(self, reporte_id: str, paciente_id: UUID, 
                                       contenido: str):
        """Generar y guardar embedding para búsqueda RAG"""
        try:
            embedding = await self.embedding_service.encode(contenido)
            
            self.supabase.table('reporte_embeddings_new').insert({
                'reporte_id': reporte_id,
                'paciente_id': str(paciente_id),
                'contenido': contenido,
                'embedding': embedding
            }).execute()
            
        except Exception as e:
            print(f"Error generando embedding: {e}")
    
    async def generar_reporte_con_ia_streaming(self, request: ReportGenerationRequest):
        """Generar reporte médico usando IA con streaming"""
        from fastapi.responses import StreamingResponse
        import json
        
        async def generate():
            start_time = time.time()
            
            try:
                # Obtener contexto RAG si se solicita (simplificado para evitar errores)
                contexto_rag = ""
                if request.incluir_contexto_rag:
                    contexto_rag = "\n\nCONTEXTO: Generando reporte con historial médico relevante..."
                
                # Construir prompt especializado
                prompt = f"""
                Eres un radiólogo experto especializado en {request.tipo_estudio}. 
                Genera un reporte radiológico completo, estructurado y profesional en español.
                
                INFORMACIÓN DEL CASO:
                - Tipo de Estudio: {request.tipo_estudio}
                - Contexto Clínico: {request.contexto_clinico}
                - Radiólogo: {request.radiologo}
                
                {contexto_rag}
                
                INSTRUCCIONES:
                1. Genera un reporte con las siguientes secciones obligatorias:
                   - TÉCNICA: Descripción de la técnica radiológica utilizada
                   - HALLAZGOS: Descripción detallada de los hallazgos observados
                   - IMPRESIÓN DIAGNÓSTICA: Conclusiones diagnósticas principales
                   - RECOMENDACIONES: Recomendaciones clínicas si corresponde
                
                2. Utiliza terminología médica precisa y profesional
                3. Sé específico pero conciso
                4. Mantén un tono profesional y objetivo
                5. Si hay hallazgos normales, indícalo claramente
                
                Genera el reporte ahora:
                """
                
                # Preparar solicitud a TGI
                messages = [ChatMessage(role=RolChatEnum.USER, content=prompt)]
                tgi_request = {
                    "model": "tgi",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": request.temperatura,
                    "max_tokens": 2048,
                    "stream": True  # Habilitar streaming
                }
                
                # Realizar solicitud a TGI con streaming
                async with httpx.AsyncClient(timeout=180.0) as client:
                    async with client.stream(
                        "POST",
                        f"{self.tgi_url}/v1/chat/completions",
                        json=tgi_request,
                        headers={"Content-Type": "application/json"}
                    ) as response:
                        response.raise_for_status()
                        
                        reporte_completo = ""
                        
                        async for line in response.aiter_lines():
                            if line.strip():
                                if line.startswith("data: "):
                                    data_str = line[6:].strip()
                                    
                                    if data_str == "[DONE]":
                                        break
                                    
                                    try:
                                        data = json.loads(data_str)
                                        if "choices" in data and len(data["choices"]) > 0:
                                            choice = data["choices"][0]
                                            if "delta" in choice and "content" in choice["delta"]:
                                                content = choice["delta"]["content"]
                                                reporte_completo += content
                                                
                                                # Enviar chunk al frontend
                                                yield f"data: {json.dumps(data)}\n\n"
                                    
                                    except json.JSONDecodeError:
                                        continue
                
                # Al final, enviar mensaje de finalización
                yield f"data: [DONE]\n\n"
                
                # Guardar reporte en base de datos (en segundo plano)
                asyncio.create_task(self._guardar_reporte_async(request, reporte_completo, time.time() - start_time))
                
            except Exception as e:
                error_data = {
                    "error": True,
                    "message": f"Error generando reporte: {str(e)}"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
        
        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    
    async def _guardar_reporte_async(self, request: ReportGenerationRequest, reporte_generado: str, tiempo_generacion: float):
        """Guardar reporte en base de datos de forma asíncrona"""
        try:
            # Generar número de reporte
            numero_result = self.supabase.rpc('generate_report_number').execute()
            numero_reporte = numero_result.data if numero_result.data else f"REP{int(time.time())}"
            
            # Calcular confianza
            confianza = self._calcular_confianza_reporte(reporte_generado)
            
            # Guardar reporte en base de datos
            reporte_data = {
                'numero_reporte': numero_reporte,
                'paciente_id': str(request.paciente_id),
                'estudio_id': str(request.estudio_id) if request.estudio_id else None,
                'tipo_estudio': request.tipo_estudio,
                'radiologo': request.radiologo,
                'reporte_generado': reporte_generado,
                'confianza_ia': confianza,
                'tiempo_generacion': int(tiempo_generacion),
                'modelo_ia_usado': "medgemma-4b-it-mlx",
                'estado': EstadoReporteEnum.BORRADOR,
                'hallazgos': self._extraer_seccion(reporte_generado, 'HALLAZGOS'),
                'impresion_diagnostica': self._extraer_seccion(reporte_generado, 'IMPRESIÓN DIAGNÓSTICA'),
                'tecnica': self._extraer_seccion(reporte_generado, 'TÉCNICA'),
                'recomendaciones': self._extraer_seccion(reporte_generado, 'RECOMENDACIONES')
            }
            
            insert_result = self.supabase.table('reportes').insert(reporte_data).execute()
            
            if insert_result.data:
                reporte_id = insert_result.data[0]['id']
                # Generar embedding para RAG
                await self._generar_embedding_reporte(reporte_id, request.paciente_id, reporte_generado)
                
        except Exception as e:
            print(f"Error guardando reporte: {e}")

# ===================================
# SERVICIO DE REPORTES
# ===================================

class ReporteService(DatabaseService):
    """Servicio para gestión completa de reportes médicos"""
    
    def __init__(self, supabase: Client, ia_service: IAService):
        super().__init__(supabase)
        self.ia_service = ia_service
    
    async def crear_reporte(self, reporte_data: ReporteCreate) -> BaseResponse:
        """Crear un nuevo reporte médico manualmente"""
        try:
            # Generar número de reporte
            numero_result = self.supabase.rpc('generate_report_number').execute()
            numero_reporte = numero_result.data if numero_result.data else f"REP{int(time.time())}"
            
            reporte_dict = reporte_data.model_dump()
            reporte_dict['numero_reporte'] = numero_reporte
            reporte_dict['paciente_id'] = str(reporte_dict['paciente_id'])
            if reporte_dict.get('estudio_id'):
                reporte_dict['estudio_id'] = str(reporte_dict['estudio_id'])
            
            result = self.supabase.table('reportes').insert(reporte_dict).execute()
            
            return BaseResponse(
                success=True,
                message="Reporte creado exitosamente",
                data=result.data[0] if result.data else None
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def generar_reporte_ia(self, request: ReportGenerationRequest) -> BaseResponse:
        """Generar reporte usando IA"""
        return await self.ia_service.generar_reporte_con_ia(request)
    
    async def generar_reporte_ia_streaming(self, request: ReportGenerationRequest):
        """Generar reporte usando IA con streaming"""
        return await self.ia_service.generar_reporte_con_ia_streaming(request)
    
    async def obtener_reportes(self, page: int = 1, limit: int = 10,
                              paciente_id: Optional[UUID] = None,
                              estado: Optional[str] = None) -> PaginatedResponse:
        """Obtener lista paginada de reportes"""
        try:
            offset = (page - 1) * limit
            
            query = self.supabase.table('reportes').select(
                '*,pacientes(nombre,apellido,numero_paciente)',
                count='exact'
            )
            
            if paciente_id:
                query = query.eq('paciente_id', str(paciente_id))
            if estado:
                query = query.eq('estado', estado)
            
            query = query.range(offset, offset + limit - 1).order('fecha_reporte', desc=True)
            
            result = query.execute()
            
            total = result.count if result.count else 0
            pages = ceil(total / limit) if total > 0 else 1
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            )
            
        except Exception as e:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=1
            )
    
    async def obtener_reporte(self, reporte_id: UUID) -> BaseResponse:
        """Obtener un reporte específico"""
        try:
            result = self.supabase.table('reportes').select(
                '*,pacientes(nombre,apellido,numero_paciente),estudios(numero_estudio,tipo_estudio)'
            ).eq('id', str(reporte_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Reporte no encontrado",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Reporte encontrado",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def actualizar_reporte(self, reporte_id: UUID, 
                                reporte_data: ReporteUpdate) -> BaseResponse:
        """Actualizar un reporte"""
        try:
            update_data = {k: v for k, v in reporte_data.model_dump().items() 
                          if v is not None}
            
            if not update_data:
                return BaseResponse(
                    success=False,
                    message="No se proporcionaron datos para actualizar",
                    data=None
                )
            
            result = self.supabase.table('reportes').update(update_data).eq('id', str(reporte_id)).execute()
            
            if not result.data:
                return BaseResponse(
                    success=False,
                    message="Reporte no encontrado o no se pudo actualizar",
                    data=None
                )
            
            return BaseResponse(
                success=True,
                message="Reporte actualizado exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def firmar_reporte(self, reporte_id: UUID, firma_data: FirmaReporte) -> BaseResponse:
        """Firmar un reporte digitalmente"""
        try:
            # Verificar que el reporte existe
            reporte_result = await self.obtener_reporte(reporte_id)
            if not reporte_result.success:
                return reporte_result
            
            reporte = reporte_result.data
            
            # Verificar que el reporte está en estado válido para firma
            if reporte['estado'] == EstadoReporteEnum.FIRMADO:
                return BaseResponse(
                    success=False,
                    message="El reporte ya está firmado",
                    data=None
                )
            
            # Generar hash de firma (simplificado para este ejemplo)
            contenido_firma = f"{reporte['id']}{firma_data.firmado_por}{datetime.now().isoformat()}"
            hash_firma = hashlib.sha256(contenido_firma.encode()).hexdigest()
            
            # Actualizar reporte con firma
            update_data = {
                'estado': EstadoReporteEnum.FIRMADO,
                'firmado_por': firma_data.firmado_por,
                'fecha_firma': datetime.now().isoformat(),
                'hash_firma': hash_firma
            }
            
            result = self.supabase.table('reportes').update(update_data).eq('id', str(reporte_id)).execute()
            
            return BaseResponse(
                success=True,
                message="Reporte firmado exitosamente",
                data=result.data[0] if result.data else None
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_estadisticas(self) -> EstadisticasReportes:
        """Obtener estadísticas de reportes"""
        try:
            result = self.supabase.from_('v_estadisticas_reportes').select('*').execute()
            
            if result.data:
                stats = result.data[0]
                return EstadisticasReportes(
                    total_reportes=stats.get('total_reportes', 0),
                    borradores=stats.get('borradores', 0),
                    pendientes_revision=stats.get('pendientes_revision', 0),
                    firmados=stats.get('firmados', 0),
                    confianza_promedio=float(stats.get('confianza_promedio', 0)),
                    tiempo_promedio_generacion=float(stats.get('tiempo_promedio_generacion', 0))
                )
            
            return EstadisticasReportes(
                total_reportes=0,
                borradores=0,
                pendientes_revision=0,
                firmados=0,
                confianza_promedio=0.0,
                tiempo_promedio_generacion=0.0
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas de reportes: {e}")
            return EstadisticasReportes(
                total_reportes=0,
                borradores=0,
                pendientes_revision=0,
                firmados=0,
                confianza_promedio=0.0,
                tiempo_promedio_generacion=0.0
            )

# ===================================
# SERVICIO DE CHAT IA
# ===================================

class ChatService(DatabaseService):
    """Servicio para chat IA médico con especialidades y gestión de contexto avanzada"""
    
    def __init__(self, supabase: Client, ia_service: IAService):
        super().__init__(supabase)
        self.ia_service = ia_service
        self.context_manager = get_context_manager(supabase)
    
    async def procesar_mensaje_chat(self, request: ChatRequest, user_id: str = "default_user") -> ChatResponse:
        """Procesar mensaje del chat y generar respuesta con IA usando gestión avanzada de contexto"""
        start_time = time.time()
        conversacion_id = None
        
        try:
            print(f"🔍 Procesando mensaje de chat para usuario: {user_id}")
            print(f"📝 Mensaje: {request.mensaje}")
            print(f"🏥 Especialidad: {request.especialidad}")
            
            # Obtener o crear conversación
            conversacion_id = request.conversacion_id
            if not conversacion_id:
                print(f"🆕 Creando nueva conversación...")
                # Crear nueva conversación
                conversacion_data = ConversacionChatCreate(
                    titulo=f"Consulta {request.especialidad.value}",
                    especialidad=request.especialidad,
                    usuario=user_id
                )
                
                conv_result = await self.crear_conversacion(conversacion_data)
                if not conv_result.success:
                    print(f"❌ Error creando conversación: {conv_result.message}")
                    raise Exception(f"No se pudo crear la conversación: {conv_result.message}")
                
                conversacion_id = UUID(conv_result.data['id'])
                print(f"✅ Conversación creada con ID: {conversacion_id}")
            else:
                print(f"📋 Usando conversación existente: {conversacion_id}")
            
            # Crear mensaje del usuario usando context manager
            mensaje_usuario = ChatMessage(
                role=RolChatEnum.USER,
                content=request.mensaje
            )
            
            print(f"💬 Agregando mensaje al contexto...")
            # Agregar mensaje al contexto usando el context manager
            context = await self.context_manager.add_message_to_context(
                conversacion_id, 
                mensaje_usuario, 
                user_id
            )
            
            # Determinar si incluir contexto RAG
            include_rag = any(keyword in request.mensaje.lower() 
                            for keyword in ['similar', 'caso', 'antecedente', 'historial', 'previo'])
            
            print(f"🧠 Obteniendo contexto para IA (RAG: {include_rag})...")
            # Obtener contexto optimizado para IA
            messages = await self.context_manager.get_context_for_ai(
                conversacion_id,
                include_rag=include_rag,
                rag_query=request.mensaje if include_rag else None
            )
            
            print(f"🤖 Generando respuesta con IA...")
            # Generar respuesta con IA usando TGI
            # Convertir mensajes al formato que espera la API
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg.role.value,
                    "content": msg.content
                })
            
            # Agregar instrucción específica para español si no hay system prompt
            if not formatted_messages or formatted_messages[0]["role"] != "system":
                # Determinar el idioma del usuario
                idioma_usuario = getattr(request, 'idioma_usuario', 'es') or 'es'
                
                # Crear prompt de sistema con instrucciones de idioma
                idioma_instrucciones = {
                    'es': "Eres un asistente médico IA. Responde SIEMPRE en español. Sé profesional y empático.",
                    'en': "You are a medical AI assistant. Always respond in English. Be professional and empathetic.",
                    'fr': "Vous êtes un assistant médical IA. Répondez TOUJOURS en français. Soyez professionnel et empathique.",
                    'de': "Sie sind ein medizinischer KI-Assistent. Antworten Sie IMMER auf Deutsch. Seien Sie professionell und einfühlsam.",
                    'pt': "Você é um assistente médico de IA. Sempre responda em português. Seja profissional e empático.",
                    'it': "Sei un assistente medico IA. Rispondi SEMPRE in italiano. Sii professionale ed empatico."
                }
                
                system_prompt = idioma_instrucciones.get(idioma_usuario, idioma_instrucciones['es'])
                
                formatted_messages.insert(0, {
                    "role": "system",
                    "content": system_prompt
                })
            
            print(f"📝 Mensajes formateados para API: {len(formatted_messages)} mensajes")
            
            tgi_request = {
                "model": "tgi",
                "messages": formatted_messages,
                "temperature": 0.7,
                "max_tokens": 1024,
                "stream": False
            }
            
            print(f"📤 Enviando request a TGI: {self.ia_service.tgi_url}")
            
            # API key para Hugging Face (en producción, usar variable de entorno)
            api_key = os.environ.get("HF_API_KEY", "hf_XXXXX")
            
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{self.ia_service.tgi_url}/v1/chat/completions",
                    json=tgi_request,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {api_key}"
                    }
                )
                response.raise_for_status()
            
            ai_response = response.json()
            respuesta_ia = ai_response['choices'][0]['message']['content']
            
            # Calcular tiempo de respuesta
            tiempo_respuesta = time.time() - start_time
            
            print(f"💬 Agregando respuesta de IA al contexto...")
            # Agregar respuesta de IA al contexto
            mensaje_ia = ChatMessage(
                role=RolChatEnum.ASSISTANT,
                content=respuesta_ia
            )
            
            await self.context_manager.add_message_to_context(
                conversacion_id, 
                mensaje_ia, 
                user_id
            )
            
            print(f"✅ Respuesta generada exitosamente en {tiempo_respuesta:.2f}s")
            
            return ChatResponse(
                respuesta=respuesta_ia,
                conversacion_id=conversacion_id,
                confianza=0.8,  # Calcular confianza real en producción
                tiempo_respuesta=tiempo_respuesta,
                modelo_usado="tgi"
            )
            
        except Exception as e:
            tiempo_respuesta = time.time() - start_time
            print(f"❌ Error en chat IA: {e}")
            print(f"📋 Tipo de error: {type(e).__name__}")
            print(f"🔍 Detalles del error: {str(e)}")
            
            # Proporcionar mensaje de error más informativo
            error_message = "Lo siento, ha ocurrido un error. Por favor, intenta de nuevo."
            if "permission denied" in str(e).lower():
                error_message = "Error de permisos en la base de datos. Contacta al administrador."
            elif "no se pudo crear la conversación" in str(e).lower():
                error_message = "Error al crear la conversación. Verifica la configuración de la base de datos."
            elif "timeout" in str(e).lower():
                error_message = "La respuesta tardó demasiado. Por favor, intenta de nuevo."
            elif "422" in str(e) or "unprocessable entity" in str(e).lower():
                error_message = "Error en el formato de la solicitud a la IA. Verificando configuración..."
                print(f"🔧 Error 422: Verificar formato de mensajes enviados a TGI")
            elif "401" in str(e) or "unauthorized" in str(e).lower():
                error_message = "Error de autenticación con el servicio de IA. Verificando credenciales..."
                print(f"🔧 Error 401: Verificar HF_API_KEY en variables de entorno")
            elif "404" in str(e) or "not found" in str(e).lower():
                error_message = "Servicio de IA no disponible. Verificando endpoint..."
                print(f"🔧 Error 404: Verificar TGI_URL en variables de entorno")
            
            return ChatResponse(
                respuesta=error_message,
                conversacion_id=conversacion_id or uuid4(),
                confianza=0.0,
                tiempo_respuesta=tiempo_respuesta,
                modelo_usado=None
            )
    
    def _generar_prompt_especialidad(self, especialidad: EspecialidadEnum) -> str:
        """Generar prompt especializado según la especialidad médica"""
        prompts = {
            EspecialidadEnum.GENERAL: """
            Eres un médico general experimentado. Proporciona consultas médicas generales,
            orientación sobre síntomas comunes y recomendaciones de salud preventiva.
            Siempre recuerda que no reemplazas una consulta médica presencial.
            """,
            
            EspecialidadEnum.RADIOLOGIA: """
            Eres un radiólogo experto con amplia experiencia en interpretación de imágenes médicas.
            Ayuda con consultas sobre técnicas radiológicas, interpretación de estudios,
            y recomendaciones para estudios complementarios. Mantén la precisión técnica.
            """,
            
            EspecialidadEnum.CARDIOLOGIA: """
            Eres un cardiólogo especialista. Proporciona orientación sobre enfermedades
            cardiovasculares, interpretación de electrocardiogramas, factores de riesgo
            cardiovascular y recomendaciones preventivas.
            """,
            
            EspecialidadEnum.NEUROLOGIA: """
            Eres un neurólogo especialista. Ayuda con consultas sobre enfermedades
            neurológicas, interpretación de estudios neurofisiológicos y de neuroimagen,
            y manejo de patologías del sistema nervioso.
            """,
            
            EspecialidadEnum.DERMATOLOGIA: """
            Eres un dermatólogo especialista. Proporciona orientación sobre enfermedades
            de la piel, interpretación de lesiones cutáneas y recomendaciones de cuidado
            dermatológico.
            """,
            
            EspecialidadEnum.GINECOLOGIA: """
            Eres un ginecólogo especialista. Ayuda con consultas sobre salud femenina,
            patologías ginecológicas, salud reproductiva y medicina preventiva en mujeres.
            """
        }
        
        base_prompt = """
        Responde siempre en español. Sé profesional, preciso y empático.
        Si la consulta está fuera de tu especialidad, refiérelo apropiadamente.
        Siempre incluye la recomendación de consultar con un médico para evaluación presencial.
        """
        
        return prompts.get(especialidad, prompts[EspecialidadEnum.GENERAL]) + base_prompt
    
    async def crear_conversacion(self, conversacion_data: ConversacionChatCreate) -> BaseResponse:
        """Crear nueva conversación de chat"""
        try:
            print(f"🔍 Intentando crear conversación: {conversacion_data.model_dump()}")
            
            # Verificar que la tabla existe y es accesible
            try:
                test_query = self.supabase.table('conversaciones_chat').select('count').limit(1).execute()
                print(f"✅ Tabla conversaciones_chat accesible")
            except Exception as table_error:
                print(f"❌ Error accediendo a tabla conversaciones_chat: {table_error}")
                return BaseResponse(
                    success=False,
                    message=f"Error de base de datos: No se puede acceder a la tabla conversaciones_chat - {str(table_error)}",
                    data=None
                )
            
            # Preparar datos para inserción
            conversacion_dict = conversacion_data.model_dump()
            print(f"📝 Datos preparados: {conversacion_dict}")
            
            # Insertar en base de datos
            result = self.supabase.table('conversaciones_chat').insert(conversacion_dict).execute()
            
            if not result.data:
                print(f"❌ No se recibieron datos de la inserción")
                return BaseResponse(
                    success=False,
                    message="Error: No se pudo crear la conversación - respuesta vacía de la base de datos",
                    data=None
                )
            
            print(f"✅ Conversación creada exitosamente: {result.data[0]}")
            
            return BaseResponse(
                success=True,
                message="Conversación creada exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            print(f"❌ Error creando conversación: {e}")
            print(f"📋 Tipo de error: {type(e).__name__}")
            print(f"🔍 Detalles del error: {str(e)}")
            
            # Proporcionar información más específica del error
            error_message = f"Error de base de datos: {str(e)}"
            if "permission denied" in str(e).lower():
                error_message = "Error de permisos: Verificar configuración de Supabase y políticas RLS"
            elif "relation" in str(e).lower() and "does not exist" in str(e).lower():
                error_message = "Error: La tabla conversaciones_chat no existe. Ejecutar database_setup.sql"
            elif "duplicate key" in str(e).lower():
                error_message = "Error: Ya existe una conversación con esos datos"
            
            return BaseResponse(
                success=False,
                message=error_message,
                data=None
            )
    
    async def guardar_mensaje(self, conversacion_id: UUID, 
                             mensaje_data: MensajeChatCreate) -> BaseResponse:
        """Guardar mensaje en una conversación"""
        try:
            mensaje_dict = mensaje_data.model_dump()
            mensaje_dict['conversacion_id'] = str(conversacion_id)
            
            result = self.supabase.table('mensajes_chat').insert(mensaje_dict).execute()
            
            return BaseResponse(
                success=True,
                message="Mensaje guardado exitosamente",
                data=result.data[0] if result.data else None
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_conversaciones(self, usuario: str, page: int = 1, 
                                   limit: int = 20) -> PaginatedResponse:
        """Obtener conversaciones de un usuario"""
        try:
            offset = (page - 1) * limit
            
            query = self.supabase.table('conversaciones_chat').select(
                '*', count='exact'
            ).eq('usuario', usuario).eq('activa', True)
            
            query = query.range(offset, offset + limit - 1).order('updated_at', desc=True)
            
            result = query.execute()
            
            total = result.count if result.count else 0
            pages = ceil(total / limit) if total > 0 else 1
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            )
            
        except Exception as e:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=1
            )
    
    async def obtener_historial_conversacion(self, conversacion_id: UUID) -> List[Dict]:
        """Obtener historial de mensajes de una conversación"""
        try:
            result = self.supabase.table('mensajes_chat').select('*').eq(
                'conversacion_id', str(conversacion_id)
            ).order('timestamp_mensaje', desc=False).execute()
            
            return result.data or []
            
        except Exception as e:
            print(f"Error obteniendo historial: {e}")
            return []
    
    async def obtener_sesiones_activas_usuario(self, user_id: str) -> Dict[str, Any]:
        """Obtener todas las sesiones activas de un usuario"""
        try:
            sesiones = await self.context_manager.get_user_active_sessions(user_id)
            return {
                "success": True,
                "data": {
                    "user_id": user_id,
                    "active_sessions": sesiones,
                    "total_sessions": len(sesiones)
                }
            }
        except Exception as e:
            print(f"Error obteniendo sesiones activas: {e}")
            return {
                "success": False,
                "message": f"Error obteniendo sesiones activas: {str(e)}",
                "data": {"active_sessions": [], "total_sessions": 0}
            }
    
    async def obtener_estadisticas_contexto(self) -> Dict[str, Any]:
        """Obtener estadísticas del sistema de contexto"""
        try:
            cache_stats = {
                "conversations_in_cache": len(self.context_manager.cache.cache),
                "max_cache_size": self.context_manager.cache.max_size,
                "cache_utilization": len(self.context_manager.cache.cache) / self.context_manager.cache.max_size,
                "active_users": len(self.context_manager.cache.user_conversations)
            }
            
            return {
                "success": True,
                "data": cache_stats
            }
        except Exception as e:
            print(f"Error obteniendo estadísticas de contexto: {e}")
            return {
                "success": False,
                "message": f"Error obteniendo estadísticas: {str(e)}",
                "data": {}
            }

# ===================================
# SERVICIO DE ÓRDENES DE COMPRA
# ===================================

class OrdenCompraService:
    """Servicio para gestión de órdenes de compra"""
    
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def handle_db_error(self, error) -> Dict[str, Any]:
        """Manejo estándar de errores de base de datos"""
        error_msg = str(error).lower()
        
        if "duplicate key" in error_msg:
            return {"success": False, "message": "Ya existe un registro con esos datos"}
        elif "foreign key" in error_msg:
            return {"success": False, "message": "Referencia inválida a otro registro"}
        elif "not found" in error_msg:
            return {"success": False, "message": "Registro no encontrado"}
        else:
            return {"success": False, "message": f"Error de base de datos: {str(error)}"}
    
    def generar_numero_orden(self) -> str:
        """Generar número de orden secuencial"""
        try:
            result = self.supabase.table('ordenes_compra').select('numero_orden').order(
                'numero_orden', desc=True
            ).limit(1).execute()
            
            if result.data:
                ultimo_numero = result.data[0]['numero_orden']
                # Extraer número del formato OC-XXX
                numero = int(ultimo_numero.split('-')[1]) + 1
            else:
                numero = 1
            
            return f"OC-{numero:03d}"
        except:
            return f"OC-{int(datetime.now().timestamp()) % 1000:03d}"
    
    async def crear_orden(self, orden_data: OrdenCompraCreate) -> BaseResponse:
        """Crear nueva orden de compra"""
        try:
            # Calcular totales
            total_orden = sum(detalle.cantidad * detalle.precio_unitario for detalle in orden_data.detalles)
            iva = total_orden * 0.16  # IVA del 16%
            total_con_iva = total_orden + iva
            
            # Preparar datos de la orden
            orden_dict = orden_data.model_dump(exclude={'detalles'})
            orden_dict.update({
                'numero_orden': self.generar_numero_orden(),
                'total_orden': total_orden,
                'iva': iva,
                'total_con_iva': total_con_iva
            })
            
            # Insertar orden
            result = self.supabase.table('ordenes_compra').insert(orden_dict).execute()
            
            if not result.data:
                raise Exception("Error al crear la orden")
            
            orden_id = result.data[0]['id']
            
            # Insertar detalles
            for detalle in orden_data.detalles:
                detalle_dict = detalle.model_dump()
                detalle_dict.update({
                    'orden_id': orden_id,
                    'subtotal': detalle.cantidad * detalle.precio_unitario
                })
                
                self.supabase.table('orden_detalles').insert(detalle_dict).execute()
            
            return BaseResponse(
                success=True,
                message="Orden de compra creada exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_ordenes(self, page: int = 1, limit: int = 10, 
                             search: Optional[str] = None, 
                             estado: Optional[str] = None,
                             proveedor: Optional[str] = None) -> PaginatedResponse:
        """Obtener lista paginada de órdenes con filtros"""
        try:
            offset = (page - 1) * limit
            
            # Construir query base
            query = self.supabase.table('ordenes_compra').select('*', count='exact')
            
            # Aplicar filtros
            if search:
                query = query.or_(f'numero_orden.ilike.%{search}%,proveedor.ilike.%{search}%,solicitado_por.ilike.%{search}%')
            
            if estado and estado != "todos":
                if estado == "pendiente":
                    query = query.eq('estado', 'Pendiente')
                elif estado == "aprobada":
                    query = query.eq('estado', 'Aprobada')
                elif estado == "enviada":
                    query = query.eq('estado', 'Enviada')
                elif estado == "recibida":
                    query = query.eq('estado', 'Recibida')
                elif estado == "cancelada":
                    query = query.eq('estado', 'Cancelada')
            
            if proveedor and proveedor != "todos":
                query = query.ilike('proveedor', f'%{proveedor}%')
            
            # Ejecutar query con paginación
            query = query.range(offset, offset + limit - 1).order('created_at', desc=True)
            result = query.execute()
            
            total = result.count if result.count else 0
            pages = ceil(total / limit) if total > 0 else 1
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            )
            
        except Exception as e:
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=1
            )
    
    async def obtener_orden(self, orden_id: UUID) -> BaseResponse:
        """Obtener una orden específica con sus detalles"""
        try:
            # Obtener orden
            result = self.supabase.table('ordenes_compra').select('*').eq(
                'id', str(orden_id)
            ).execute()
            
            if not result.data:
                return BaseResponse(success=False, message="Orden no encontrada")
            
            orden = result.data[0]
            
            # Obtener detalles de la orden
            detalles_result = self.supabase.table('orden_detalles').select(
                '*, inventarios(nombre_item, unidad_medida)'
            ).eq('orden_id', str(orden_id)).execute()
            
            orden['detalles'] = detalles_result.data or []
            
            return BaseResponse(
                success=True,
                message="Orden obtenida exitosamente",
                data=orden
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def actualizar_orden(self, orden_id: UUID, orden_data: OrdenCompraUpdate) -> BaseResponse:
        """Actualizar una orden de compra"""
        try:
            # Preparar datos para actualización
            update_data = {k: v for k, v in orden_data.model_dump(exclude_unset=True).items() if v is not None}
            
            # Si se actualizan los detalles, recalcular totales
            if orden_data.detalles is not None:
                total_orden = sum(detalle.cantidad * detalle.precio_unitario for detalle in orden_data.detalles)
                iva = total_orden * 0.16
                total_con_iva = total_orden + iva
                
                update_data.update({
                    'total_orden': total_orden,
                    'iva': iva,
                    'total_con_iva': total_con_iva
                })
                
                # Eliminar detalles existentes
                self.supabase.table('orden_detalles').delete().eq('orden_id', str(orden_id)).execute()
                
                # Insertar nuevos detalles
                for detalle in orden_data.detalles:
                    detalle_dict = detalle.model_dump()
                    detalle_dict.update({
                        'orden_id': str(orden_id),
                        'subtotal': detalle.cantidad * detalle.precio_unitario
                    })
                    
                    self.supabase.table('orden_detalles').insert(detalle_dict).execute()
            
            # Actualizar orden
            result = self.supabase.table('ordenes_compra').update(update_data).eq(
                'id', str(orden_id)
            ).execute()
            
            if not result.data:
                return BaseResponse(success=False, message="Orden no encontrada")
            
            return BaseResponse(
                success=True,
                message="Orden actualizada exitosamente",
                data=result.data[0]
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def eliminar_orden(self, orden_id: UUID) -> BaseResponse:
        """Eliminar una orden de compra"""
        try:
            # Verificar que la orden existe y no está aprobada/enviada
            result = self.supabase.table('ordenes_compra').select('estado').eq(
                'id', str(orden_id)
            ).execute()
            
            if not result.data:
                return BaseResponse(success=False, message="Orden no encontrada")
            
            estado = result.data[0]['estado']
            if estado in ['Aprobada', 'Enviada', 'Recibida']:
                return BaseResponse(
                    success=False, 
                    message="No se puede eliminar una orden aprobada o enviada"
                )
            
            # Eliminar orden (los detalles se eliminan por CASCADE)
            delete_result = self.supabase.table('ordenes_compra').delete().eq(
                'id', str(orden_id)
            ).execute()
            
            if not delete_result.data:
                return BaseResponse(success=False, message="Error al eliminar la orden")
            
            return BaseResponse(
                success=True,
                message="Orden eliminada exitosamente"
            )
            
        except Exception as e:
            return BaseResponse(**self.handle_db_error(e))
    
    async def obtener_estadisticas(self) -> EstadisticasOrdenes:
        """Obtener estadísticas de órdenes de compra"""
        try:
            # Obtener conteos por estado
            result = self.supabase.table('ordenes_compra').select('estado, total_orden').execute()
            
            if not result.data:
                return EstadisticasOrdenes(
                    total_ordenes=0, pendientes=0, aprobadas=0, enviadas=0,
                    recibidas=0, canceladas=0, valor_total_pendientes=0.0,
                    valor_total_aprobadas=0.0, valor_total_general=0.0
                )
            
            ordenes = result.data
            
            # Calcular estadísticas
            total_ordenes = len(ordenes)
            pendientes = len([o for o in ordenes if o['estado'] == 'Pendiente'])
            aprobadas = len([o for o in ordenes if o['estado'] == 'Aprobada'])
            enviadas = len([o for o in ordenes if o['estado'] == 'Enviada'])
            recibidas = len([o for o in ordenes if o['estado'] == 'Recibida'])
            canceladas = len([o for o in ordenes if o['estado'] == 'Cancelada'])
            
            valor_total_pendientes = sum(o['total_orden'] for o in ordenes if o['estado'] == 'Pendiente')
            valor_total_aprobadas = sum(o['total_orden'] for o in ordenes if o['estado'] == 'Aprobada')
            valor_total_general = sum(o['total_orden'] for o in ordenes)
            
            return EstadisticasOrdenes(
                total_ordenes=total_ordenes,
                pendientes=pendientes,
                aprobadas=aprobadas,
                enviadas=enviadas,
                recibidas=recibidas,
                canceladas=canceladas,
                valor_total_pendientes=valor_total_pendientes,
                valor_total_aprobadas=valor_total_aprobadas,
                valor_total_general=valor_total_general
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas de órdenes: {e}")
            return EstadisticasOrdenes(
                total_ordenes=0, pendientes=0, aprobadas=0, enviadas=0,
                recibidas=0, canceladas=0, valor_total_pendientes=0.0,
                valor_total_aprobadas=0.0, valor_total_general=0.0
            )

# ===================================
# SERVICIO DE PERSONAL MÉDICO
# ===================================

class PersonalService(DatabaseService):
    """Servicio para gestión de personal médico"""
    
    def __init__(self, supabase_client: Client):
        super().__init__(supabase_client)
        self.table = "personal_medico"
    
    def _generar_numero_empleado(self) -> str:
        """Generar número único de empleado"""
        timestamp = int(time.time())
        return f"EMP-{timestamp % 100000:05d}"
    
    async def crear_empleado(self, personal_data: PersonalMedicoCreate) -> dict:
        """Crear nuevo empleado"""
        try:
            empleado_dict = personal_data.model_dump()
            empleado_dict.update({
                'id': str(uuid4()),
                'numero_empleado': self._generar_numero_empleado(),
                'ultima_actividad': datetime.now().isoformat(),
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            })
            
            result = self.supabase.table(self.table).insert(empleado_dict).execute()
            
            if result.data and len(result.data) > 0:
                return BaseResponse(
                    success=True,
                    message="Empleado creado exitosamente",
                    data=result.data[0]
                ).model_dump()
            else:
                raise Exception("No se pudo crear el empleado")
                
        except Exception as e:
            print(f"Error creando empleado: {e}")
            return BaseResponse(
                success=False,
                message=f"Error creando empleado: {str(e)}"
            ).model_dump()
    
    async def obtener_empleados(self, page: int = 1, limit: int = 10, search: Optional[str] = None) -> dict:
        """Obtener lista paginada de empleados"""
        try:
            offset = (page - 1) * limit
            
            # Construir query base
            query = self.supabase.table(self.table).select("*")
            
            # Agregar filtro de búsqueda si se proporciona
            if search:
                search_lower = search.lower()
                query = query.or_(f"nombre.ilike.%{search}%,apellido.ilike.%{search}%,puesto.ilike.%{search}%,departamento.ilike.%{search}%")
            
            # Obtener total de registros
            count_result = query.execute()
            total = len(count_result.data) if count_result.data else 0
            
            # Obtener datos paginados
            result = query.range(offset, offset + limit - 1).order('created_at', desc=True).execute()
            
            pages = ceil(total / limit)
            
            return PaginatedResponse(
                items=result.data or [],
                total=total,
                page=page,
                limit=limit,
                pages=pages
            ).model_dump()
            
        except Exception as e:
            print(f"Error obteniendo empleados: {e}")
            return PaginatedResponse(
                items=[],
                total=0,
                page=page,
                limit=limit,
                pages=0
            ).model_dump()
    
    async def obtener_empleado(self, empleado_id: UUID) -> dict:
        """Obtener empleado específico"""
        try:
            result = self.supabase.table(self.table).select("*").eq('id', str(empleado_id)).execute()
            
            if result.data and len(result.data) > 0:
                return BaseResponse(
                    success=True,
                    message="Empleado encontrado",
                    data=result.data[0]
                ).model_dump()
            else:
                return BaseResponse(
                    success=False,
                    message="Empleado no encontrado"
                ).model_dump()
                
        except Exception as e:
            print(f"Error obteniendo empleado: {e}")
            return BaseResponse(
                success=False,
                message=f"Error obteniendo empleado: {str(e)}"
            ).model_dump()
    
    async def actualizar_empleado(self, empleado_id: UUID, personal_data: PersonalMedicoUpdate) -> dict:
        """Actualizar empleado existente"""
        try:
            # Filtrar datos no nulos para actualización parcial
            update_data = {k: v for k, v in personal_data.model_dump().items() if v is not None}
            update_data['updated_at'] = datetime.now().isoformat()
            
            result = self.supabase.table(self.table).update(update_data).eq('id', str(empleado_id)).execute()
            
            if result.data and len(result.data) > 0:
                return BaseResponse(
                    success=True,
                    message="Empleado actualizado exitosamente",
                    data=result.data[0]
                ).model_dump()
            else:
                return BaseResponse(
                    success=False,
                    message="Empleado no encontrado"
                ).model_dump()
                
        except Exception as e:
            print(f"Error actualizando empleado: {e}")
            return BaseResponse(
                success=False,
                message=f"Error actualizando empleado: {str(e)}"
            ).model_dump()
    
    async def eliminar_empleado(self, empleado_id: UUID) -> dict:
        """Eliminar empleado (soft delete cambiando estado a Inactivo)"""
        try:
            result = self.supabase.table(self.table).update({
                'estado': EstadoPersonalEnum.INACTIVO.value,
                'updated_at': datetime.now().isoformat()
            }).eq('id', str(empleado_id)).execute()
            
            if result.data and len(result.data) > 0:
                return BaseResponse(
                    success=True,
                    message="Empleado eliminado exitosamente"
                ).model_dump()
            else:
                return BaseResponse(
                    success=False,
                    message="Empleado no encontrado"
                ).model_dump()
                
        except Exception as e:
            print(f"Error eliminando empleado: {e}")
            return BaseResponse(
                success=False,
                message=f"Error eliminando empleado: {str(e)}"
            ).model_dump()
    
    async def obtener_estadisticas(self) -> EstadisticasPersonal:
        """Obtener estadísticas del personal"""
        try:
            # Obtener todos los empleados
            result = self.supabase.table(self.table).select("*").execute()
            empleados = result.data or []
            
            # Calcular estadísticas
            total_empleados = len(empleados)
            empleados_activos = len([e for e in empleados if e.get('estado') == 'Activo'])
            empleados_vacaciones = len([e for e in empleados if e.get('estado') == 'Vacaciones'])
            empleados_licencia = len([e for e in empleados if e.get('estado') == 'Licencia'])
            empleados_inactivos = len([e for e in empleados if e.get('estado') == 'Inactivo'])
            
            # Calcular departamentos únicos
            departamentos = {}
            nomina_total = 0
            for empleado in empleados:
                dept = empleado.get('departamento')
                if dept:
                    departamentos[dept] = departamentos.get(dept, 0) + 1
                
                # Sumar salarios solo de empleados activos
                if empleado.get('estado') in ['Activo', 'Vacaciones', 'Licencia']:
                    nomina_total += empleado.get('salario', 0)
            
            total_departamentos = len(departamentos)
            
            return EstadisticasPersonal(
                total_empleados=total_empleados,
                empleados_activos=empleados_activos,
                empleados_vacaciones=empleados_vacaciones,
                empleados_licencia=empleados_licencia,
                empleados_inactivos=empleados_inactivos,
                total_departamentos=total_departamentos,
                nomina_mensual=nomina_total,
                departamentos=departamentos
            )
            
        except Exception as e:
            print(f"Error obteniendo estadísticas de personal: {e}")
            return EstadisticasPersonal(
                total_empleados=0,
                empleados_activos=0,
                empleados_vacaciones=0,
                empleados_licencia=0,
                empleados_inactivos=0,
                total_departamentos=0,
                nomina_mensual=0.0,
                departamentos={}
            )
    
    async def buscar_empleados(self, query: str) -> dict:
        """Buscar empleados por término de búsqueda"""
        try:
            search_lower = query.lower()
            result = self.supabase.table(self.table).select("*").or_(
                f"nombre.ilike.%{query}%,apellido.ilike.%{query}%,puesto.ilike.%{query}%,departamento.ilike.%{query}%,especialidad.ilike.%{query}%"
            ).execute()
            
            return BaseResponse(
                success=True,
                message=f"Encontrados {len(result.data or [])} empleados",
                data=result.data or []
            ).model_dump()
            
        except Exception as e:
            print(f"Error buscando empleados: {e}")
            return BaseResponse(
                success=False,
                message=f"Error buscando empleados: {str(e)}",
                data=[]
            ).model_dump()
    
    async def actualizar_actividad(self, empleado_id: UUID) -> dict:
        """Actualizar última actividad del empleado"""
        try:
            result = self.supabase.table(self.table).update({
                'ultima_actividad': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }).eq('id', str(empleado_id)).execute()
            
            return BaseResponse(
                success=True,
                message="Actividad actualizada"
            ).model_dump()
            
        except Exception as e:
            print(f"Error actualizando actividad: {e}")
            return BaseResponse(
                success=False,
                message=f"Error actualizando actividad: {str(e)}"
            ).model_dump()