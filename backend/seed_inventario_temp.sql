-- Insertar item temporal para las órdenes de compra de demo
INSERT INTO inventarios (
    id,
    codigo_item,
    nombre_item,
    categoria,
    subcategoria,
    descripcion,
    unidad_medida,
    stock_actual,
    stock_minimo,
    stock_maximo,
    costo_unitario,
    proveedor,
    ubicacion_almacen,
    estado,
    requiere_receta
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'TEMP-DEMO-001',
    'Item Temporal para Demo',
    'Demo',
    'Temporal',
    'Item temporal para demostraciones y pruebas del sistema de órdenes de compra',
    'unidad',
    0,
    0,
    1000,
    1.00,
    'Proveedor Demo',
    'Almacén Principal',
    'Disponible',
    false
) ON CONFLICT (id) DO NOTHING;

-- También insertar algunos items adicionales para tener variedad
INSERT INTO inventarios (
    id,
    codigo_item,
    nombre_item,
    categoria,
    subcategoria,
    descripcion,
    unidad_medida,
    stock_actual,
    stock_minimo,
    stock_maximo,
    costo_unitario,
    proveedor,
    ubicacion_almacen,
    estado,
    requiere_receta
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    'MED-001',
    'Medicamento Demo',
    'Medicamentos',
    'Analgésicos',
    'Medicamento de demostración',
    'unidad',
    100,
    10,
    500,
    25.50,
    'Bayer Healthcare',
    'Farmacia',
    'Disponible',
    true
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    'SUP-001',
    'Suministro Demo',
    'Suministros',
    'Quirúrgicos',
    'Suministro médico de demostración',
    'caja',
    50,
    5,
    200,
    12.75,
    '3M Healthcare',
    'Almacén Principal',
    'Disponible',
    false
),
(
    '550e8400-e29b-41d4-a716-446655440003',
    'EQU-001',
    'Equipo Demo',
    'Equipos',
    'Diagnóstico',
    'Equipo médico de demostración',
    'unidad',
    5,
    1,
    10,
    1250.00,
    'Philips Medical',
    'Almacén de Equipos',
    'Disponible',
    false
)
ON CONFLICT (id) DO NOTHING;


