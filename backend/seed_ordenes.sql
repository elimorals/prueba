-- Insertar datos de ejemplo para órdenes de compra
-- Primero verificar que existan datos de inventario
INSERT INTO inventarios (codigo_item, nombre_item, categoria, descripcion, unidad_medida, stock_actual, stock_minimo, costo_unitario, proveedor, ubicacion_almacen) VALUES
('SYR001', 'Jeringas 20ml', 'Material Médico', 'Jeringas desechables estériles', 'unidad', 200, 50, 2.50, 'Bayer Healthcare', 'Almacén A'),
('AGU001', 'Agujas 21G', 'Material Médico', 'Agujas desechables calibre 21G', 'unidad', 500, 100, 1.25, 'Bayer Healthcare', 'Almacén A'),
('GLV001', 'Guantes Nitrilo Talla M', 'Protección', 'Guantes desechables nitrilo', 'caja', 25, 10, 24.75, '3M Healthcare', 'Almacén B'),
('MSK001', 'Mascarillas N95', 'Protección', 'Mascarillas de protección N95', 'unidad', 200, 50, 3.50, '3M Healthcare', 'Almacén B'),
('ELE001', 'Electrodos ECG', 'Equipo Médico', 'Electrodos para electrocardiograma', 'unidad', 500, 100, 2.30, 'Philips Medical', 'Almacén C'),
('CAB001', 'Cables de Monitoreo', 'Equipo Médico', 'Cables para equipos de monitoreo', 'unidad', 20, 5, 85.00, 'Philips Medical', 'Almacén C')
ON CONFLICT (codigo_item) DO NOTHING;

-- Insertar órdenes de compra
INSERT INTO ordenes_compra (numero_orden, proveedor, fecha_orden, fecha_entrega_esperada, estado, total_orden, iva, total_con_iva, solicitado_por, observaciones) VALUES
('OC-001', 'Bayer Healthcare', '2025-01-02', '2025-01-15', 'Pendiente', 875.00, 140.00, 1015.00, 'Dr. Carlos Mendoza', 'Urgente para procedimientos de la próxima semana'),
('OC-002', '3M Healthcare', '2025-01-01', '2025-01-10', 'Aprobada', 1937.50, 310.00, 2247.50, 'Enf. Ana Rodríguez', 'Reposición de stock de protección personal'),
('OC-003', 'Philips Medical', '2024-12-28', '2025-01-05', 'Recibida', 2850.00, 456.00, 3306.00, 'Téc. Miguel García', 'Mantenimiento preventivo de equipos'),
('OC-004', 'Kodak Medical', '2025-01-02', '2025-01-20', 'Cancelada', 4500.00, 720.00, 5220.00, 'Dr. Luis Pérez', 'Presupuesto excedido para este mes');

-- Insertar detalles de las órdenes
-- Orden OC-001 (Bayer Healthcare)
INSERT INTO orden_detalles (orden_id, item_id, cantidad, precio_unitario, subtotal) VALUES
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-001'), (SELECT id FROM inventarios WHERE codigo_item = 'SYR001'), 200, 2.50, 500.00),
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-001'), (SELECT id FROM inventarios WHERE codigo_item = 'AGU001'), 300, 1.25, 375.00);

-- Orden OC-002 (3M Healthcare)
INSERT INTO orden_detalles (orden_id, item_id, cantidad, precio_unitario, subtotal) VALUES
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-002'), (SELECT id FROM inventarios WHERE codigo_item = 'GLV001'), 50, 24.75, 1237.50),
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-002'), (SELECT id FROM inventarios WHERE codigo_item = 'MSK001'), 200, 3.50, 700.00);

-- Orden OC-003 (Philips Medical)
INSERT INTO orden_detalles (orden_id, item_id, cantidad, precio_unitario, subtotal, recibido, fecha_recepcion) VALUES
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-003'), (SELECT id FROM inventarios WHERE codigo_item = 'ELE001'), 500, 2.30, 1150.00, 500, '2025-01-05'),
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-003'), (SELECT id FROM inventarios WHERE codigo_item = 'CAB001'), 20, 85.00, 1700.00, 20, '2025-01-05');

-- Orden OC-004 (Kodak Medical) - cancelada, sin detalles recibidos
INSERT INTO orden_detalles (orden_id, item_id, cantidad, precio_unitario, subtotal) VALUES
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-004'), (SELECT id FROM inventarios WHERE codigo_item = 'SYR001'), 1000, 2.50, 2500.00),
((SELECT id FROM ordenes_compra WHERE numero_orden = 'OC-004'), (SELECT id FROM inventarios WHERE codigo_item = 'AGU001'), 1600, 1.25, 2000.00);

-- Verificar los datos insertados
SELECT 
    oc.numero_orden,
    oc.proveedor,
    oc.estado,
    oc.total_orden,
    COUNT(od.id) as items_count
FROM ordenes_compra oc
LEFT JOIN orden_detalles od ON oc.id = od.orden_id
GROUP BY oc.id, oc.numero_orden, oc.proveedor, oc.estado, oc.total_orden
ORDER BY oc.created_at DESC;
