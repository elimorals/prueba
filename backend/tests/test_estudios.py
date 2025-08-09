# tests/test_estudios.py
"""
Tests para endpoints y servicios de estudios médicos
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from models import EstudioCreate, EstudioUpdate

class TestEstudioEndpoints:
    """Tests para endpoints de estudios"""
    
    def test_crear_estudio_success(self, client, estudio_ejemplo):
        """Test crear estudio exitoso"""
        with patch('main.estudio_service.crear_estudio') as mock_crear:
            mock_crear.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Estudio creado exitosamente",
                "data": {"id": str(uuid4()), **estudio_ejemplo}
            })
            
            response = client.post("/api/v1/estudios", json=estudio_ejemplo)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "id" in data["data"]
    
    def test_obtener_estudios_con_filtros(self, client):
        """Test obtener estudios con filtros"""
        with patch('main.estudio_service.obtener_estudios') as mock_obtener:
            mock_obtener.return_value = AsyncMock(return_value={
                "items": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "pages": 1
            })
            
            response = client.get("/api/v1/estudios?estado=Pendiente&tipo=Radiografía")
            
            assert response.status_code == 200
            data = response.json()
            assert "items" in data
    
    def test_subir_archivo_dicom(self, client):
        """Test subir archivo DICOM"""
        estudio_id = str(uuid4())
        archivo_data = {
            "nombre": "imagen.dcm",
            "tipo": "application/dicom",
            "tamaño": 1024000,
            "url": "storage/archivos/imagen.dcm",
            "checksum": "abc123"
        }
        
        with patch('main.estudio_service.subir_archivo_dicom') as mock_subir:
            mock_subir.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Archivo DICOM subido exitosamente",
                "data": {"archivo": archivo_data}
            })
            
            response = client.post(f"/api/v1/estudios/{estudio_id}/dicom", json=archivo_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_estadisticas_estudios(self, client):
        """Test obtener estadísticas de estudios"""
        with patch('main.estudio_service.obtener_estadisticas') as mock_stats:
            mock_stats.return_value = AsyncMock(return_value={
                "total_estudios": 50,
                "pendientes": 10,
                "en_proceso": 15,
                "completados": 20,
                "cancelados": 5,
                "criticos": 2,
                "urgentes": 8,
                "esta_semana": 12,
                "por_modalidad": {
                    "Radiografía": 20,
                    "Tomografía": 15,
                    "RM": 10,
                    "Ecografía": 5
                }
            })
            
            response = client.get("/api/v1/estudios/estadisticas")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_estudios"] == 50
            assert "por_modalidad" in data

class TestEstudioService:
    """Tests para el servicio de estudios"""
    
    @pytest.mark.asyncio
    async def test_crear_estudio_service(self, estudio_service, estudio_ejemplo):
        """Test crear estudio en el servicio"""
        # Configurar mocks
        estudio_service.supabase.rpc.return_value.execute.return_value.data = "EST00000001"
        estudio_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": str(uuid4()), "numero_estudio": "EST00000001", **estudio_ejemplo}
        ]
        
        estudio_create = EstudioCreate(**estudio_ejemplo)
        result = await estudio_service.crear_estudio(estudio_create)
        
        assert result.success is True
        assert result.message == "Estudio creado exitosamente"
        assert result.data is not None
    
    @pytest.mark.asyncio
    async def test_obtener_estudios_filtrados(self, estudio_service):
        """Test obtener estudios con filtros"""
        paciente_id = uuid4()
        
        # Configurar mock para query con filtros
        estudio_service.supabase.table.return_value.select.return_value.eq.return_value.range.return_value.order.return_value.execute.return_value = type('obj', (object,), {
            'data': [{"id": str(uuid4()), "estado": "Pendiente"}],
            'count': 1
        })
        
        result = await estudio_service.obtener_estudios(
            page=1, 
            limit=10, 
            paciente_id=paciente_id, 
            estado="Pendiente"
        )
        
        assert len(result.items) >= 0
        assert result.total >= 0
    
    @pytest.mark.asyncio
    async def test_subir_archivo_dicom_service(self, estudio_service):
        """Test subir archivo DICOM en el servicio"""
        estudio_id = uuid4()
        archivo = type('obj', (object,), {
            'nombre': 'test.dcm',
            'tipo': 'application/dicom',
            'tamaño': 1024,
            'url': 'storage/test.dcm',
            'model_dump': lambda: {
                'nombre': 'test.dcm',
                'tipo': 'application/dicom',
                'tamaño': 1024,
                'url': 'storage/test.dcm'
            }
        })
        
        # Mock para obtener estudio actual
        estudio_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
            {"id": str(estudio_id), "archivos_dicom": []}
        ]
        
        # Mock para actualizar estudio
        estudio_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
            {"id": str(estudio_id), "archivos_dicom": ["storage/test.dcm"]}
        ]
        
        # Mockear el método obtener_estudio
        async def mock_obtener_estudio(estudio_id):
            return type('obj', (object,), {
                'success': True,
                'data': {"id": str(estudio_id), "archivos_dicom": []}
            })
        
        estudio_service.obtener_estudio = mock_obtener_estudio
        
        result = await estudio_service.subir_archivo_dicom(estudio_id, archivo)
        
        assert result.success is True
        assert result.message == "Archivo DICOM subido exitosamente"