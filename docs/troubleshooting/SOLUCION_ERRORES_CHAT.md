# 🔧 Solución a Errores del Chat IA

## ❌ **Problemas Identificados**

### **1. Error de Permisos en Base de Datos**
```
permission denied for schema public
```

### **2. Error al Crear Conversación**
```
No se pudo crear la conversación
```

## 🛠️ **Soluciones Paso a Paso**

### **Paso 1: Corregir Permisos en Supabase**

1. **Acceder al Dashboard de Supabase**
   - Ve a [supabase.com](https://supabase.com)
   - Inicia sesión y selecciona tu proyecto

2. **Ejecutar Script de Corrección**
   - Ve a **SQL Editor** en el panel lateral
   - Copia y pega el contenido del archivo `backend/fix_permissions.sql`
   - Ejecuta el script completo

3. **Verificar la Ejecución**
   - El script debería mostrar mensajes de éxito
   - Si hay errores, verifica que tienes permisos de administrador

### **Paso 2: Verificar Configuración de Variables de Entorno**

1. **Revisar archivo `.env`**
   ```bash
   cd backend
   cat .env
   ```

2. **Verificar que las variables estén correctas:**
   ```env
   SUPABASE_URL=https://tu-proyecto.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Asegurar que usas la Service Key, NO la Anon Key**

### **Paso 3: Ejecutar Diagnóstico**

1. **Ejecutar script de diagnóstico:**
   ```bash
   cd backend
   python fix_database_permissions.py
   ```

2. **Interpretar resultados:**
   - ✅ = Funcionando correctamente
   - ❌ = Necesita corrección

### **Paso 4: Reiniciar el Backend**

1. **Detener el servidor actual:**
   ```bash
   # Presiona Ctrl+C en la terminal donde corre el backend
   ```

2. **Reiniciar el servidor:**
   ```bash
   cd backend
   uvicorn main:app --reload --host 127.0.0.1 --port 8000
   ```

## 🔍 **Verificación de la Solución**

### **Test 1: Verificar Conexión a Base de Datos**
```bash
curl http://localhost:8000/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-XX..."
}
```

### **Test 2: Probar Endpoint de Chat**
```bash
curl -X POST http://localhost:8000/api/v1/chat \
  -H "Content-Type: application/json" \
  -H "X-User-ID: usuario_demo" \
  -d '{
    "mensaje": "Hola, ¿cómo estás?",
    "especialidad": "General"
  }'
```

**Respuesta esperada:**
```json
{
  "respuesta": "Hola! Soy un asistente médico...",
  "conversacion_id": "uuid-aqui",
  "confianza": 0.8,
  "tiempo_respuesta": 1.23,
  "modelo_usado": "tgi"
}
```

### **Test 3: Verificar desde el Frontend**
1. Abre el navegador en `http://localhost:3000`
2. Ve a la sección de Chat IA
3. Envía un mensaje de prueba
4. Verifica que recibes una respuesta

## 🚨 **Si los Problemas Persisten**

### **Opción 1: Recrear Tablas de Chat**
```sql
-- Ejecutar en Supabase SQL Editor
DROP TABLE IF EXISTS mensajes_chat CASCADE;
DROP TABLE IF EXISTS conversaciones_chat CASCADE;

-- Luego ejecutar el database_setup.sql completo
```

### **Opción 2: Verificar Políticas RLS**
```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversaciones_chat', 'mensajes_chat');
```

### **Opción 3: Resetear Permisos**
```sql
-- Otorgar todos los permisos al service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;
```

## 📋 **Logs de Depuración**

### **Backend con Logging Detallado**
El backend ahora incluye logging detallado. Busca estos mensajes en la consola:

```
🔍 Procesando mensaje de chat para usuario: usuario_demo
📝 Mensaje: Hola, ¿cómo estás?
🏥 Especialidad: General
🆕 Creando nueva conversación...
🔍 Intentando crear conversación: {...}
✅ Tabla conversaciones_chat accesible
📝 Datos preparados: {...}
✅ Conversación creada exitosamente: {...}
```

### **Errores Comunes y Soluciones**

| Error | Causa | Solución |
|-------|-------|----------|
| `permission denied for schema public` | Permisos de Supabase | Ejecutar `fix_permissions.sql` |
| `No se pudo crear la conversación` | Tabla no existe o sin permisos | Verificar tablas y políticas RLS |
| `relation "conversaciones_chat" does not exist` | Tabla no creada | Ejecutar `database_setup.sql` |
| `timeout` | Problema con TGI | Verificar `TGI_URL` en `.env` |

## 🎯 **Resultado Esperado**

Después de aplicar estas soluciones:

1. ✅ **Chat IA funciona correctamente**
2. ✅ **Se crean conversaciones sin errores**
3. ✅ **Los mensajes se guardan en la base de datos**
4. ✅ **Las respuestas de IA se generan correctamente**
5. ✅ **No hay errores de permisos en los logs**

## 📞 **Soporte Adicional**

Si los problemas persisten después de seguir estos pasos:

1. Revisa los logs del backend para errores específicos
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que Supabase esté funcionando correctamente
4. Considera recrear el proyecto de Supabase si es necesario
