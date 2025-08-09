# 🏥 Radix IA - Sistema Médico Inteligente

Un sistema completo de gestión médica con inteligencia artificial, diseñado para radiólogos y profesionales de la salud. Incluye gestión de pacientes, estudios médicos, reportes generados por IA y un chatbot médico especializado.

## 🚀 Características Principales

### 🤖 Chat IA Médico
- **Conversaciones en tiempo real** con IA especializada en medicina
- **Especialidades médicas**: Dermatología, Cardiología, Neurología, Radiología, etc.
- **Soporte para archivos**: Imágenes, videos, documentos médicos
- **Dictado por voz**: Reconocimiento de voz para consultas
- **Prompts especializados**: Sugerencias por especialidad médica
- **Búsqueda RAG**: Búsqueda semántica en historial médico

### 👥 Gestión de Pacientes
- **CRUD completo**: Crear, leer, actualizar, eliminar pacientes
- **Búsqueda avanzada**: Por nombre, ID, teléfono, edad, género
- **Estadísticas**: Total pacientes, nuevos este mes, seguimiento
- **Estados**: Activo, Inactivo, Seguimiento
- **Información completa**: Datos personales, contacto, condiciones médicas

### 📊 Estudios Médicos
- **Tipos de estudios**: Radiografía, Tomografía, RM, Ecografía, Mamografía, Densitometría
- **Estados**: Pendiente, En Proceso, Completado, Cancelado
- **Prioridades**: Normal, Urgente, Crítica
- **Archivos DICOM**: Subida y gestión de archivos médicos
- **Estadísticas**: Distribución por modalidad y estado

### 📋 Reportes Médicos con IA
- **Generación automática**: Reportes generados por IA
- **Streaming**: Respuestas en tiempo real
- **Confianza IA**: Métricas de confiabilidad
- **Estados**: Borrador, Pendiente Revisión, Firmado
- **Búsqueda RAG**: Búsqueda semántica en historial
- **Firma digital**: Proceso de firma de reportes

## 🏗️ Arquitectura del Sistema

### Frontend (Next.js)
- **Framework**: Next.js 15 con TypeScript
- **UI**: Tailwind CSS + Radix UI
- **Estado**: React Hooks
- **Temas**: Modo claro/oscuro
- **Responsive**: Diseño adaptativo

### Backend (FastAPI)
- **Framework**: FastAPI con Python
- **Base de datos**: Supabase (PostgreSQL)
- **IA**: LangChain + LM Studio
- **Embeddings**: Sentence Transformers
- **Streaming**: Server-Sent Events

### Base de Datos (Supabase)
- **PostgreSQL**: Base de datos principal
- **Vector Search**: Búsqueda semántica
- **RLS**: Row Level Security
- **Storage**: Archivos DICOM

## 📁 Estructura del Proyecto

```
prueba/
├── app/                    # Frontend Next.js
│   ├── chat/              # Chat IA Médico
│   ├── pacientes/         # Gestión de Pacientes
│   ├── estudios/          # Estudios Médicos
│   ├── reportes/          # Reportes Médicos
│   └── ...
├── components/            # Componentes React
│   ├── chat-ia-medico-page.tsx
│   ├── pacientes-page.tsx
│   ├── estudios-medicos-page.tsx
│   ├── reportes-page.tsx
│   └── ui/               # Componentes UI
├── backend/              # Backend FastAPI
│   ├── main.py           # Aplicación principal
│   ├── models.py         # Modelos Pydantic
│   ├── services.py       # Lógica de negocio
│   ├── database_setup.sql # Configuración BD
│   └── ...
├── lib/                  # Utilidades
│   └── api.ts           # Cliente API
└── README.md            # Este archivo
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd prueba
```

### 2. Configurar el Backend
```bash
cd backend

# Ejecutar script de configuración
python setup.py

# O configurar manualmente:
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variables de entorno
cp env.example .env
# Editar .env con tus credenciales

# Ejecutar el servidor
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Configurar Supabase
1. Crear proyecto en [Supabase](https://supabase.com)
2. Ejecutar `database_setup.sql` en SQL Editor
3. Obtener URL y Service Key
4. Configurar en `.env`

### 4. Configurar LM Studio (opcional)
1. Descargar [LM Studio](https://lmstudio.ai/)
2. Descargar modelo Llama 2 7B
3. Iniciar servidor en `http://localhost:1234`
4. Configurar en `.env`

### 5. Configurar el Frontend
```bash
# Instalar dependencias
pnpm install

# Configurar variables de entorno
echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000" > .env.local

# Ejecutar en desarrollo
pnpm dev
```

## 📡 Endpoints de la API

### Pacientes
```
POST   /api/v1/pacientes                    # Crear paciente
GET    /api/v1/pacientes                    # Listar pacientes
GET    /api/v1/pacientes/{id}               # Obtener paciente
PUT    /api/v1/pacientes/{id}               # Actualizar paciente
DELETE /api/v1/pacientes/{id}               # Eliminar paciente
GET    /api/v1/pacientes/estadisticas       # Estadísticas
```

### Estudios
```
POST   /api/v1/estudios                     # Crear estudio
GET    /api/v1/estudios                     # Listar estudios
GET    /api/v1/estudios/{id}                # Obtener estudio
PUT    /api/v1/estudios/{id}                # Actualizar estudio
POST   /api/v1/estudios/{id}/dicom          # Subir DICOM
GET    /api/v1/estudios/estadisticas        # Estadísticas
```

### Reportes
```
POST   /api/v1/reportes                     # Crear reporte
POST   /api/v1/reportes/generar             # Generar con IA (streaming)
POST   /api/v1/reportes/{id}/generar-ia     # Generar para estudio
GET    /api/v1/reportes                     # Listar reportes
GET    /api/v1/reportes/{id}                # Obtener reporte
PUT    /api/v1/reportes/{id}                # Actualizar reporte
POST   /api/v1/reportes/{id}/firmar         # Firmar reporte
GET    /api/v1/reportes/estadisticas        # Estadísticas
```

### Chat IA
```
POST   /api/v1/chat                         # Procesar mensaje
POST   /api/v1/chat/conversacion            # Guardar conversación
```

### Búsqueda RAG
```
GET    /api/v1/rag/buscar                   # Búsqueda semántica
```

## 🧪 Uso del Sistema

### 1. Chat IA Médico
- Acceder a `/chat`
- Seleccionar especialidad médica
- Escribir consulta o usar prompts sugeridos
- Adjuntar archivos si es necesario
- Recibir respuesta en tiempo real

### 2. Gestión de Pacientes
- Acceder a `/pacientes`
- Ver lista de pacientes con filtros
- Crear nuevo paciente
- Ver detalles completos
- Actualizar información

### 3. Estudios Médicos
- Acceder a `/estudios`
- Ver todos los estudios médicos
- Crear nuevo estudio
- Subir archivos DICOM
- Ver estadísticas por modalidad

### 4. Reportes Médicos
- Acceder a `/reportes`
- Ver reportes generados por IA
- Generar nuevo reporte
- Firmar reportes
- Ver métricas de confianza

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key-here

# TGI de Hugging Face (NUEVO)
TGI_URL=https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud
TGI_MULTIMODAL_URL=https://tu-endpoint-multimodal.us-east-1.aws.endpoints.huggingface.cloud

# LM Studio (compatibilidad temporal)
LM_STUDIO_URL=http://localhost:1234/v1

OPENAI_API_KEY=your-openai-api-key-here
HOST=127.0.0.1
PORT=8000
DEBUG=true
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

### Base de Datos
Ejecutar `backend/database_setup.sql` en Supabase SQL Editor para crear todas las tablas y datos de ejemplo.

### IA con TGI de Hugging Face
El sistema ahora usa TGI (Text Generation Inference) de Hugging Face con streaming avanzado:

**Para texto con streaming:**
```bash
curl -N https://dbrmcpr7fjvk2cz6.us-east-1.aws.endpoints.huggingface.cloud/v1/chat/completions \
-X POST \
-d '{
  "model": "tgi",
  "messages": [
    {
      "role": "user",
      "content": "me puedes explicar a detalle que es el paracetamol"
    }
  ],
  "stream": true,
  "temperature": 0.7,
  "max_tokens": 1024
}' \
-H "Content-Type: application/json"
```

**Formato de respuesta streaming (SSE):**
```
data: {"object":"chat.completion.chunk","choices":[{"delta":{"role":"assistant","content":"¡Claro"}}]}

data: {"object":"chat.completion.chunk","choices":[{"delta":{"content":" que"}}]}

data: {"object":"chat.completion.chunk","choices":[{"delta":{"content":" sí"}}]}

data: [DONE]
```

**Buffer Anti-Duplicación en Frontend:**
El chat implementa un sistema de buffer avanzado para evitar duplicación tipo "UnaUna vezVez":

```javascript
// Buffer para acumular fragmentos SSE
let buffer = "";

// Procesar solo mensajes completos (\n\n delimitados)
while ((boundaryIndex = buffer.indexOf('\n\n')) >= 0) {
  const messageChunk = buffer.slice(0, boundaryIndex);
  buffer = buffer.slice(boundaryIndex + 2);
  
  // Efecto máquina de escribir sin duplicación
  if (content) {
    lastMessage.contenido += content; // ✅ Aditivo, no reemplazo
  }
}
```

**Para análisis de imágenes DICOM:**
```bash
curl -X POST http://localhost:8000/api/v1/dicom/analizar-ia \
-H "Content-Type: application/json" \
-d '{
  "imagen_base64": "base64_de_imagen_dicom",
  "contexto_clinico": "Paciente con dolor torácico",
  "tipo_estudio": "Radiografía de tórax",
  "pregunta_especifica": "¿Hay signos de neumonía?"
}'
```

### IA Local (LM Studio) - Compatibilidad
Para mantener compatibilidad con LM Studio:
1. Descargar e instalar LM Studio
2. Descargar modelo Llama 2 7B
3. Iniciar servidor en puerto 1234
4. Configurar `LM_STUDIO_URL` en `.env`

## 📊 Documentación

- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **ReDoc**: http://localhost:8000/redoc
- **Frontend**: http://localhost:3000

## 🧪 Testing

### Backend
```bash
cd backend
pip install pytest pytest-asyncio httpx
pytest
```

### Frontend
```bash
pnpm test
```

## 🔒 Seguridad

### Para Producción
1. Configurar políticas RLS más restrictivas en Supabase
2. Implementar autenticación JWT
3. Configurar CORS apropiadamente
4. Usar HTTPS
5. Implementar rate limiting
6. Configurar backups automáticos

## 🚀 Despliegue

### Docker
```bash
# Backend
cd backend
docker build -t radix-backend .
docker run -p 8000:8000 radix-backend

# Frontend
docker build -t radix-frontend .
docker run -p 3000:3000 radix-frontend
```

### Vercel (Frontend)
```bash
pnpm build
vercel --prod
```

### Railway (Backend)
```bash
railway login
railway init
railway up
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte técnico o preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de la API en `/docs`

## 🔄 Roadmap

### v1.0.0 ✅
- ✅ Gestión completa de pacientes
- ✅ Gestión de estudios médicos
- ✅ Reportes generados por IA
- ✅ Chat IA médico
- ✅ Búsqueda RAG
- ✅ Subida de archivos DICOM
- ✅ Estadísticas y dashboard
- ✅ Documentación completa

### v1.1.0 🔄
- 🔄 Autenticación y autorización
- 🔄 Notificaciones en tiempo real
- 🔄 Integración con PACS
- 🔄 Análisis de imágenes con IA
- 🔄 Reportes automáticos
- 🔄 Integración con sistemas hospitalarios

### v2.0.0 📋
- 📋 Machine Learning avanzado
- 📋 Predicción de diagnósticos
- 📋 Integración con dispositivos médicos
- 📋 Telemedicina
- 📋 Móvil app
- 📋 Inteligencia artificial multimodal

## 🏆 Tecnologías Utilizadas

### Frontend
- **Next.js 15**: Framework React
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework CSS
- **Radix UI**: Componentes accesibles
- **Lucide React**: Iconos

### Backend
- **FastAPI**: Framework Python
- **Pydantic**: Validación de datos
- **LangChain**: Framework IA
- **Sentence Transformers**: Embeddings
- **Supabase**: Base de datos

### IA y ML
- **LM Studio**: IA local
- **OpenAI**: IA en la nube
- **Jina Embeddings**: Embeddings en español
- **RAG**: Búsqueda semántica

### Base de Datos
- **PostgreSQL**: Base de datos principal
- **pgvector**: Búsqueda vectorial
- **Row Level Security**: Seguridad

## 📈 Estadísticas del Proyecto

- **Líneas de código**: ~15,000
- **Componentes React**: 50+
- **Endpoints API**: 30+
- **Modelos de datos**: 20+
- **Especialidades médicas**: 6
- **Tipos de estudios**: 6

---

**Desarrollado con ❤️ para la comunidad médica**