# tests/conftest.py
"""
Configuración de fixtures para los tests de Radix IA
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import Mock, AsyncMock
import os
import sys

# Agregar el directorio padre al path para importar los módulos
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from services import PacienteService, EstudioService, ReporteService, ChatService, IAService

@pytest.fixture(scope="session")
def event_loop():
    """Crear un event loop para toda la sesión de tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture
def client():
    """Cliente de test para FastAPI"""
    return TestClient(app)

@pytest.fixture
def mock_supabase():
    """Mock del cliente Supabase"""
    mock_client = Mock()
    
    # Mock para operaciones de tabla
    mock_table = Mock()
    mock_table.insert.return_value.execute.return_value.data = [{"id": "test-id"}]
    mock_table.select.return_value.execute.return_value.data = []
    mock_table.update.return_value.execute.return_value.data = [{"id": "test-id"}]
    mock_table.delete.return_value.execute.return_value.data = [{"id": "test-id"}]
    
    mock_client.table.return_value = mock_table
    
    # Mock para RPC
    mock_client.rpc.return_value.execute.return_value.data = "TEST001"
    
    return mock_client

@pytest.fixture
def mock_embedding_model():
    """Mock del modelo de embeddings"""
    mock_model = Mock()
    mock_model.encode.return_value.tolist.return_value = [0.1, 0.2, 0.3]
    return mock_model

@pytest.fixture
def paciente_service(mock_supabase):
    """Servicio de pacientes con mocks"""
    return PacienteService(mock_supabase)

@pytest.fixture
def estudio_service(mock_supabase):
    """Servicio de estudios con mocks"""
    return EstudioService(mock_supabase)

@pytest.fixture
def ia_service(mock_supabase, mock_embedding_model):
    """Servicio de IA con mocks"""
    return IAService(mock_supabase, mock_embedding_model, "http://test-llm:1234")

@pytest.fixture
def reporte_service(mock_supabase, ia_service):
    """Servicio de reportes con mocks"""
    return ReporteService(mock_supabase, ia_service)

@pytest.fixture
def chat_service(mock_supabase, ia_service):
    """Servicio de chat con mocks"""
    return ChatService(mock_supabase, ia_service)

# Datos de ejemplo para tests
@pytest.fixture
def paciente_ejemplo():
    """Datos de ejemplo para crear un paciente"""
    return {
        "nombre": "Juan",
        "apellido": "Pérez",
        "fecha_nacimiento": "1980-01-15",
        "genero": "Masculino",
        "telefono": "+34123456789",
        "email": "juan.perez@email.com",
        "direccion": "Calle Ejemplo 123",
        "estado": "Activo",
        "condiciones_medicas": ["Hipertensión"],
        "alergias": ["Penicilina"]
    }

@pytest.fixture
def estudio_ejemplo():
    """Datos de ejemplo para crear un estudio"""
    return {
        "paciente_id": "550e8400-e29b-41d4-a716-446655440000",
        "tipo_estudio": "Radiografía",
        "fecha_estudio": "2024-01-15T10:30:00",
        "modalidad": "RX",
        "area_anatomica": "Tórax",
        "indicacion_clinica": "Dolor torácico",
        "estado": "Pendiente",
        "prioridad": "Normal",
        "medico_solicitante": "Dr. García"
    }

@pytest.fixture
def reporte_ejemplo():
    """Datos de ejemplo para crear un reporte"""
    return {
        "paciente_id": "550e8400-e29b-41d4-a716-446655440000",
        "tipo_estudio": "Radiografía",
        "radiologo": "Dr. Rodríguez",
        "hallazgos": "Campos pulmonares claros",
        "impresion_diagnostica": "Radiografía de tórax normal",
        "tecnica": "Radiografía PA y lateral de tórax",
        "recomendaciones": "Control en caso de síntomas"
    }

@pytest.fixture
def chat_request_ejemplo():
    """Datos de ejemplo para request de chat"""
    return {
        "mensaje": "¿Cuáles son los síntomas de la neumonía?",
        "especialidad": "General",
        "contexto_adicional": "Paciente con fiebre"
    }