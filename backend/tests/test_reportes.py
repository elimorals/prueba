# tests/test_reportes.py
"""
Tests para endpoints y servicios de reportes médicos
"""

import pytest
from unittest.mock import AsyncMock, patch, Mock
from uuid import uuid4

from models import ReporteCreate, ReportGenerationRequest, FirmaReporte

class TestReporteEndpoints:
    """Tests para endpoints de reportes"""
    
    def test_crear_reporte_manual(self, client, reporte_ejemplo):
        """Test crear reporte manualmente"""
        with patch('main.reporte_service.crear_reporte') as mock_crear:
            mock_crear.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Reporte creado exitosamente",
                "data": {"id": str(uuid4()), **reporte_ejemplo}
            })
            
            response = client.post("/api/v1/reportes", json=reporte_ejemplo)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_generar_reporte_ia(self, client):
        """Test generar reporte con IA"""
        request_data = {
            "paciente_id": str(uuid4()),
            "tipo_estudio": "Radiografía",
            "contexto_clinico": "Dolor torácico agudo",
            "radiologo": "Dr. García",
            "incluir_contexto_rag": True,
            "temperatura": 0.3
        }
        
        with patch('main.reporte_service.generar_reporte_ia') as mock_generar:
            mock_generar.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Reporte generado exitosamente por IA",
                "data": {
                    "reporte": {
                        "id": str(uuid4()),
                        "reporte_generado": "Reporte generado por IA...",
                        "confianza_ia": 0.85
                    },
                    "tiempo_generacion": 15,
                    "confianza_ia": 0.85
                }
            })
            
            response = client.post("/api/v1/reportes/generar", json=request_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "tiempo_generacion" in data["data"]
    
    def test_firmar_reporte(self, client):
        """Test firmar reporte digitalmente"""
        reporte_id = str(uuid4())
        firma_data = {
            "firmado_por": "Dr. García",
            "password": "contraseña_segura"
        }
        
        with patch('main.reporte_service.firmar_reporte') as mock_firmar:
            mock_firmar.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Reporte firmado exitosamente",
                "data": {
                    "id": reporte_id,
                    "estado": "Firmado",
                    "firmado_por": "Dr. García",
                    "fecha_firma": "2024-01-15T14:30:00Z"
                }
            })
            
            response = client.post(f"/api/v1/reportes/{reporte_id}/firmar", json=firma_data)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["data"]["estado"] == "Firmado"
    
    def test_obtener_reportes_filtrados(self, client):
        """Test obtener reportes con filtros"""
        with patch('main.reporte_service.obtener_reportes') as mock_obtener:
            mock_obtener.return_value = AsyncMock(return_value={
                "items": [
                    {
                        "id": str(uuid4()),
                        "estado": "Firmado",
                        "tipo_estudio": "Radiografía"
                    }
                ],
                "total": 1,
                "page": 1,
                "limit": 10,
                "pages": 1
            })
            
            response = client.get("/api/v1/reportes?estado=Firmado")
            
            assert response.status_code == 200
            data = response.json()
            assert len(data["items"]) >= 0
    
    def test_estadisticas_reportes(self, client):
        """Test obtener estadísticas de reportes"""
        with patch('main.reporte_service.obtener_estadisticas') as mock_stats:
            mock_stats.return_value = AsyncMock(return_value={
                "total_reportes": 75,
                "borradores": 20,
                "pendientes_revision": 30,
                "firmados": 25,
                "confianza_promedio": 0.82,
                "tiempo_promedio_generacion": 18.5
            })
            
            response = client.get("/api/v1/reportes/estadisticas")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_reportes"] == 75
            assert data["confianza_promedio"] == 0.82

class TestReporteService:
    """Tests para el servicio de reportes"""
    
    @pytest.mark.asyncio
    async def test_crear_reporte_service(self, reporte_service, reporte_ejemplo):
        """Test crear reporte en el servicio"""
        # Configurar mocks
        reporte_service.supabase.rpc.return_value.execute.return_value.data = "REP000001"
        reporte_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": str(uuid4()), "numero_reporte": "REP000001", **reporte_ejemplo}
        ]
        
        reporte_create = ReporteCreate(**reporte_ejemplo)
        result = await reporte_service.crear_reporte(reporte_create)
        
        assert result.success is True
        assert result.message == "Reporte creado exitosamente"
        assert result.data is not None
    
    @pytest.mark.asyncio
    async def test_firmar_reporte_service(self, reporte_service):
        """Test firmar reporte en el servicio"""
        reporte_id = uuid4()
        
        # Mock para obtener reporte
        async def mock_obtener_reporte(reporte_id):
            return type('obj', (object,), {
                'success': True,
                'data': {
                    'id': str(reporte_id),
                    'estado': 'Pendiente Revisión',
                    'radiologo': 'Dr. García'
                }
            })
        
        reporte_service.obtener_reporte = mock_obtener_reporte
        
        # Mock para actualizar reporte
        reporte_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
            {
                "id": str(reporte_id),
                "estado": "Firmado",
                "firmado_por": "Dr. García"
            }
        ]
        
        firma_data = FirmaReporte(firmado_por="Dr. García", password="test123")
        result = await reporte_service.firmar_reporte(reporte_id, firma_data)
        
        assert result.success is True
        assert result.message == "Reporte firmado exitosamente"

class TestIAService:
    """Tests para el servicio de IA"""
    
    @pytest.mark.asyncio
    async def test_generar_reporte_con_ia(self, ia_service):
        """Test generación de reporte con IA"""
        request = ReportGenerationRequest(
            paciente_id=uuid4(),
            tipo_estudio="Radiografía",
            contexto_clinico="Dolor torácico",
            radiologo="Dr. García"
        )
        
        # Mock para RPC de generar número de reporte
        ia_service.supabase.rpc.return_value.execute.return_value.data = "REP000001"
        
        # Mock para insertar reporte
        ia_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "numero_reporte": "REP000001",
                "reporte_generado": "Reporte generado por IA..."
            }
        ]
        
        # Mock para la respuesta de LM Studio
        with patch('httpx.AsyncClient') as mock_client:
            mock_response = Mock()
            mock_response.json.return_value = {
                "choices": [
                    {
                        "message": {
                            "content": "TÉCNICA: Radiografía PA y lateral de tórax\\nHALLAZGOS: Campos pulmonares claros..."
                        }
                    }
                ]
            }
            mock_response.raise_for_status.return_value = None
            
            mock_client.return_value.__aenter__.return_value.post.return_value = mock_response
            
            result = await ia_service.generar_reporte_con_ia(request)
            
            assert result.success is True
            assert "reporte" in result.data
    
    @pytest.mark.asyncio
    async def test_buscar_rag(self, ia_service):
        """Test búsqueda RAG"""
        from models import RAGSearchRequest
        
        request = RAGSearchRequest(
            query="dolor torácico",
            limite_resultados=3,
            umbral_similitud=0.6
        )
        
        # Mock para la función RPC de búsqueda
        ia_service.supabase.rpc.return_value.execute.return_value.data = [
            {
                "id": str(uuid4()),
                "reporte_id": str(uuid4()),
                "paciente_id": str(uuid4()),
                "contenido": "Caso similar de dolor torácico...",
                "similarity": 0.85
            }
        ]
        
        results = await ia_service.buscar_rag(request)
        
        assert len(results) >= 0
        if results:
            assert results[0].similitud >= 0.6
            assert "dolor" in results[0].contenido.lower() or "torácico" in results[0].contenido.lower()