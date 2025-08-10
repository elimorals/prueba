# 🚀 Backend - Radix IA

Backend FastAPI para el sistema médico Radix IA con integración de IA y gestión de base de datos.

## 📋 Tabla de Contenidos

- [🏗️ Arquitectura](#️-arquitectura)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🚀 Uso](#-uso)
- [🧪 Testing](#-testing)
- [📚 Documentación](#-documentación)

## 🏗️ Arquitectura

### Estructura del Proyecto
```
backend/
├── 📁 main.py                 # Aplicación FastAPI principal
├── 📁 models.py               # Modelos Pydantic
├── 📁 services.py             # Lógica de negocio
├── 📁 context_manager.py      # Gestión de contexto IA
├── 📁 database_setup.sql      # Configuración de BD
├── 📁 fix_permissions_final.sql # Script de permisos
├── 📁 requirements.txt        # Dependencias Python
├── 📁 tests/                  # Tests automatizados
└── 📁 env_example.txt         # Variables de entorno
```

### Stack Tecnológico
- **Framework**: FastAPI (Python)
- **Base de Datos**: PostgreSQL (Supabase)
- **IA**: Hugging Face TGI
- **Embeddings**: Sentence Transformers
- **Transcripción**: Whisper Turbo

## 📦 Instalación

### Prerrequisitos
- Python 3.9+
- PostgreSQL (o Supabase)
- pip

### 1. Instalar dependencias
```bash
pip install -r requirements.txt
```

### 2. Configurar variables de entorno
```bash
cp env_example.txt .env
# Editar .env con tus credenciales
```

### 3. Configurar base de datos
```bash
# Ejecutar en Supabase SQL Editor
cat fix_permissions_final.sql
```

## ⚙️ Configuración

### Variables de Entorno (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
TGI_URL=your_tgi_endpoint
HF_API_KEY=your_huggingface_key
HOST=127.0.0.1
PORT=8000
DEBUG=true
```

### Base de Datos
El sistema usa Supabase (PostgreSQL) con las siguientes tablas principales:
- `conversaciones_chat`: Conversaciones del chat IA
- `mensajes_chat`: Mensajes individuales
- `pacientes`: Información de pacientes
- `estudios_medicos`: Estudios médicos
- `reportes_embeddings`: Embeddings para RAG

## 🚀 Uso

### Desarrollo Local
```bash
# Iniciar servidor de desarrollo
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Con configuración personalizada
uvicorn main:app --reload --host 0.0.0.0 --port 8000 --log-level debug
```

### Producción
```bash
# Usando Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000

# Usando Docker
docker build -t radix-backend .
docker run -p 8000:8000 radix-backend
```

### Endpoints Principales

#### Chat IA
```
POST /api/v1/chat                    # Procesar mensaje de chat
GET  /health                         # Health check
```

#### Pacientes
```
GET    /api/v1/pacientes            # Listar pacientes
POST   /api/v1/pacientes            # Crear paciente
GET    /api/v1/pacientes/{id}       # Obtener paciente
PUT    /api/v1/pacientes/{id}       # Actualizar paciente
DELETE /api/v1/pacientes/{id}       # Eliminar paciente
```

#### Estudios Médicos
```
GET    /api/v1/estudios             # Listar estudios
POST   /api/v1/estudios             # Crear estudio
GET    /api/v1/estudios/{id}        # Obtener estudio
PUT    /api/v1/estudios/{id}        # Actualizar estudio
```

## 🧪 Testing

### Tests Automatizados
```bash
# Ejecutar todos los tests
pytest

# Tests con cobertura
pytest --cov=.

# Tests específicos
pytest tests/test_chat.py
pytest tests/test_pacientes.py
```

### Tests Manuales
```bash
# Test de endpoints
python ../tests/test_chat_endpoint.py
python ../tests/test_scroll_chat.py
```

### Health Check
```bash
curl http://localhost:8000/health
```

## 📚 Documentación

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Archivos Importantes
- [Configuración de BD](database_setup.sql)
- [Script de Permisos](fix_permissions_final.sql)
- [Modelos de Datos](models.py)
- [Servicios](services.py)

### Troubleshooting
- [Solución de Chat](../docs/troubleshooting/SOLUCION_FINAL_CHAT.md)
- [Errores Comunes](../docs/troubleshooting/SOLUCION_ERRORES_CHAT.md)

## 🔧 Desarrollo

### Estructura de Código

#### Models (models.py)
```python
class Paciente(BaseModel):
    id: Optional[UUID]
    nombre: str
    apellido: str
    # ... más campos
```

#### Services (services.py)
```python
class PacienteService:
    async def crear_paciente(self, paciente: PacienteCreate) -> Paciente:
        # Lógica de negocio
        pass
```

#### Context Manager (context_manager.py)
```python
class ContextManager:
    async def get_context_for_ai(self, conversation_id: UUID) -> List[ChatMessage]:
        # Gestión de contexto para IA
        pass
```

### Logging
El sistema incluye logging detallado para debugging:
```python
print(f"🔍 Procesando mensaje de chat para usuario: {user_id}")
print(f"✅ Conversación creada exitosamente: {conversacion}")
```

## 🚀 Despliegue

### Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Railway
```bash
railway login
railway init
railway up
```

### Variables de Entorno de Producción
```env
SUPABASE_URL=your_production_supabase_url
SUPABASE_SERVICE_KEY=your_production_service_key
TGI_URL=your_production_tgi_endpoint
DEBUG=false
```

---

**🏥 Backend Radix IA** - Potenciando la medicina con IA
