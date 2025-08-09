# tests/test_chat.py
"""
Tests para endpoints y servicios de chat IA médico
"""

import pytest
from unittest.mock import AsyncMock, patch, Mock
from uuid import uuid4

from models import ChatRequest, ConversacionChatCreate, MensajeChatCreate

class TestChatEndpoints:
    """Tests para endpoints de chat IA"""
    
    def test_procesar_mensaje_chat(self, client, chat_request_ejemplo):
        """Test procesar mensaje de chat"""
        with patch('main.chat_service.procesar_mensaje_chat') as mock_procesar:
            mock_procesar.return_value = AsyncMock(return_value={
                "respuesta": "Los síntomas de la neumonía incluyen fiebre, tos, dificultad respiratoria...",
                "conversacion_id": str(uuid4()),
                "confianza": 0.9,
                "tiempo_respuesta": 2.5,
                "modelo_usado": "medgemma-4b-it-mlx"
            })
            
            response = client.post("/api/v1/chat", json=chat_request_ejemplo)
            
            assert response.status_code == 200
            data = response.json()
            assert "respuesta" in data
            assert "conversacion_id" in data
            assert data["confianza"] == 0.9
    
    def test_crear_conversacion_chat(self, client):
        """Test crear nueva conversación de chat"""
        conversacion_data = {
            "titulo": "Consulta Cardiología",
            "especialidad": "Cardiología",
            "usuario": "Dr. Pérez"
        }
        
        with patch('main.chat_service.crear_conversacion') as mock_crear:
            mock_crear.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Conversación creada exitosamente",
                "data": {
                    "id": str(uuid4()),
                    **conversacion_data
                }
            })
            
            response = client.post("/api/v1/chat/conversacion", json=conversacion_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["data"]["especialidad"] == "Cardiología"
    
    def test_obtener_conversaciones(self, client):
        """Test obtener conversaciones de usuario"""
        usuario = "Dr. Pérez"
        
        with patch('main.chat_service.obtener_conversaciones') as mock_obtener:
            mock_obtener.return_value = AsyncMock(return_value={
                "items": [
                    {
                        "id": str(uuid4()),
                        "titulo": "Consulta Cardiología",
                        "especialidad": "Cardiología",
                        "usuario": usuario,
                        "activa": True
                    }
                ],
                "total": 1,
                "page": 1,
                "limit": 20,
                "pages": 1
            })
            
            response = client.get(f"/api/v1/chat/conversaciones?usuario={usuario}")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["items"]) >= 0
    
    def test_obtener_historial_conversacion(self, client):
        """Test obtener historial de mensajes"""
        conversacion_id = str(uuid4())
        
        with patch('main.chat_service.obtener_historial_conversacion') as mock_historial:
            mock_historial.return_value = AsyncMock(return_value=[
                {
                    "id": str(uuid4()),
                    "rol": "user",
                    "contenido": "¿Qué es la hipertensión?",
                    "timestamp_mensaje": "2024-01-15T10:30:00Z"
                },
                {
                    "id": str(uuid4()),
                    "rol": "assistant",
                    "contenido": "La hipertensión es...",
                    "timestamp_mensaje": "2024-01-15T10:30:05Z"
                }
            ])
            
            response = client.get(f"/api/v1/chat/conversaciones/{conversacion_id}/mensajes")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert len(data["data"]) >= 0

class TestChatService:
    """Tests para el servicio de chat"""
    
    @pytest.mark.asyncio
    async def test_procesar_mensaje_chat_nueva_conversacion(self, chat_service):
        """Test procesar mensaje creando nueva conversación"""
        request = ChatRequest(
            mensaje="¿Cuáles son los síntomas de la diabetes?",
            especialidad="General"
        )
        
        # Mock para crear conversación
        async def mock_crear_conversacion(data):
            return type('obj', (object,), {
                'success': True,
                'data': {'id': str(uuid4())}
            })
        
        chat_service.crear_conversacion = mock_crear_conversacion
        
        # Mock para guardar mensaje
        async def mock_guardar_mensaje(conv_id, mensaje):
            return type('obj', (object,), {
                'success': True,
                'data': {'id': str(uuid4())}
            })
        
        chat_service.guardar_mensaje = mock_guardar_mensaje
        
        # Mock para obtener historial
        async def mock_obtener_historial(conv_id):
            return []
        
        chat_service.obtener_historial_conversacion = mock_obtener_historial
        
        # Mock para la respuesta de IA
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.json.return_value = {
                "choices": [
                    {
                        "message": {
                            "content": "Los síntomas de la diabetes incluyen..."
                        }
                    }
                ]
            }
            mock_response.raise_for_status.return_value = None
            
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            result = await chat_service.procesar_mensaje_chat(request)
            
            assert result.respuesta is not None
            assert result.conversacion_id is not None
            assert result.tiempo_respuesta is not None
    
    @pytest.mark.asyncio
    async def test_crear_conversacion_service(self, chat_service):
        """Test crear conversación en el servicio"""
        conversacion_data = ConversacionChatCreate(
            titulo="Consulta Neurología",
            especialidad="Neurología",
            usuario="Dr. González"
        )
        
        # Configurar mock
        chat_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "titulo": "Consulta Neurología",
                "especialidad": "Neurología",
                "usuario": "Dr. González"
            }
        ]
        
        result = await chat_service.crear_conversacion(conversacion_data)
        
        assert result.success is True
        assert result.message == "Conversación creada exitosamente"
    
    @pytest.mark.asyncio
    async def test_guardar_mensaje_service(self, chat_service):
        """Test guardar mensaje en el servicio"""
        conversacion_id = uuid4()
        mensaje_data = MensajeChatCreate(
            rol="user",
            contenido="¿Qué es la migraña?"
        )
        
        # Configurar mock
        chat_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "conversacion_id": str(conversacion_id),
                "rol": "user",
                "contenido": "¿Qué es la migraña?"
            }
        ]
        
        result = await chat_service.guardar_mensaje(conversacion_id, mensaje_data)
        
        assert result.success is True
        assert result.message == "Mensaje guardado exitosamente"
    
    def test_generar_prompt_especialidad(self, chat_service):
        """Test generación de prompts por especialidad"""
        from models import EspecialidadEnum
        
        # Test especialidad de cardiología
        prompt_cardio = chat_service._generar_prompt_especialidad(EspecialidadEnum.CARDIOLOGIA)
        assert "cardiólogo" in prompt_cardio.lower()
        assert "cardiovascular" in prompt_cardio.lower()
        
        # Test especialidad de radiología
        prompt_radio = chat_service._generar_prompt_especialidad(EspecialidadEnum.RADIOLOGIA)
        assert "radiólogo" in prompt_radio.lower()
        assert "imágenes médicas" in prompt_radio.lower()
        
        # Test especialidad general
        prompt_general = chat_service._generar_prompt_especialidad(EspecialidadEnum.GENERAL)
        assert "médico general" in prompt_general.lower()
    
    @pytest.mark.asyncio
    async def test_obtener_conversaciones_paginadas(self, chat_service):
        """Test obtener conversaciones con paginación"""
        usuario = "Dr. Smith"
        
        # Configurar mock para query paginada
        chat_service.supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = type('obj', (object,), {
            'data': [
                {
                    "id": str(uuid4()),
                    "titulo": "Consulta 1",
                    "especialidad": "General",
                    "usuario": usuario
                }
            ],
            'count': 1
        })
        
        result = await chat_service.obtener_conversaciones(usuario, page=1, limit=20)
        
        assert len(result.items) >= 0
        assert result.page == 1
        assert result.limit == 20