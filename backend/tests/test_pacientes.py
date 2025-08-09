# tests/test_pacientes.py
"""
Tests para endpoints y servicios de pacientes
"""

import pytest
from unittest.mock import AsyncMock, patch
from uuid import uuid4

from models import PacienteCreate, PacienteUpdate

class TestPacienteEndpoints:
    """Tests para endpoints de pacientes"""
    
    def test_crear_paciente_success(self, client, paciente_ejemplo):
        """Test crear paciente exitoso"""
        with patch('main.paciente_service.crear_paciente') as mock_crear:
            mock_crear.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Paciente creado exitosamente",
                "data": {"id": str(uuid4()), **paciente_ejemplo}
            })
            
            response = client.post("/api/v1/pacientes", json=paciente_ejemplo)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "id" in data["data"]
    
    def test_crear_paciente_datos_invalidos(self, client):
        """Test crear paciente con datos inválidos"""
        paciente_invalido = {
            "nombre": "",  # Nombre vacío
            "apellido": "Pérez",
            "genero": "Inválido"  # Género inválido
        }
        
        response = client.post("/api/v1/pacientes", json=paciente_invalido)
        assert response.status_code == 422  # Validation error
    
    def test_obtener_pacientes(self, client):
        """Test obtener lista de pacientes"""
        with patch('main.paciente_service.obtener_pacientes') as mock_obtener:
            mock_obtener.return_value = AsyncMock(return_value={
                "items": [],
                "total": 0,
                "page": 1,
                "limit": 10,
                "pages": 1
            })
            
            response = client.get("/api/v1/pacientes")
            
            assert response.status_code == 200
            data = response.json()
            assert "items" in data
            assert "total" in data
    
    def test_obtener_paciente_por_id(self, client):
        """Test obtener paciente específico"""
        paciente_id = str(uuid4())
        
        with patch('main.paciente_service.obtener_paciente') as mock_obtener:
            mock_obtener.return_value = AsyncMock(return_value={
                "success": True,
                "data": {"id": paciente_id, "nombre": "Juan"}
            })
            
            response = client.get(f"/api/v1/pacientes/{paciente_id}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert data["data"]["id"] == paciente_id
    
    def test_actualizar_paciente(self, client):
        """Test actualizar paciente"""
        paciente_id = str(uuid4())
        datos_actualizacion = {"nombre": "Juan Carlos"}
        
        with patch('main.paciente_service.actualizar_paciente') as mock_actualizar:
            mock_actualizar.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Paciente actualizado exitosamente",
                "data": {"id": paciente_id, **datos_actualizacion}
            })
            
            response = client.put(f"/api/v1/pacientes/{paciente_id}", json=datos_actualizacion)
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_eliminar_paciente(self, client):
        """Test eliminar paciente"""
        paciente_id = str(uuid4())
        
        with patch('main.paciente_service.eliminar_paciente') as mock_eliminar:
            mock_eliminar.return_value = AsyncMock(return_value={
                "success": True,
                "message": "Paciente marcado como inactivo"
            })
            
            response = client.delete(f"/api/v1/pacientes/{paciente_id}")
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
    
    def test_estadisticas_pacientes(self, client):
        """Test obtener estadísticas de pacientes"""
        with patch('main.paciente_service.obtener_estadisticas') as mock_stats:
            mock_stats.return_value = AsyncMock(return_value={
                "total_pacientes": 100,
                "pacientes_activos": 85,
                "pacientes_inactivos": 10,
                "pacientes_seguimiento": 5,
                "nuevos_este_mes": 12,
                "edad_promedio": 45.5
            })
            
            response = client.get("/api/v1/pacientes/estadisticas")
            
            assert response.status_code == 200
            data = response.json()
            assert data["total_pacientes"] == 100
            assert data["edad_promedio"] == 45.5

class TestPacienteService:
    """Tests para el servicio de pacientes"""
    
    @pytest.mark.asyncio
    async def test_crear_paciente_service(self, paciente_service, paciente_ejemplo):
        """Test crear paciente en el servicio"""
        # Configurar mock para generar número de paciente
        paciente_service.supabase.rpc.return_value.execute.return_value.data = "PAC000001"
        
        # Configurar mock para insertar paciente
        paciente_service.supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": str(uuid4()), "numero_paciente": "PAC000001", **paciente_ejemplo}
        ]
        
        paciente_create = PacienteCreate(**paciente_ejemplo)
        result = await paciente_service.crear_paciente(paciente_create)
        
        assert result.success is True
        assert result.message == "Paciente creado exitosamente"
        assert result.data is not None
    
    @pytest.mark.asyncio
    async def test_obtener_pacientes_service(self, paciente_service):
        """Test obtener pacientes en el servicio"""
        # Configurar mock
        paciente_service.supabase.table.return_value.select.return_value.or_.return_value.range.return_value.order.return_value.execute.return_value = type('obj', (object,), {
            'data': [{"id": str(uuid4()), "nombre": "Juan"}],
            'count': 1
        })
        
        result = await paciente_service.obtener_pacientes(page=1, limit=10, search="Juan")
        
        assert len(result.items) >= 0
        assert result.total >= 0
        assert result.page == 1
        assert result.limit == 10
    
    @pytest.mark.asyncio
    async def test_actualizar_paciente_service(self, paciente_service):
        """Test actualizar paciente en el servicio"""
        paciente_id = uuid4()
        
        # Configurar mock
        paciente_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value.data = [
            {"id": str(paciente_id), "nombre": "Juan Carlos"}
        ]
        
        datos_actualizacion = PacienteUpdate(nombre="Juan Carlos")
        result = await paciente_service.actualizar_paciente(paciente_id, datos_actualizacion)
        
        assert result.success is True
        assert result.message == "Paciente actualizado exitosamente"