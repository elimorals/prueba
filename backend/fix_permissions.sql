-- Script para corregir permisos de base de datos en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- ===================================
-- VERIFICACIÓN DE TABLAS
-- ===================================

-- Verificar que las tablas existen
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ===================================
-- CORRECCIÓN DE PERMISOS
-- ===================================

-- Otorgar permisos completos al rol service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Otorgar permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- ===================================
-- POLÍTICAS RLS PARA CHAT
-- ===================================

-- Asegurar que las tablas de chat tienen RLS habilitado
ALTER TABLE conversaciones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Allow all for development" ON conversaciones_chat;
DROP POLICY IF EXISTS "Allow all for development" ON mensajes_chat;
DROP POLICY IF EXISTS "Enable all access" ON conversaciones_chat;
DROP POLICY IF EXISTS "Enable all access" ON mensajes_chat;

-- Crear políticas permisivas para desarrollo
CREATE POLICY "Allow all for development" ON conversaciones_chat 
FOR ALL USING (true);

CREATE POLICY "Allow all for development" ON mensajes_chat 
FOR ALL USING (true);

-- ===================================
-- VERIFICACIÓN DE PERMISOS
-- ===================================

-- Verificar permisos del rol service_role
SELECT 
    grantee, 
    table_name, 
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE grantee = 'service_role' 
AND table_schema = 'public'
AND table_name IN ('conversaciones_chat', 'mensajes_chat')
ORDER BY table_name, privilege_type;

-- Verificar políticas RLS
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('conversaciones_chat', 'mensajes_chat');

-- ===================================
-- TEST DE FUNCIONALIDAD
-- ===================================

-- Probar inserción en conversaciones_chat
DO $$
DECLARE
    test_id UUID;
BEGIN
    -- Insertar conversación de prueba
    INSERT INTO conversaciones_chat (titulo, especialidad, usuario, activa)
    VALUES ('Test Conversación', 'General', 'test_user', true)
    RETURNING id INTO test_id;
    
    RAISE NOTICE '✅ Conversación de prueba creada con ID: %', test_id;
    
    -- Insertar mensaje de prueba
    INSERT INTO mensajes_chat (conversacion_id, rol, contenido)
    VALUES (test_id, 'user', 'Test mensaje');
    
    RAISE NOTICE '✅ Mensaje de prueba creado';
    
    -- Limpiar datos de prueba
    DELETE FROM mensajes_chat WHERE conversacion_id = test_id;
    DELETE FROM conversaciones_chat WHERE id = test_id;
    
    RAISE NOTICE '✅ Datos de prueba limpiados';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en test: %', SQLERRM;
END $$;

-- ===================================
-- RESUMEN
-- ===================================

SELECT 
    'Permisos corregidos exitosamente' as status,
    COUNT(*) as tables_with_permissions
FROM information_schema.table_privileges 
WHERE grantee = 'service_role' 
AND table_schema = 'public'
AND privilege_type = 'INSERT';
