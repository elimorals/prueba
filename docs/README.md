# 📚 Documentación - Radix IA

Documentación completa del sistema médico Radix IA organizada por categorías.

## 📋 Tabla de Contenidos

- [📁 Estructura](#-estructura)
- [🔍 Guías por Categoría](#-guías-por-categoría)
- [📖 Documentación Principal](#-documentación-principal)
- [🚨 Troubleshooting](#-troubleshooting)

## 📁 Estructura

```
docs/
├── 📁 backend/                    # Documentación del backend
│   ├── CHAT_CONTEXT_INTEGRATION.md
│   ├── ORDENES_COMPRA_INTEGRATION.md
│   └── TGI_MIGRATION_SUMMARY.md
├── 📁 frontend/                   # Documentación del frontend
│   ├── UI_FIXES_SUMMARY.md
│   └── MOBILE_OPTIMIZATION_SUMMARY.md
├── 📁 deployment/                 # Guías de despliegue
│   └── deploy.md
├── 📁 troubleshooting/            # Solución de problemas
│   ├── SOLUCION_FINAL_CHAT.md
│   ├── SOLUCION_ERRORES_CHAT.md
│   └── RESUMEN_SOLUCION_CHAT.md
├── PROYECTO_COMPLETADO.md         # Resumen del proyecto
└── README.md                      # Este archivo
```

## 🔍 Guías por Categoría

### 🚀 Backend
Documentación relacionada con el backend FastAPI, base de datos y servicios.

#### [CHAT_CONTEXT_INTEGRATION.md](backend/CHAT_CONTEXT_INTEGRATION.md)
- Integración del sistema de chat IA
- Gestión de contexto conversacional
- Implementación de RAG
- Configuración de embeddings

#### [ORDENES_COMPRA_INTEGRATION.md](backend/ORDENES_COMPRA_INTEGRATION.md)
- Sistema de órdenes de compra
- Gestión de inventarios
- Integración con proveedores
- Workflow de aprobaciones

#### [TGI_MIGRATION_SUMMARY.md](backend/TGI_MIGRATION_SUMMARY.md)
- Migración a Hugging Face TGI
- Configuración de endpoints
- Optimización de rendimiento
- Comparación con LM Studio

### 🎨 Frontend
Documentación relacionada con la interfaz de usuario y componentes React.

#### [UI_FIXES_SUMMARY.md](frontend/UI_FIXES_SUMMARY.md)
- Correcciones de interfaz de usuario
- Mejoras de accesibilidad
- Optimización de componentes
- Resolución de bugs visuales

#### [MOBILE_OPTIMIZATION_SUMMARY.md](frontend/MOBILE_OPTIMIZATION_SUMMARY.md)
- Optimización para dispositivos móviles
- Responsive design
- Touch interactions
- Performance mobile

### 🚀 Deployment
Guías para el despliegue en diferentes plataformas.

#### [deploy.md](deployment/deploy.md)
- Despliegue en Vercel (Frontend)
- Despliegue en Railway (Backend)
- Configuración de variables de entorno
- Configuración de dominio

### 🚨 Troubleshooting
Guías para resolver problemas comunes.

#### [SOLUCION_FINAL_CHAT.md](troubleshooting/SOLUCION_FINAL_CHAT.md)
- Solución completa de problemas del chat IA
- Configuración de permisos de base de datos
- Resolución de errores 422
- Optimización de respuestas

#### [SOLUCION_ERRORES_CHAT.md](troubleshooting/SOLUCION_ERRORES_CHAT.md)
- Errores comunes del chat
- Diagnóstico de problemas
- Pasos de solución
- Verificación de configuraciones

#### [RESUMEN_SOLUCION_CHAT.md](troubleshooting/RESUMEN_SOLUCION_CHAT.md)
- Resumen ejecutivo de soluciones
- Checklist de verificación
- Estado actual del sistema
- Próximos pasos

## 📖 Documentación Principal

### [PROYECTO_COMPLETADO.md](PROYECTO_COMPLETADO.md)
Resumen completo del proyecto incluyendo:
- Estado actual de todas las funcionalidades
- Métricas de rendimiento
- Cobertura de tests
- Próximas mejoras

## 🚨 Troubleshooting Rápido

### Problemas Comunes

#### ❌ Chat IA no responde
1. Verificar que el backend esté corriendo
2. Revisar [SOLUCION_FINAL_CHAT.md](troubleshooting/SOLUCION_FINAL_CHAT.md)
3. Ejecutar tests de diagnóstico

#### ❌ Error de permisos de base de datos
1. Ejecutar script de permisos: `backend/fix_permissions_final.sql`
2. Verificar configuración de Supabase
3. Revisar variables de entorno

#### ❌ UI no se ve correctamente
1. Revisar [UI_FIXES_SUMMARY.md](frontend/UI_FIXES_SUMMARY.md)
2. Verificar configuración de Tailwind CSS
3. Limpiar caché del navegador

#### ❌ Problemas de despliegue
1. Revisar [deploy.md](deployment/deploy.md)
2. Verificar variables de entorno de producción
3. Revisar logs de la plataforma

## 🔍 Búsqueda Rápida

### Por Problema
- **Chat**: [SOLUCION_FINAL_CHAT.md](troubleshooting/SOLUCION_FINAL_CHAT.md)
- **UI**: [UI_FIXES_SUMMARY.md](frontend/UI_FIXES_SUMMARY.md)
- **Móvil**: [MOBILE_OPTIMIZATION_SUMMARY.md](frontend/MOBILE_OPTIMIZATION_SUMMARY.md)
- **Despliegue**: [deploy.md](deployment/deploy.md)

### Por Tecnología
- **Backend**: [backend/](backend/)
- **Frontend**: [frontend/](frontend/)
- **IA**: [TGI_MIGRATION_SUMMARY.md](backend/TGI_MIGRATION_SUMMARY.md)
- **Base de Datos**: [CHAT_CONTEXT_INTEGRATION.md](backend/CHAT_CONTEXT_INTEGRATION.md)

## 📈 Estado de la Documentación

### ✅ Completado
- [x] Guías de troubleshooting
- [x] Documentación de backend
- [x] Guías de despliegue
- [x] Optimización móvil

### 🚧 En Progreso
- [ ] Documentación de API completa
- [ ] Guías de contribución
- [ ] Tutoriales paso a paso
- [ ] Videos explicativos

### 📋 Pendiente
- [ ] Documentación de arquitectura detallada
- [ ] Guías de seguridad
- [ ] Documentación de testing
- [ ] Guías de performance

## 🤝 Contribución a la Documentación

### Cómo Contribuir
1. Identificar área de mejora
2. Crear rama para documentación
3. Escribir documentación clara
4. Incluir ejemplos prácticos
5. Actualizar este README

### Estándares
- Usar Markdown
- Incluir ejemplos de código
- Mantener estructura consistente
- Actualizar tabla de contenidos

---

**📚 Documentación Radix IA** - Conocimiento organizado para el éxito
