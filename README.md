# 🏥 Radix IA - Sistema Médico Inteligente

Sistema integral de gestión médica con IA para análisis de imágenes, consultas médicas y gestión de pacientes.

## 📋 Tabla de Contenidos

- [🚀 Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [📦 Instalación](#-instalación)
- [⚙️ Configuración](#️-configuración)
- [🚀 Uso](#-uso)
- [🧪 Testing](#-testing)
- [📚 Documentación](#-documentación)
- [🔧 Troubleshooting](#-troubleshooting)
- [📈 Estado del Proyecto](#-estado-del-proyecto)

## 🚀 Características

### 🤖 IA Médica
- **Chat IA Médico**: Asistente inteligente para consultas médicas
- **Análisis DICOM**: Procesamiento de imágenes médicas
- **RAG (Retrieval Augmented Generation)**: Respuestas basadas en evidencia médica
- **Múltiples Especialidades**: Cardiología, Radiología, Neurología, etc.

### 📊 Gestión Médica
- **Pacientes**: Gestión completa de historiales médicos
- **Estudios Médicos**: Organización y seguimiento de estudios
- **Inventarios**: Control de equipamiento médico
- **Órdenes de Compra**: Gestión de adquisiciones
- **Reportes**: Análisis y estadísticas

### 🎨 Interfaz Moderna
- **UI Responsive**: Optimizada para móvil y desktop
- **Tema Oscuro/Claro**: Soporte completo de temas
- **Scroll Automático**: Experiencia fluida en el chat
- **Accesibilidad**: Diseño inclusivo

## 🏗️ Arquitectura

```
prueba/
├── 📁 app/                    # Next.js App Router
├── 📁 backend/               # FastAPI + PostgreSQL
├── 📁 components/            # React Components
├── 📁 docs/                  # Documentación organizada
├── 📁 tests/                 # Tests automatizados
├── 📁 styles/                # Estilos CSS
└── 📁 hooks/                 # React Hooks
```

### 🛠️ Stack Tecnológico

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn/ui

**Backend:**
- FastAPI (Python)
- PostgreSQL (Supabase)
- Hugging Face TGI
- Whisper Turbo

**IA/ML:**
- Text Generation Inference (TGI)
- Embeddings para RAG
- Transcripción de audio

## 📦 Instalación

### Prerrequisitos
- Node.js 18+
- Python 3.9+
- PostgreSQL (o Supabase)

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd prueba
```

### 2. Instalar dependencias Frontend
```bash
npm install
# o
pnpm install
```

### 3. Instalar dependencias Backend
```bash
cd backend
pip install -r requirements.txt
```

### 4. Configurar variables de entorno
```bash
cp backend/env_example.txt backend/.env
# Editar .env con tus credenciales
```

## ⚙️ Configuración

### Variables de Entorno Backend
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key
TGI_URL=your_tgi_endpoint
HF_API_KEY=your_huggingface_key
```

### Base de Datos
```bash
# Ejecutar en Supabase SQL Editor
cat backend/fix_permissions_final.sql
```

## 🚀 Uso

### Desarrollo Local

1. **Iniciar Backend:**
```bash
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

2. **Iniciar Frontend:**
```bash
npm run dev
# o
pnpm dev
```

3. **Acceder a la aplicación:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Funcionalidades Principales

#### 🤖 Chat IA Médico
- Envía consultas médicas
- Adjunta imágenes para análisis
- Usa transcripción de voz
- Selecciona especialidad médica

#### 📊 Gestión de Pacientes
- Crear y editar pacientes
- Ver historiales médicos
- Gestionar estudios

#### 🖼️ Análisis DICOM
- Subir imágenes médicas
- Análisis automático con IA
- Generación de reportes

## 🧪 Testing

### Tests Automatizados
```bash
# Tests del backend
cd backend
pytest

# Tests del frontend
npm run test

# Tests específicos
python tests/test_chat_endpoint.py
python tests/test_scroll_chat.py
```

### Tests Manuales
- [Test de Chat IA](tests/test_chat_simple.py)
- [Test de Scroll](tests/test_scroll_chat.py)
- [Test de TGI](tests/test_tgi_format.py)

## 📚 Documentación

### 📁 docs/
- **📁 backend/**: Documentación del backend
- **📁 frontend/**: Documentación del frontend  
- **📁 deployment/**: Guías de despliegue
- **📁 troubleshooting/**: Solución de problemas

### 📖 Guías Principales
- [Configuración de Base de Datos](docs/backend/database_setup.md)
- [Integración de Chat IA](docs/backend/CHAT_CONTEXT_INTEGRATION.md)
- [Optimización Móvil](docs/frontend/MOBILE_OPTIMIZATION_SUMMARY.md)
- [Despliegue](docs/deployment/deploy.md)

## 🔧 Troubleshooting

### Problemas Comunes

#### ❌ Error de Permisos de Base de Datos
```bash
# Solución: Ejecutar en Supabase
cat backend/fix_permissions_final.sql
```

#### ❌ Chat IA no responde
```bash
# Verificar backend
python tests/test_chat_endpoint.py
```

#### ❌ Scroll no funciona
```bash
# Verificar CSS
cat styles/chat-scrollbar.css
```

### 📋 Guías de Solución
- [Solución Completa de Chat](docs/troubleshooting/SOLUCION_FINAL_CHAT.md)
- [Errores Comunes](docs/troubleshooting/SOLUCION_ERRORES_CHAT.md)

## 📈 Estado del Proyecto

### ✅ Completado
- [x] Sistema de chat IA funcional
- [x] Gestión de pacientes
- [x] Análisis DICOM básico
- [x] UI responsive
- [x] Scroll automático
- [x] Base de datos configurada
- [x] Tests automatizados

### 🚧 En Desarrollo
- [ ] RAG avanzado
- [ ] Análisis de imágenes mejorado
- [ ] Reportes automáticos
- [ ] Integración con PACS

### 📋 Próximas Funcionalidades
- [ ] Telemedicina
- [ ] IA predictiva
- [ ] Integración con HIS
- [ ] Móvil nativo

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentación**: [docs/](docs/)
- **Email**: soporte@radix-ia.com

---

**🏥 Radix IA** - Transformando la medicina con inteligencia artificial