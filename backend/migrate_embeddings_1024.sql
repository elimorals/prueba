-- Migración para cambiar dimensiones de embeddings de 768 a 1024
-- Para usar con el modelo multilingual-e5-large-instruct-hxt

-- 1. Crear nueva tabla con vectores de 1024 dimensiones
CREATE TABLE IF NOT EXISTS reporte_embeddings_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    embedding vector(1024), -- Nuevo: 1024 dimensiones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Copiar índices si existen
CREATE INDEX IF NOT EXISTS idx_reporte_embeddings_new_reporte_id ON reporte_embeddings_new(reporte_id);
CREATE INDEX IF NOT EXISTS idx_reporte_embeddings_new_paciente_id ON reporte_embeddings_new(paciente_id);

-- 3. Crear nueva función de búsqueda con vectores de 1024
CREATE OR REPLACE FUNCTION match_report_embeddings_1024(
    query_embedding vector(1024),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    reporte_id uuid,
    paciente_id uuid,
    contenido text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        re.id,
        re.reporte_id,
        re.paciente_id,
        re.contenido,
        1 - (re.embedding <=> query_embedding) as similarity
    FROM reporte_embeddings_new re
    WHERE 1 - (re.embedding <=> query_embedding) > match_threshold
    ORDER BY re.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- 4. Comentarios y documentación
COMMENT ON TABLE reporte_embeddings_new IS 'Embeddings de reportes usando modelo multilingual-e5-large-instruct (1024 dimensiones)';
COMMENT ON FUNCTION match_report_embeddings_1024 IS 'Función para búsqueda semántica usando embeddings vectoriales de 1024 dimensiones';

-- 5. Script para renombrar las tablas (ejecutar después de verificar que todo funciona)
/*
-- IMPORTANTE: Ejecutar solo después de verificar que todo funciona correctamente

-- Respaldar tabla antigua
ALTER TABLE reporte_embeddings RENAME TO reporte_embeddings_768_backup;

-- Renombrar nueva tabla
ALTER TABLE reporte_embeddings_new RENAME TO reporte_embeddings;

-- Actualizar función principal
DROP FUNCTION IF EXISTS match_report_embeddings(vector(768), float, int);
CREATE OR REPLACE FUNCTION match_report_embeddings(
    query_embedding vector(1024),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE (
    id uuid,
    reporte_id uuid,
    paciente_id uuid,
    contenido text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        re.id,
        re.reporte_id,
        re.paciente_id,
        re.contenido,
        1 - (re.embedding <=> query_embedding) as similarity
    FROM reporte_embeddings re
    WHERE 1 - (re.embedding <=> query_embedding) > match_threshold
    ORDER BY re.embedding <=> query_embedding
    LIMIT match_count;
$$;
*/