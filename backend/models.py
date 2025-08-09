# models.py - Radix IA
from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
from uuid import UUID

# ===================================
# ENUMS
# ===================================

class GeneroEnum(str, Enum):
    MASCULINO = "Masculino"
    FEMENINO = "Femenino"
    OTRO = "Otro"

class EstadoPacienteEnum(str, Enum):
    ACTIVO = "Activo"
    INACTIVO = "Inactivo"
    SEGUIMIENTO = "Seguimiento"

class TipoEstudioEnum(str, Enum):
    RADIOGRAFIA = "Radiografía"
    TOMOGRAFIA = "Tomografía"
    RM = "RM"
    ECOGRAFIA = "Ecografía"
    MAMOGRAFIA = "Mamografía"
    DENSITOMETRIA = "Densitometría"

class EstadoEstudioEnum(str, Enum):
    PENDIENTE = "Pendiente"
    EN_PROCESO = "En Proceso"
    COMPLETADO = "Completado"
    CANCELADO = "Cancelado"

class PrioridadEnum(str, Enum):
    NORMAL = "Normal"
    URGENTE = "Urgente"
    CRITICA = "Crítica"

class EstadoReporteEnum(str, Enum):
    BORRADOR = "Borrador"
    PENDIENTE_REVISION = "Pendiente Revisión"
    FIRMADO = "Firmado"

class EspecialidadEnum(str, Enum):
    GENERAL = "General"
    DERMATOLOGIA = "Dermatología"
    CARDIOLOGIA = "Cardiología"
    NEUROLOGIA = "Neurología"
    RADIOLOGIA = "Radiología"
    GINECOLOGIA = "Ginecología"

class RolChatEnum(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

# ===================================
# MODELOS BASE
# ===================================

class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Operación exitosa"
    data: Optional[Any] = None

class PaginationParams(BaseModel):
    page: int = Field(1, ge=1, description="Número de página")
    limit: int = Field(10, ge=1, le=100, description="Elementos por página")
    search: Optional[str] = Field(None, description="Término de búsqueda")

class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    limit: int
    pages: int

# ===================================
# MODELOS DE PACIENTES
# ===================================

class ContactoEmergencia(BaseModel):
    nombre: str
    telefono: str
    relacion: str
    email: Optional[str] = None

class PacienteBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    fecha_nacimiento: date
    genero: GeneroEnum
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    numero_seguro: Optional[str] = Field(None, max_length=50)
    estado: EstadoPacienteEnum = EstadoPacienteEnum.ACTIVO
    condiciones_medicas: List[str] = Field(default_factory=list)
    alergias: List[str] = Field(default_factory=list)
    medicamentos_actuales: List[str] = Field(default_factory=list)
    contacto_emergencia: Optional[ContactoEmergencia] = None
    notas_adicionales: Optional[str] = None

class PacienteCreate(PacienteBase):
    pass

class PacienteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    apellido: Optional[str] = Field(None, min_length=1, max_length=100)
    fecha_nacimiento: Optional[date] = None
    genero: Optional[GeneroEnum] = None
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    numero_seguro: Optional[str] = Field(None, max_length=50)
    estado: Optional[EstadoPacienteEnum] = None
    condiciones_medicas: Optional[List[str]] = None
    alergias: Optional[List[str]] = None
    medicamentos_actuales: Optional[List[str]] = None
    contacto_emergencia: Optional[ContactoEmergencia] = None
    notas_adicionales: Optional[str] = None

class Paciente(PacienteBase):
    id: UUID
    numero_paciente: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

# ===================================
# MODELOS DE ESTUDIOS
# ===================================

class MetadatosDicom(BaseModel):
    serie_uid: Optional[str] = None
    study_uid: Optional[str] = None
    modality: Optional[str] = None
    body_part: Optional[str] = None
    patient_position: Optional[str] = None
    slice_thickness: Optional[float] = None
    pixel_spacing: Optional[List[float]] = None
    image_orientation: Optional[List[float]] = None
    additional_data: Optional[Dict[str, Any]] = None

class EstudioBase(BaseModel):
    paciente_id: UUID
    tipo_estudio: TipoEstudioEnum
    fecha_estudio: datetime
    modalidad: str = Field(..., min_length=1, max_length=20)
    area_anatomica: str = Field(..., min_length=1, max_length=100)
    indicacion_clinica: str = Field(..., min_length=1)
    estado: EstadoEstudioEnum = EstadoEstudioEnum.PENDIENTE
    prioridad: PrioridadEnum = PrioridadEnum.NORMAL
    tecnico_responsable: Optional[str] = Field(None, max_length=100)
    medico_solicitante: str = Field(..., min_length=1, max_length=100)
    observaciones: Optional[str] = None
    archivos_dicom: List[str] = Field(default_factory=list)
    metadatos_dicom: Optional[MetadatosDicom] = None

class EstudioCreate(EstudioBase):
    pass

class EstudioUpdate(BaseModel):
    tipo_estudio: Optional[TipoEstudioEnum] = None
    fecha_estudio: Optional[datetime] = None
    modalidad: Optional[str] = Field(None, min_length=1, max_length=20)
    area_anatomica: Optional[str] = Field(None, min_length=1, max_length=100)
    indicacion_clinica: Optional[str] = Field(None, min_length=1)
    estado: Optional[EstadoEstudioEnum] = None
    prioridad: Optional[PrioridadEnum] = None
    tecnico_responsable: Optional[str] = Field(None, max_length=100)
    medico_solicitante: Optional[str] = Field(None, min_length=1, max_length=100)
    observaciones: Optional[str] = None
    archivos_dicom: Optional[List[str]] = None
    metadatos_dicom: Optional[MetadatosDicom] = None

class Estudio(EstudioBase):
    id: UUID
    numero_estudio: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

# ===================================
# MODELOS DE REPORTES
# ===================================

class ReporteBase(BaseModel):
    estudio_id: Optional[UUID] = None
    paciente_id: UUID
    tipo_estudio: str = Field(..., min_length=1, max_length=50)
    radiologo: str = Field(..., min_length=1, max_length=100)
    estado: EstadoReporteEnum = EstadoReporteEnum.BORRADOR
    confianza_ia: Optional[float] = Field(None, ge=0.0, le=1.0)
    tecnica: Optional[str] = None
    hallazgos: str = Field(..., min_length=1)
    impresion_diagnostica: str = Field(..., min_length=1)
    recomendaciones: Optional[str] = None
    reporte_generado: Optional[str] = None
    tiempo_generacion: Optional[int] = None
    modelo_ia_usado: Optional[str] = Field(None, max_length=100)
    version_modelo: Optional[str] = Field(None, max_length=20)

class ReporteCreate(ReporteBase):
    pass

class ReporteUpdate(BaseModel):
    radiologo: Optional[str] = Field(None, min_length=1, max_length=100)
    estado: Optional[EstadoReporteEnum] = None
    confianza_ia: Optional[float] = Field(None, ge=0.0, le=1.0)
    tecnica: Optional[str] = None
    hallazgos: Optional[str] = Field(None, min_length=1)
    impresion_diagnostica: Optional[str] = Field(None, min_length=1)
    recomendaciones: Optional[str] = None
    reporte_generado: Optional[str] = None
    tiempo_generacion: Optional[int] = None
    modelo_ia_usado: Optional[str] = Field(None, max_length=100)
    version_modelo: Optional[str] = Field(None, max_length=20)

class Reporte(ReporteBase):
    id: UUID
    numero_reporte: str
    fecha_reporte: datetime
    firmado_por: Optional[str] = None
    fecha_firma: Optional[datetime] = None
    hash_firma: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

class FirmaReporte(BaseModel):
    firmado_por: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=1)

# ===================================
# MODELOS DE CHAT IA
# ===================================

class ChatMessage(BaseModel):
    role: RolChatEnum
    content: str = Field(..., min_length=1)

class MensajeChatBase(BaseModel):
    conversacion_id: UUID
    rol: RolChatEnum
    contenido: str = Field(..., min_length=1)
    archivos_adjuntos: List[str] = Field(default_factory=list)
    metadatos: Optional[Dict[str, Any]] = None

class MensajeChatCreate(BaseModel):
    rol: RolChatEnum
    contenido: str = Field(..., min_length=1)
    archivos_adjuntos: List[str] = Field(default_factory=list)
    metadatos: Optional[Dict[str, Any]] = None

class MensajeChat(MensajeChatBase):
    id: UUID
    timestamp_mensaje: datetime
    
    model_config = {"from_attributes": True}

class ConversacionChatBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=200)
    especialidad: EspecialidadEnum
    usuario: str = Field(..., min_length=1, max_length=100)
    activa: bool = True

class ConversacionChatCreate(ConversacionChatBase):
    pass

class ConversacionChat(ConversacionChatBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    mensajes: List[MensajeChat] = Field(default_factory=list)
    
    model_config = {"from_attributes": True}

class ChatRequest(BaseModel):
    mensaje: str = Field(..., min_length=1)
    especialidad: EspecialidadEnum = EspecialidadEnum.GENERAL
    conversacion_id: Optional[UUID] = None
    archivos_adjuntos: List[str] = Field(default_factory=list)
    contexto_adicional: Optional[str] = None

class ChatResponse(BaseModel):
    respuesta: str
    conversacion_id: UUID
    confianza: Optional[float] = None
    tiempo_respuesta: Optional[float] = None
    modelo_usado: Optional[str] = None

# ===================================
# MODELOS DE IA Y RAG
# ===================================

class TGIRequest(BaseModel):
    model: str = "tgi"
    messages: List[ChatMessage]
    stream: bool = False
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(2048, ge=1, le=4096)

# Mantenemos LMStudioRequest para compatibilidad temporal
class LMStudioRequest(BaseModel):
    model: str = "tgi"
    messages: List[ChatMessage]
    stream: bool = False
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(2048, ge=1, le=4096)

class TGIImageRequest(BaseModel):
    model: str = "tgi"
    messages: List[Dict[str, Any]]  # Incluye tanto texto como imágenes
    stream: bool = False
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(2048, ge=1, le=4096)

class DicomAnalysisRequest(BaseModel):
    imagen_base64: str = Field(..., description="Imagen DICOM en formato base64")
    contexto_clinico: Optional[str] = Field(None, description="Contexto clínico opcional")
    tipo_estudio: Optional[str] = Field(None, description="Tipo de estudio radiológico")
    pregunta_especifica: Optional[str] = Field(None, description="Pregunta específica sobre la imagen")

class ReportGenerationRequest(BaseModel):
    paciente_id: UUID
    estudio_id: Optional[UUID] = None
    tipo_estudio: str = Field(..., min_length=1)
    contexto_clinico: str = Field(..., min_length=1)
    radiologo: str = Field(..., min_length=1, max_length=100)
    incluir_contexto_rag: bool = True
    temperatura: float = Field(0.3, ge=0.0, le=1.0)

class RAGSearchRequest(BaseModel):
    query: str = Field(..., min_length=1)
    paciente_id: Optional[UUID] = None
    limite_resultados: int = Field(5, ge=1, le=20)
    umbral_similitud: float = Field(0.5, ge=0.0, le=1.0)

class RAGSearchResult(BaseModel):
    id: UUID
    reporte_id: UUID
    paciente_id: UUID
    contenido: str
    similitud: float

# ===================================
# MODELOS DE ESTADÍSTICAS
# ===================================

class EstadisticasPacientes(BaseModel):
    total_pacientes: int
    pacientes_activos: int
    pacientes_inactivos: int
    pacientes_seguimiento: int
    nuevos_este_mes: int
    edad_promedio: float

class EstadisticasEstudios(BaseModel):
    total_estudios: int
    pendientes: int
    en_proceso: int
    completados: int
    cancelados: int
    criticos: int
    urgentes: int
    esta_semana: int
    por_modalidad: Dict[str, int] = Field(default_factory=dict)

class EstadisticasReportes(BaseModel):
    total_reportes: int
    borradores: int
    pendientes_revision: int
    firmados: int
    confianza_promedio: float
    tiempo_promedio_generacion: float

# ===================================
# MODELOS DE PERSONAL MÉDICO
# ===================================

class PersonalMedicoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    apellido: str = Field(..., min_length=1, max_length=100)
    especialidad: str = Field(..., min_length=1, max_length=100)
    titulo: Optional[str] = Field(None, max_length=100)
    email: EmailStr
    telefono: Optional[str] = Field(None, max_length=20)
    licencia_medica: Optional[str] = Field(None, max_length=50)
    estado: str = Field("Activo", pattern="^(Activo|Inactivo|Licencia)$")
    fecha_ingreso: date
    departamento: Optional[str] = Field(None, max_length=100)
    turno: Optional[str] = Field(None, pattern="^(Mañana|Tarde|Noche|Rotativo)$")

class PersonalMedicoCreate(PersonalMedicoBase):
    pass

class PersonalMedico(PersonalMedicoBase):
    id: UUID
    numero_empleado: str
    created_at: datetime
    updated_at: datetime
    
    model_config = {"from_attributes": True}

# ===================================
# MODELOS DE ARCHIVOS
# ===================================

class ArchivoSubida(BaseModel):
    nombre: str
    tipo: str
    tamaño: int
    url: str
    estudio_id: Optional[UUID] = None
    checksum: Optional[str] = None

class SubidaDicomResponse(BaseModel):
    archivo: ArchivoSubida
    metadatos: Optional[MetadatosDicom] = None
    procesado: bool = True
    errores: List[str] = Field(default_factory=list)