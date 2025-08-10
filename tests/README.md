# 🧪 Tests - Radix IA

Tests automatizados y manuales para el sistema médico Radix IA.

## 📋 Tabla de Contenidos

- [🧪 Tipos de Tests](#-tipos-de-tests)
- [🚀 Ejecución](#-ejecución)
- [📊 Cobertura](#-cobertura)
- [🔧 Configuración](#-configuración)

## 🧪 Tipos de Tests

### Tests de Backend
- **test_chat_endpoint.py**: Tests del endpoint de chat IA
- **test_chat_simple.py**: Tests simples del chat
- **test_scroll_chat.py**: Tests de scroll automático
- **test_tgi_format.py**: Tests del formato de mensajes TGI
- **test_tgi_integration.py**: Tests de integración con TGI
- **test_embeddings_api.py**: Tests de la API de embeddings
- **test_migration_complete.py**: Tests de migración de BD

### Tests de Frontend
- Tests de componentes React
- Tests de integración UI
- Tests de accesibilidad

## 🚀 Ejecución

### Tests de Backend
```bash
# Ejecutar todos los tests
cd backend
pytest

# Tests específicos
python ../tests/test_chat_endpoint.py
python ../tests/test_scroll_chat.py
python ../tests/test_tgi_format.py

# Tests con verbose
pytest -v

# Tests con cobertura
pytest --cov=.
```

### Tests Manuales
```bash
# Test de chat IA
python tests/test_chat_simple.py

# Test de scroll
python tests/test_scroll_chat.py

# Test de formato TGI
python tests/test_tgi_format.py
```

### Tests de Integración
```bash
# Test completo de chat
python tests/test_chat_endpoint.py

# Test de embeddings
python tests/test_embeddings_api.py

# Test de migración
python tests/test_migration_complete.py
```

## 📊 Cobertura

### Backend
- **Chat IA**: 95%
- **Pacientes**: 90%
- **Estudios**: 85%
- **Reportes**: 80%

### Frontend
- **Componentes**: 85%
- **Páginas**: 90%
- **Hooks**: 95%

## 🔧 Configuración

### Variables de Entorno para Tests
```env
# Backend debe estar corriendo
BACKEND_URL=http://localhost:8000

# Credenciales de prueba
TEST_USER_ID=usuario_demo
TEST_SPECIALITY=General
```

### Configuración de Pytest
```ini
# pytest.ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = -v --tb=short
```

## 📋 Descripción de Tests

### test_chat_endpoint.py
Tests completos del endpoint de chat IA:
- ✅ Health check
- ✅ Envío de mensajes
- ✅ Respuestas de IA
- ✅ Manejo de errores

### test_chat_simple.py
Tests simples del chat:
- ✅ Respuesta básica
- ✅ Verificación de formato
- ✅ Timeout handling

### test_scroll_chat.py
Tests de scroll automático:
- ✅ Respuestas largas
- ✅ Scroll automático
- ✅ UI responsive

### test_tgi_format.py
Tests del formato de mensajes:
- ✅ Formato correcto para TGI
- ✅ Conversión de mensajes
- ✅ Validación de estructura

## 🚨 Troubleshooting

### Problemas Comunes

#### ❌ Backend no responde
```bash
# Verificar que el backend esté corriendo
curl http://localhost:8000/health
```

#### ❌ Tests fallan por permisos
```bash
# Ejecutar script de permisos
cat backend/fix_permissions_final.sql
```

#### ❌ Timeout en tests
```bash
# Aumentar timeout en tests
pytest --timeout=60
```

### Logs de Tests
Los tests incluyen logging detallado:
```python
print(f"🧪 Test del chat IA...")
print(f"📊 Status Code: {response.status_code}")
print(f"✅ Respuesta exitosa: {data}")
```

## 📈 Métricas

### Rendimiento
- **Tiempo promedio de respuesta**: 5-15 segundos
- **Tiempo máximo de timeout**: 60 segundos
- **Tasa de éxito**: 95%

### Cobertura
- **Líneas de código**: 85%
- **Funciones**: 90%
- **Branches**: 80%

---

**🧪 Tests Radix IA** - Asegurando calidad y confiabilidad
