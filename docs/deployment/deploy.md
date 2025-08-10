# 🚀 Guía de Deployment - Radix IA

## 📊 Estado Actual
- ✅ **Frontend**: Listo para Vercel
- ✅ **Backend**: Listo para Railway/Render
- ✅ **Database**: Supabase (ya en cloud)
- ✅ **AI APIs**: Hugging Face (ya en cloud)

## 🎯 Plan de Deployment

### 1. 🏗️ Backend en Railway (Recomendado)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Desde la carpeta backend/
cd backend

# Login y setup
railway login
railway init
railway add

# Variables de entorno en Railway
railway variables set SUPABASE_URL="tu-supabase-url"
railway variables set SUPABASE_SERVICE_KEY="tu-service-key"
railway variables set TGI_URL="tu-tgi-endpoint"
railway variables set EMBEDDING_API_URL="https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud"

# Deploy
railway up
```

### 2. 🌐 Frontend en Vercel

```bash
# Desde la raíz del proyecto
npm install -g vercel

# Login
vercel login

# Deploy (primera vez)
vercel --prod

# Variables de entorno en Vercel Dashboard:
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. 🗄️ Base de Datos - Supabase

```sql
-- Ejecutar en Supabase SQL Editor:
-- 1. Migración de embeddings (si no se ha hecho)
\i backend/migrate_embeddings_1024.sql

-- 2. Verificar extensión vector
CREATE EXTENSION IF NOT EXISTS vector;

-- 3. Políticas RLS para producción
-- (Revisar y ajustar según necesidades)
```

## 🔧 Configuraciones Adicionales

### A. CORS en Backend (producción)
En `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tu-app.vercel.app",
        "https://tu-dominio.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### B. Variables de Entorno de Producción

#### Backend (.env en Railway):
```env
# Database
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# AI Services
TGI_URL=https://tu-tgi-endpoint.cloud
EMBEDDING_API_URL=https://fs7mn6r3tsu0su7q.us-east-1.aws.endpoints.huggingface.cloud

# Server Config
HOST=0.0.0.0
PORT=8000
DEBUG=false
```

#### Frontend (Vercel Dashboard):
```env
# Públicas
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Privadas
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## 🚦 Checklist Pre-Deploy

### Backend ✅
- [x] Dependencies optimizadas (sin sentence-transformers)
- [x] Dockerfile listo
- [x] API externa de embeddings configurada
- [x] Variables de entorno definidas
- [x] CORS configurado

### Frontend ✅
- [x] Build funciona (`npm run build`)
- [x] vercel.json configurado
- [x] next.config.mjs optimizado
- [x] Variables de entorno definidas
- [x] Mobile responsive

### Database ✅
- [x] Supabase configurado
- [x] Migración de embeddings lista
- [x] RLS policies revisadas

## 🔄 Pipeline de CI/CD (Opcional)

### GitHub Actions para auto-deploy:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        run: railway up --detach
        
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## 🎉 Post-Deploy

1. **Testing**: Probar todas las funcionalidades
2. **Monitoring**: Configurar logs y métricas
3. **Backup**: Configurar respaldos de BD
4. **Domain**: Configurar dominio personalizado
5. **SSL**: Verificar certificados (automático en Vercel/Railway)

## 🆘 Troubleshooting

### Errores Comunes:
- **Build failed**: Revisar dependencies en package.json
- **API errors**: Verificar variables de entorno
- **CORS errors**: Ajustar allowOrigins en backend
- **DB connection**: Verificar keys de Supabase

### Logs:
- **Backend**: `railway logs` o dashboard de Railway
- **Frontend**: Dashboard de Vercel
- **Database**: Supabase Dashboard → Logs