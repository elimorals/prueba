-- Crear tabla para gestión de personal médico
-- Script SQL para Supabase/PostgreSQL

CREATE TABLE IF NOT EXISTS personal_medico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_empleado VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    puesto VARCHAR(100) NOT NULL,
    departamento VARCHAR(50) NOT NULL CHECK (departamento IN ('Radiología', 'Enfermería', 'Administración', 'Laboratorio', 'Cardiología', 'Neurología', 'Ginecología')),
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    fecha_ingreso DATE NOT NULL,
    salario DECIMAL(10,2) NOT NULL CHECK (salario > 0),
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo' CHECK (estado IN ('Activo', 'Inactivo', 'Vacaciones', 'Licencia')),
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('Matutino', 'Vespertino', 'Nocturno', 'Rotativo')),
    especialidad VARCHAR(100) NOT NULL,
    cedula VARCHAR(50) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    contacto_emergencia VARCHAR(200) NOT NULL,
    ultima_actividad TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_personal_departamento ON personal_medico(departamento);
CREATE INDEX IF NOT EXISTS idx_personal_estado ON personal_medico(estado);
CREATE INDEX IF NOT EXISTS idx_personal_turno ON personal_medico(turno);
CREATE INDEX IF NOT EXISTS idx_personal_numero_empleado ON personal_medico(numero_empleado);
CREATE INDEX IF NOT EXISTS idx_personal_email ON personal_medico(email);
CREATE INDEX IF NOT EXISTS idx_personal_nombre_apellido ON personal_medico(nombre, apellido);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_personal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_personal_updated_at
    BEFORE UPDATE ON personal_medico
    FOR EACH ROW
    EXECUTE FUNCTION update_personal_updated_at();

-- Insertar datos de ejemplo
INSERT INTO personal_medico (
    numero_empleado, nombre, apellido, puesto, departamento, email, telefono,
    fecha_ingreso, salario, estado, turno, especialidad, cedula, direccion,
    contacto_emergencia, ultima_actividad
) VALUES 
(
    'EMP-00001',
    'Dr. Carlos',
    'Mendoza Ramírez',
    'Radiólogo Senior',
    'Radiología',
    'carlos.mendoza@hospital.com',
    '+52 55 1234-5678',
    '2020-03-15',
    85000.00,
    'Activo',
    'Matutino',
    'Radiología Intervencionista',
    '12345678',
    'Av. Reforma 123, CDMX',
    'Ana Mendoza - +52 55 9876-5432',
    NOW()
),
(
    'EMP-00002',
    'Enf. Ana',
    'Rodríguez López',
    'Enfermera Jefe',
    'Enfermería',
    'ana.rodriguez@hospital.com',
    '+52 55 2345-6789',
    '2019-08-22',
    45000.00,
    'Activo',
    'Vespertino',
    'Cuidados Intensivos',
    '87654321',
    'Col. Roma Norte, CDMX',
    'Luis Rodríguez - +52 55 8765-4321',
    NOW()
),
(
    'EMP-00003',
    'Téc. Miguel',
    'García Hernández',
    'Técnico Radiólogo',
    'Radiología',
    'miguel.garcia@hospital.com',
    '+52 55 3456-7890',
    '2021-11-10',
    35000.00,
    'Vacaciones',
    'Nocturno',
    'Tomografía',
    '11223344',
    'Polanco, CDMX',
    'María García - +52 55 7654-3210',
    NOW() - INTERVAL '13 days'
),
(
    'EMP-00004',
    'Adm. Laura',
    'Martínez Sánchez',
    'Coordinadora Administrativa',
    'Administración',
    'laura.martinez@hospital.com',
    '+52 55 4567-8901',
    '2018-05-03',
    55000.00,
    'Activo',
    'Matutino',
    'Gestión Hospitalaria',
    '55667788',
    'Coyoacán, CDMX',
    'Pedro Martínez - +52 55 6543-2109',
    NOW()
);

-- Configurar RLS (Row Level Security) si es necesario
-- ALTER TABLE personal_medico ENABLE ROW LEVEL SECURITY;

-- Comentarios en la tabla
COMMENT ON TABLE personal_medico IS 'Tabla para gestionar el personal médico y administrativo del hospital';
COMMENT ON COLUMN personal_medico.numero_empleado IS 'Número único de identificación del empleado';
COMMENT ON COLUMN personal_medico.ultima_actividad IS 'Timestamp de la última actividad registrada del empleado';
COMMENT ON COLUMN personal_medico.salario IS 'Salario mensual del empleado en pesos mexicanos';


