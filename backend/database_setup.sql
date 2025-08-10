-- Radix IA - Configuración de Base de Datos
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ===================================
-- TABLAS PRINCIPALES
-- ===================================

-- Tabla de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_paciente VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL CHECK (genero IN ('Masculino', 'Femenino', 'Otro')),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    numero_seguro VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Seguimiento')),
    condiciones_medicas TEXT[],
    alergias TEXT[],
    medicamentos_actuales TEXT[],
    contacto_emergencia JSONB,
    notas_adicionales TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Estudios Médicos
CREATE TABLE IF NOT EXISTS estudios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_estudio VARCHAR(30) UNIQUE NOT NULL,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo_estudio VARCHAR(50) NOT NULL CHECK (tipo_estudio IN ('Radiografía', 'Tomografía', 'RM', 'Ecografía', 'Mamografía', 'Densitometría')),
    fecha_estudio TIMESTAMP WITH TIME ZONE NOT NULL,
    modalidad VARCHAR(20) NOT NULL,
    area_anatomica VARCHAR(100) NOT NULL,
    indicacion_clinica TEXT NOT NULL,
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Completado', 'Cancelado')),
    prioridad VARCHAR(20) DEFAULT 'Normal' CHECK (prioridad IN ('Normal', 'Urgente', 'Crítica')),
    tecnico_responsable VARCHAR(100),
    medico_solicitante VARCHAR(100) NOT NULL,
    observaciones TEXT,
    archivos_dicom TEXT[],
    metadatos_dicom JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reportes Médicos
CREATE TABLE IF NOT EXISTS reportes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_reporte VARCHAR(30) UNIQUE NOT NULL,
    estudio_id UUID REFERENCES estudios(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    tipo_estudio VARCHAR(50) NOT NULL,
    fecha_reporte TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    radiologo VARCHAR(100) NOT NULL,
    estado VARCHAR(30) DEFAULT 'Borrador' CHECK (estado IN ('Borrador', 'Pendiente Revisión', 'Firmado')),
    confianza_ia DECIMAL(3,2) CHECK (confianza_ia >= 0 AND confianza_ia <= 1),
    
    -- Secciones del reporte
    tecnica TEXT,
    hallazgos TEXT NOT NULL,
    impresion_diagnostica TEXT NOT NULL,
    recomendaciones TEXT,
    reporte_generado TEXT,
    
    -- Metadatos
    tiempo_generacion INTEGER, -- en segundos
    modelo_ia_usado VARCHAR(100),
    version_modelo VARCHAR(20),
    
    -- Firma digital
    firmado_por VARCHAR(100),
    fecha_firma TIMESTAMP WITH TIME ZONE,
    hash_firma VARCHAR(256),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Conversaciones de Chat IA
CREATE TABLE IF NOT EXISTS conversaciones_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR(200) NOT NULL,
    especialidad VARCHAR(50) NOT NULL CHECK (especialidad IN ('General', 'Dermatología', 'Cardiología', 'Neurología', 'Radiología', 'Ginecología')),
    usuario VARCHAR(100) NOT NULL,
    activa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mensajes de Chat
CREATE TABLE IF NOT EXISTS mensajes_chat (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversacion_id UUID NOT NULL REFERENCES conversaciones_chat(id) ON DELETE CASCADE,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('user', 'assistant', 'system')),
    contenido TEXT NOT NULL,
    archivos_adjuntos TEXT[],
    metadatos JSONB,
    timestamp_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Embeddings para RAG
CREATE TABLE IF NOT EXISTS reporte_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    contenido TEXT NOT NULL,
    embedding vector(768), -- Jina embeddings v2
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Personal Médico
CREATE TABLE IF NOT EXISTS personal_medico (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_empleado VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    especialidad VARCHAR(100) NOT NULL,
    titulo VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    licencia_medica VARCHAR(50) UNIQUE,
    estado VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Licencia')),
    fecha_ingreso DATE NOT NULL,
    departamento VARCHAR(100),
    turno VARCHAR(20) CHECK (turno IN ('Mañana', 'Tarde', 'Noche', 'Rotativo')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Inventarios
CREATE TABLE IF NOT EXISTS inventarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_item VARCHAR(50) UNIQUE NOT NULL,
    nombre_item VARCHAR(200) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    subcategoria VARCHAR(100),
    descripcion TEXT,
    unidad_medida VARCHAR(20) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER NOT NULL DEFAULT 0,
    stock_maximo INTEGER,
    costo_unitario DECIMAL(10,2),
    proveedor VARCHAR(200),
    ubicacion_almacen VARCHAR(100),
    fecha_vencimiento DATE,
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Agotado', 'Vencido', 'Reservado')),
    requiere_receta BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Órdenes de Compra
CREATE TABLE IF NOT EXISTS ordenes_compra (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_orden VARCHAR(30) UNIQUE NOT NULL,
    proveedor VARCHAR(200) NOT NULL,
    fecha_orden DATE NOT NULL,
    fecha_entrega_esperada DATE,
    estado VARCHAR(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobada', 'Enviada', 'Recibida', 'Cancelada')),
    total_orden DECIMAL(12,2) NOT NULL,
    iva DECIMAL(12,2),
    total_con_iva DECIMAL(12,2),
    solicitado_por VARCHAR(100) NOT NULL,
    aprobado_por VARCHAR(100),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Detalles de Órdenes de Compra
CREATE TABLE IF NOT EXISTS orden_detalles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    orden_id UUID NOT NULL REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES inventarios(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    recibido INTEGER DEFAULT 0,
    fecha_recepcion DATE
);

-- ===================================
-- ÍNDICES PARA RENDIMIENTO
-- ===================================

-- Índices para pacientes
CREATE INDEX IF NOT EXISTS idx_pacientes_numero ON pacientes(numero_paciente);
CREATE INDEX IF NOT EXISTS idx_pacientes_estado ON pacientes(estado);
CREATE INDEX IF NOT EXISTS idx_pacientes_nombre ON pacientes(nombre, apellido);

-- Índices para estudios
CREATE INDEX IF NOT EXISTS idx_estudios_paciente ON estudios(paciente_id);
CREATE INDEX IF NOT EXISTS idx_estudios_fecha ON estudios(fecha_estudio);
CREATE INDEX IF NOT EXISTS idx_estudios_estado ON estudios(estado);
CREATE INDEX IF NOT EXISTS idx_estudios_tipo ON estudios(tipo_estudio);

-- Índices para reportes
CREATE INDEX IF NOT EXISTS idx_reportes_paciente ON reportes(paciente_id);
CREATE INDEX IF NOT EXISTS idx_reportes_estudio ON reportes(estudio_id);
CREATE INDEX IF NOT EXISTS idx_reportes_fecha ON reportes(fecha_reporte);
CREATE INDEX IF NOT EXISTS idx_reportes_estado ON reportes(estado);

-- Índices para chat
CREATE INDEX IF NOT EXISTS idx_chat_conversacion ON mensajes_chat(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_chat_timestamp ON mensajes_chat(timestamp_mensaje);

-- Índice vectorial para RAG
CREATE INDEX IF NOT EXISTS idx_embeddings_vector ON reporte_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Índices para inventarios
CREATE INDEX IF NOT EXISTS idx_inventarios_codigo ON inventarios(codigo_item);
CREATE INDEX IF NOT EXISTS idx_inventarios_categoria ON inventarios(categoria);
CREATE INDEX IF NOT EXISTS idx_inventarios_estado ON inventarios(estado);

-- ===================================
-- FUNCIONES DE BASE DE DATOS
-- ===================================

-- Función para búsqueda semántica de reportes
CREATE OR REPLACE FUNCTION match_report_embeddings(
    query_embedding vector(768),
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

-- Función para generar número de paciente automático
CREATE OR REPLACE FUNCTION generate_patient_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Obtener el siguiente número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_paciente FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM pacientes
    WHERE numero_paciente ~ '^PAC[0-9]+$';
    
    -- Formatear con ceros a la izquierda
    formatted_number := 'PAC' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de estudio automático
CREATE OR REPLACE FUNCTION generate_study_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_estudio FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM estudios
    WHERE numero_estudio ~ '^EST[0-9]+$';
    
    formatted_number := 'EST' || LPAD(next_number::TEXT, 8, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- Función para generar número de reporte automático
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    formatted_number TEXT;
BEGIN
    -- Obtener el siguiente número secuencial
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_reporte FROM 4) AS INTEGER)), 0) + 1
    INTO next_number
    FROM reportes
    WHERE numero_reporte ~ '^REP[0-9]+$';
    
    -- Formatear con ceros a la izquierda
    formatted_number := 'REP' || LPAD(next_number::TEXT, 8, '0');
    
    RETURN formatted_number;
END;
$$ LANGUAGE plpgsql;

-- ===================================
-- TRIGGERS
-- ===================================

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas principales (con manejo de existencia)
DROP TRIGGER IF EXISTS update_pacientes_updated_at ON pacientes;
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_estudios_updated_at ON estudios;
CREATE TRIGGER update_estudios_updated_at BEFORE UPDATE ON estudios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reportes_updated_at ON reportes;
CREATE TRIGGER update_reportes_updated_at BEFORE UPDATE ON reportes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_personal_updated_at ON personal_medico;
CREATE TRIGGER update_personal_updated_at BEFORE UPDATE ON personal_medico FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventarios_updated_at ON inventarios;
CREATE TRIGGER update_inventarios_updated_at BEFORE UPDATE ON inventarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ordenes_updated_at ON ordenes_compra;
CREATE TRIGGER update_ordenes_updated_at BEFORE UPDATE ON ordenes_compra FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- DATOS DE EJEMPLO
-- ===================================

-- Insertar datos de ejemplo para pacientes (DEBE IR PRIMERO)
INSERT INTO pacientes (numero_paciente, nombre, apellido, fecha_nacimiento, genero, telefono, email, direccion, numero_seguro, estado) VALUES
('PAC000001', 'María', 'García López', '1985-03-15', 'Femenino', '+34600111222', 'maria.garcia@email.com', 'Calle Mayor 123, Madrid', 'SS123456789', 'Activo'),
('PAC000002', 'Carlos', 'Rodríguez Silva', '1972-07-22', 'Masculino', '+34600333444', 'carlos.rodriguez@email.com', 'Avenida Central 456, Barcelona', 'SS987654321', 'Activo'),
('PAC000003', 'Ana', 'Martín Torres', '1990-11-08', 'Femenino', '+34600555666', 'ana.martin@email.com', 'Plaza España 789, Valencia', 'SS456789123', 'Activo');

-- Insertar datos de ejemplo para personal médico
INSERT INTO personal_medico (numero_empleado, nombre, apellido, especialidad, titulo, email, telefono, licencia_medica, fecha_ingreso, departamento, turno) VALUES
('EMP001', 'Dr. Juan', 'Pérez Sánchez', 'Radiología', 'Doctor en Medicina', 'juan.perez@hospital.com', '+34111222333', 'LIC001', '2023-01-10', 'Radiología', 'Mañana'),
('EMP002', 'Dra. Elena', 'Martínez Ruiz', 'Cardiología', 'Doctora en Medicina', 'elena.martinez@hospital.com', '+34444555666', 'LIC002', '2022-05-20', 'Cardiología', 'Tarde'),
('EMP003', 'Dr. Miguel', 'López Torres', 'Neurología', 'Doctor en Medicina', 'miguel.lopez@hospital.com', '+34777888999', 'LIC003', '2023-09-01', 'Neurología', 'Rotativo');

-- Insertar datos de ejemplo para estudios
INSERT INTO estudios (numero_estudio, paciente_id, tipo_estudio, fecha_estudio, modalidad, area_anatomica, indicacion_clinica, estado, prioridad, medico_solicitante) VALUES
('EST00000001', (SELECT id FROM pacientes WHERE numero_paciente = 'PAC000001'), 'Radiografía', '2024-01-15 10:30:00', 'RX', 'Tórax', 'Dolor torácico agudo', 'Completado', 'Urgente', 'Dr. Juan Pérez'),
('EST00000002', (SELECT id FROM pacientes WHERE numero_paciente = 'PAC000002'), 'Tomografía', '2024-01-16 14:15:00', 'TC', 'Abdomen', 'Dolor abdominal persistente', 'En Proceso', 'Normal', 'Dra. Elena Martínez'),
('EST00000003', (SELECT id FROM pacientes WHERE numero_paciente = 'PAC000003'), 'RM', '2024-01-17 09:00:00', 'RM', 'Cerebro', 'Cefaleas recurrentes', 'Pendiente', 'Normal', 'Dr. Miguel López');

-- Insertar datos de ejemplo para inventarios
INSERT INTO inventarios (codigo_item, nombre_item, categoria, descripcion, unidad_medida, stock_actual, stock_minimo, costo_unitario, proveedor, ubicacion_almacen) VALUES
('MED001', 'Contraste Yodado', 'Medicamentos', 'Contraste radiológico para TC', 'ml', 50, 10, 25.50, 'FarmaMed S.A.', 'Almacén A1'),
('EQU001', 'Guantes Látex', 'Equipamiento', 'Guantes desechables talla M', 'caja', 25, 5, 12.75, 'Suministros Médicos', 'Almacén B2'),
('RAD001', 'Película Radiográfica', 'Radiología', 'Película 35x43 cm', 'unidad', 100, 20, 8.90, 'RadiSupply', 'Almacén C3');

-- ===================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ===================================

-- Habilitar RLS en tablas sensibles
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudios ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversaciones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_medico ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE orden_detalles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reporte_embeddings ENABLE ROW LEVEL SECURITY;

-- Política básica para desarrollo (permitir todo)
-- En producción, implementar políticas más restrictivas
DROP POLICY IF EXISTS "Allow all for development" ON pacientes;
CREATE POLICY "Allow all for development" ON pacientes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON estudios;
CREATE POLICY "Allow all for development" ON estudios FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON reportes;
CREATE POLICY "Allow all for development" ON reportes FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON conversaciones_chat;
CREATE POLICY "Allow all for development" ON conversaciones_chat FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON mensajes_chat;
CREATE POLICY "Allow all for development" ON mensajes_chat FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON personal_medico;
CREATE POLICY "Allow all for development" ON personal_medico FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON inventarios;
CREATE POLICY "Allow all for development" ON inventarios FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON ordenes_compra;
CREATE POLICY "Allow all for development" ON ordenes_compra FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON orden_detalles;
CREATE POLICY "Allow all for development" ON orden_detalles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow all for development" ON reporte_embeddings;
CREATE POLICY "Allow all for development" ON reporte_embeddings FOR ALL USING (true);

-- Otorgar permisos explícitos al rol service_role
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Otorgar permisos para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;

-- ===================================
-- VISTAS ÚTILES
-- ===================================

-- Vista de estadísticas de pacientes
CREATE OR REPLACE VIEW v_estadisticas_pacientes AS
SELECT
    COUNT(*) as total_pacientes,
    COUNT(*) FILTER (WHERE estado = 'Activo') as pacientes_activos,
    COUNT(*) FILTER (WHERE estado = 'Inactivo') as pacientes_inactivos,
    COUNT(*) FILTER (WHERE estado = 'Seguimiento') as pacientes_seguimiento,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as nuevos_este_mes,
    ROUND(AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento))), 1) as edad_promedio
FROM pacientes;

-- Vista de estadísticas de estudios
CREATE OR REPLACE VIEW v_estadisticas_estudios AS
SELECT
    COUNT(*) as total_estudios,
    COUNT(*) FILTER (WHERE estado = 'Pendiente') as pendientes,
    COUNT(*) FILTER (WHERE estado = 'En Proceso') as en_proceso,
    COUNT(*) FILTER (WHERE estado = 'Completado') as completados,
    COUNT(*) FILTER (WHERE estado = 'Cancelado') as cancelados,
    COUNT(*) FILTER (WHERE prioridad = 'Crítica') as criticos,
    COUNT(*) FILTER (WHERE prioridad = 'Urgente') as urgentes,
    COUNT(*) FILTER (WHERE fecha_estudio >= CURRENT_DATE - INTERVAL '7 days') as esta_semana
FROM estudios;

-- Vista de resumen de reportes
CREATE OR REPLACE VIEW v_estadisticas_reportes AS
SELECT
    COUNT(*) as total_reportes,
    COUNT(*) FILTER (WHERE estado = 'Borrador') as borradores,
    COUNT(*) FILTER (WHERE estado = 'Pendiente Revisión') as pendientes_revision,
    COUNT(*) FILTER (WHERE estado = 'Firmado') as firmados,
    ROUND(AVG(confianza_ia), 3) as confianza_promedio,
    ROUND(AVG(tiempo_generacion), 1) as tiempo_promedio_generacion
FROM reportes;

-- ===================================
-- COMENTARIOS DE DOCUMENTACIÓN
-- ===================================

COMMENT ON TABLE pacientes IS 'Información completa de pacientes del sistema médico';
COMMENT ON TABLE estudios IS 'Estudios médicos realizados a pacientes';
COMMENT ON TABLE reportes IS 'Reportes médicos generados por IA con información estructurada';
COMMENT ON TABLE conversaciones_chat IS 'Conversaciones con el chatbot médico IA';
COMMENT ON TABLE mensajes_chat IS 'Mensajes individuales dentro de las conversaciones';
COMMENT ON TABLE reporte_embeddings IS 'Embeddings vectoriales para búsqueda semántica RAG';
COMMENT ON TABLE personal_medico IS 'Personal médico y administrativo del hospital';
COMMENT ON TABLE inventarios IS 'Inventario de medicamentos y suministros médicos';
COMMENT ON TABLE ordenes_compra IS 'Órdenes de compra para reposición de inventarios';

COMMENT ON FUNCTION match_report_embeddings IS 'Función para búsqueda semántica usando embeddings vectoriales';
COMMENT ON FUNCTION generate_patient_number IS 'Genera números de paciente secuenciales automáticamente';
COMMENT ON FUNCTION generate_study_number IS 'Genera números de estudio secuenciales automáticamente';

-- ===================================
-- FINALIZACIÓN
-- ===================================

-- Mostrar resumen de la configuración
DO $$
BEGIN
    RAISE NOTICE 'Base de datos Radix IA configurada exitosamente';
    RAISE NOTICE 'Tablas creadas: %, %, %, %, %, %, %, %, %', 
        'pacientes', 'estudios', 'reportes', 'conversaciones_chat', 
        'mensajes_chat', 'reporte_embeddings', 'personal_medico', 
        'inventarios', 'ordenes_compra';
    RAISE NOTICE 'Datos de ejemplo insertados para desarrollo';
    RAISE NOTICE 'Extensiones habilitadas: uuid-ossp, vector';
    RAISE NOTICE 'Listo para conectar con la aplicación FastAPI';
END $$;