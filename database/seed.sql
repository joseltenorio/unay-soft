-- =========================================================
-- Umarí OS - Seed Data
-- PostgreSQL / Supabase
-- =========================================================
-- Este archivo inserta data inicial válida para:
-- - Establecimiento
-- - Roles
-- - Usuarios
-- - Módulos y permisos
-- - Zonas y mesas
-- - Categorías, productos, variantes y adicionales
-- - Órdenes, items, pagos
-- - Caja
-- - QR
-- - Inventario
-- =========================================================

begin;

-- =========================================================
-- 1. Establecimiento
-- =========================================================

insert into establecimiento (
  id_establecimiento,
  nombre_comercial,
  razon_social,
  ruc,
  direccion,
  telefono,
  email,
  logo_url,
  igv_porcentaje,
  estado
)
values (
  '11111111-1111-1111-1111-111111111111',
  'Umarí',
  'UMARI RESTAURANTE S.A.C.',
  '20609876543',
  'Av. La Marina 1245, San Miguel, Lima, Perú',
  '+51 987 654 321',
  'contacto@umari.pe',
  '/assets/icons/logo-umari.svg',
  18.00,
  true
);

-- =========================================================
-- 2. Roles
-- =========================================================

insert into rol (
  id_rol,
  id_establecimiento,
  nombre,
  descripcion,
  estado
)
values
(
  '21111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Administrador',
  'Acceso total al sistema, configuración, usuarios, reportes y seguridad.',
  true
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Gerente',
  'Supervisa operaciones, caja, inventario, ventas y reportes.',
  true
),
(
  '23333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Cajero',
  'Gestiona pagos, apertura y cierre de caja.',
  true
),
(
  '24444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Mozo',
  'Registra pedidos, atiende mesas y consulta estado de órdenes.',
  true
),
(
  '25555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Cocina',
  'Gestiona preparación de pedidos mediante monitor KDS.',
  true
);

-- =========================================================
-- 3. Usuarios
-- =========================================================
-- IMPORTANTE:
-- password_hash de ejemplo.

insert into usuario (
  id_usuario,
  id_establecimiento,
  id_rol,
  nombres,
  apellidos,
  email,
  username,
  password_hash,
  celular,
  foto_url,
  estado,
  ultimo_acceso_at
)
values
(
  '31111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '21111111-1111-1111-1111-111111111111',
  'Jose Luis',
  'Administrador',
  'admin@umari.pe',
  'admin.umari',
  '$2b$10$kQw9lZ3yY8y8v1MGoWzB7e7Z0qQOqFyQWzqRHQEXAMPLEHASH01',
  '+51 999 111 111',
  null,
  true,
  now()
),
(
  '32222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'Valeria',
  'Ramírez Torres',
  'gerencia@umari.pe',
  'gerente.umari',
  '$2b$10$kQw9lZ3yY8y8v1MGoWzB7e7Z0qQOqFyQWzqRHQEXAMPLEHASH02',
  '+51 999 222 222',
  null,
  true,
  now() - interval '1 day'
),
(
  '33333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '23333333-3333-3333-3333-333333333333',
  'Marcos',
  'Salazar Peña',
  'caja@umari.pe',
  'cajero.umari',
  '$2b$10$kQw9lZ3yY8y8v1MGoWzB7e7Z0qQOqFyQWzqRHQEXAMPLEHASH03',
  '+51 999 333 333',
  null,
  true,
  now() - interval '2 hours'
),
(
  '34444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '24444444-4444-4444-4444-444444444444',
  'Lucía',
  'Mejía Vargas',
  'mozo@umari.pe',
  'mozo.umari',
  '$2b$10$kQw9lZ3yY8y8v1MGoWzB7e7Z0qQOqFyQWzqRHQEXAMPLEHASH04',
  '+51 999 444 444',
  null,
  true,
  now() - interval '30 minutes'
),
(
  '35555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '25555555-5555-5555-5555-555555555555',
  'Renato',
  'Cárdenas Soto',
  'cocina@umari.pe',
  'cocina.umari',
  '$2b$10$kQw9lZ3yY8y8v1MGoWzB7e7Z0qQOqFyQWzqRHQEXAMPLEHASH05',
  '+51 999 555 555',
  null,
  true,
  now() - interval '10 minutes'
);

-- =========================================================
-- 4. Módulos
-- =========================================================

insert into modulo (
  id_modulo,
  nombre,
  codigo,
  descripcion,
  ruta_frontend,
  icono,
  orden_display,
  estado
)
values
(
  '41111111-1111-1111-1111-111111111111',
  'Inicio',
  'inicio',
  'Página inicial informativa del sistema.',
  '/',
  'home',
  1,
  true
),
(
  '42222222-2222-2222-2222-222222222222',
  'Login',
  'login',
  'Acceso de usuarios al sistema.',
  '/login',
  'login',
  2,
  true
),
(
  '43333333-3333-3333-3333-333333333333',
  'Restablecer contraseña',
  'restore_password',
  'Recuperación de acceso por correo.',
  '/restore-password',
  'key',
  3,
  true
),
(
  '44444444-4444-4444-4444-444444444444',
  'Dashboard',
  'dashboard',
  'Panel principal de indicadores operativos.',
  '/dashboard',
  'dashboard',
  4,
  true
),
(
  '45555555-5555-5555-5555-555555555555',
  'Gestión de Salón',
  'pos',
  'Registro de pedidos, mesas y atención en salón.',
  '/dashboard/pos',
  'icon-pos.svg',
  5,
  true
),
(
  '46666666-6666-6666-6666-666666666666',
  'Monitor de Cocina',
  'kds',
  'Control de preparación y despacho de pedidos.',
  '/dashboard/kds',
  'icon-kds.svg',
  6,
  true
),
(
  '47777777-7777-7777-7777-777777777777',
  'Control de Insumos',
  'inventory',
  'Gestión de insumos, stock, movimientos y alertas.',
  '/dashboard/inventory',
  'icon-inventory.svg',
  7,
  true
),
(
  '48888888-8888-8888-8888-888888888888',
  'Caja y Pagos',
  'cashier',
  'Apertura, cierre de caja y registro de pagos.',
  '/dashboard/cashier',
  'cashier',
  8,
  true
),
(
  '49999999-9999-9999-9999-999999999999',
  'Business Intelligence',
  'bi',
  'Indicadores, reportes y análisis del negocio.',
  '/dashboard/bi',
  'icon-bi.svg',
  9,
  true
),
(
  '4aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Usuarios y Seguridad',
  'security',
  'Gestión de usuarios, roles y permisos.',
  '/dashboard/security',
  'shield',
  10,
  true
);
(
  '4bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'Establecimiento',
  'establishment',
  'Configuración fiscal, visual y operativa del establecimiento.',
  '/app/establishment',
  'store',
  11,
  true
)

-- =========================================================
-- 5. Permisos
-- =========================================================

insert into permiso (
  id_permiso,
  id_modulo,
  accion,
  codigo,
  descripcion,
  estado
)
values
-- Inicio / login
('51111111-1111-1111-1111-111111111111', '41111111-1111-1111-1111-111111111111', 'ver', 'inicio.ver', 'Permite visualizar la página inicial.', true),
('52222222-2222-2222-2222-222222222222', '42222222-2222-2222-2222-222222222222', 'acceder', 'login.acceder', 'Permite acceder al formulario de login.', true),
('53333333-3333-3333-3333-333333333333', '43333333-3333-3333-3333-333333333333', 'solicitar', 'restore_password.solicitar', 'Permite solicitar recuperación de contraseña.', true),

-- Dashboard
('54444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'ver', 'dashboard.ver', 'Permite visualizar el dashboard.', true),

-- POS
('55555555-5555-5555-5555-555555555555', '45555555-5555-5555-5555-555555555555', 'ver', 'pos.ver', 'Permite visualizar el módulo POS.', true),
('56666666-6666-6666-6666-666666666666', '45555555-5555-5555-5555-555555555555', 'crear_orden', 'pos.crear_orden', 'Permite registrar órdenes.', true),
('57777777-7777-7777-7777-777777777777', '45555555-5555-5555-5555-555555555555', 'actualizar_orden', 'pos.actualizar_orden', 'Permite actualizar órdenes.', true),
('58888888-8888-8888-8888-888888888888', '45555555-5555-5555-5555-555555555555', 'anular_orden', 'pos.anular_orden', 'Permite anular órdenes.', true),

-- KDS
('59999999-9999-9999-9999-999999999999', '46666666-6666-6666-6666-666666666666', 'ver', 'kds.ver', 'Permite visualizar pedidos en cocina.', true),
('5aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '46666666-6666-6666-6666-666666666666', 'actualizar_estado', 'kds.actualizar_estado', 'Permite actualizar estado de preparación.', true),

-- Inventario
('5bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '47777777-7777-7777-7777-777777777777', 'ver', 'inventory.ver', 'Permite visualizar inventario.', true),
('5ccccccc-cccc-cccc-cccc-cccccccccccc', '47777777-7777-7777-7777-777777777777', 'registrar_movimiento', 'inventory.registrar_movimiento', 'Permite registrar entradas, salidas y ajustes.', true),

-- Caja
('5ddddddd-dddd-dddd-dddd-dddddddddddd', '48888888-8888-8888-8888-888888888888', 'ver', 'cashier.ver', 'Permite visualizar caja.', true),
('5eeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '48888888-8888-8888-8888-888888888888', 'registrar_pago', 'cashier.registrar_pago', 'Permite registrar pagos.', true),
('5fffffff-ffff-ffff-ffff-ffffffffffff', '48888888-8888-8888-8888-888888888888', 'cerrar_caja', 'cashier.cerrar_caja', 'Permite cerrar caja.', true),

-- BI
('50000000-0000-0000-0000-000000000001', '49999999-9999-9999-9999-999999999999', 'ver', 'bi.ver', 'Permite visualizar reportes e indicadores.', true),

-- Seguridad
('50000000-0000-0000-0000-000000000002', '4aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'ver', 'security.ver', 'Permite visualizar seguridad.', true),
('50000000-0000-0000-0000-000000000003', '4aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'gestionar_usuarios', 'security.gestionar_usuarios', 'Permite crear, editar o desactivar usuarios.', true),
('50000000-0000-0000-0000-000000000004', '4aaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'gestionar_roles', 'security.gestionar_roles', 'Permite administrar roles y permisos.', true);

--Establecimiento
('5ab11111-1111-1111-1111-111111111111', '4bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ver', 'establishment.ver', 'Permite visualizar la configuración del establecimiento.', true),
('5ab22222-2222-2222-2222-222222222222', '4bbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'editar', 'establishment.editar', 'Permite editar datos fiscales, parámetros de venta e identidad visual del establecimiento.', true)

-- =========================================================
-- 6. Asignación de Permisos y Roles
-- =========================================================

-- Administrador: todos los permisos
insert into rol_permiso (id_rol, id_permiso)
select
  '21111111-1111-1111-1111-111111111111',
  id_permiso
from permiso;

-- Gerente: dashboard, POS, KDS, inventario, caja, BI
insert into rol_permiso (id_rol, id_permiso)
select
  '22222222-2222-2222-2222-222222222222',
  id_permiso
from permiso
where codigo in (
  'inicio.ver',
  'login.acceder',
  'restore_password.solicitar',
  'dashboard.ver',
  'pos.ver',
  'pos.crear_orden',
  'pos.actualizar_orden',
  'pos.anular_orden',
  'kds.ver',
  'kds.actualizar_estado',
  'inventory.ver',
  'inventory.registrar_movimiento',
  'cashier.ver',
  'cashier.registrar_pago',
  'cashier.cerrar_caja',
  'bi.ver'
);

-- Cajero: caja, pagos, consulta de órdenes
insert into rol_permiso (id_rol, id_permiso)
select
  '23333333-3333-3333-3333-333333333333',
  id_permiso
from permiso
where codigo in (
  'inicio.ver',
  'login.acceder',
  'dashboard.ver',
  'pos.ver',
  'cashier.ver',
  'cashier.registrar_pago',
  'cashier.cerrar_caja'
);

-- Mozo: POS
insert into rol_permiso (id_rol, id_permiso)
select
  '24444444-4444-4444-4444-444444444444',
  id_permiso
from permiso
where codigo in (
  'inicio.ver',
  'login.acceder',
  'dashboard.ver',
  'pos.ver',
  'pos.crear_orden',
  'pos.actualizar_orden'
);

-- Cocina: KDS
insert into rol_permiso (id_rol, id_permiso)
select
  '25555555-5555-5555-5555-555555555555',
  id_permiso
from permiso
where codigo in (
  'inicio.ver',
  'login.acceder',
  'dashboard.ver',
  'kds.ver',
  'kds.actualizar_estado'
);

-- =========================================================
-- 7. Zonas y Mesas 
-- =========================================================

insert into zona (
  id_zona,
  id_establecimiento,
  nombre,
  descripcion,
  capacidad,
  estado
)
values
(
  '61111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Salón Principal',
  'Zona central de atención para clientes.',
  40,
  true
),
(
  '62222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Terraza',
  'Espacio abierto para atención en exteriores.',
  20,
  true
),
(
  '63333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Barra',
  'Zona de atención rápida y bebidas.',
  10,
  true
);

insert into mesa (
  id_mesa,
  id_establecimiento,
  id_zona,
  numero,
  nombre,
  capacidad,
  disponibilidad,
  estado
)
values
('71111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '61111111-1111-1111-1111-111111111111', 1, 'Mesa 1', 4, 'OCUPADA', true),
('72222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', '61111111-1111-1111-1111-111111111111', 2, 'Mesa 2', 4, 'LIBRE', true),
('73333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', '61111111-1111-1111-1111-111111111111', 3, 'Mesa 3', 6, 'OCUPADA', true),
('74444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '62222222-2222-2222-2222-222222222222', 4, 'Mesa Terraza 1', 4, 'LIBRE', true),
('75555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '62222222-2222-2222-2222-222222222222', 5, 'Mesa Terraza 2', 2, 'RESERVADA', true),
('76666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', '63333333-3333-3333-3333-333333333333', 6, 'Barra 1', 2, 'LIBRE', true);

-- =========================================================
-- 8. Categorías y Productos
-- =========================================================

insert into categoria (
  id_categoria,
  id_establecimiento,
  nombre,
  descripcion,
  orden_display,
  estado
)
values
('81111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Ceviches', 'Preparaciones frescas a base de pescados y mariscos.', 1, true),
('82222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Arroces y calientes', 'Platos calientes de cocina marina.', 2, true),
('83333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Entradas', 'Platos ligeros y piqueos para compartir.', 3, true),
('84444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Bebidas', 'Bebidas frías, jugos y refrescos.', 4, true);

insert into producto (
  id_producto,
  id_establecimiento,
  id_categoria,
  nombre,
  descripcion,
  precio_base,
  imagen_referencial,
  disponibilidad,
  popularidad_score,
  estado
)
values
(
  '91111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '81111111-1111-1111-1111-111111111111',
  'Ceviche Clásico',
  'Pescado fresco, limón, ají limo, cebolla, camote y choclo.',
  38.00,
  '/assets/images/products/ceviche-clasico.jpg',
  true,
  95,
  true
),
(
  '92222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '81111111-1111-1111-1111-111111111111',
  'Ceviche Mixto',
  'Pescado y mariscos con leche de tigre tradicional.',
  46.00,
  '/assets/images/products/ceviche-mixto.jpg',
  true,
  90,
  true
),
(
  '93333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  '82222222-2222-2222-2222-222222222222',
  'Arroz con Mariscos',
  'Arroz norteño con mixtura de mariscos y salsa criolla.',
  48.00,
  '/assets/images/products/arroz-mariscos.jpg',
  true,
  88,
  true
),
(
  '94444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  '82222222-2222-2222-2222-222222222222',
  'Jalea Mixta',
  'Pescados y mariscos fritos acompañados con yuca y salsa tártara.',
  52.00,
  '/assets/images/products/jalea-mixta.jpg',
  true,
  84,
  true
),
(
  '95555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  '83333333-3333-3333-3333-333333333333',
  'Causa Acevichada',
  'Causa de papa amarilla con topping acevichado y crema especial.',
  32.00,
  '/assets/images/products/causa-acevichada.jpg',
  true,
  80,
  true
),
(
  '96666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '84444444-4444-4444-4444-444444444444',
  'Chicha Morada',
  'Bebida tradicional de maíz morado, piña y especias.',
  9.00,
  '/assets/images/products/chicha-morada.jpg',
  true,
  70,
  true
),
(
  '97777777-7777-7777-7777-777777777777',
  '11111111-1111-1111-1111-111111111111',
  '84444444-4444-4444-4444-444444444444',
  'Limonada Frozen',
  'Limonada helada preparada al momento.',
  12.00,
  '/assets/images/products/limonada-frozen.jpg',
  true,
  72,
  true
);

-- =========================================================
-- 9. Variantes
-- =========================================================

insert into variante_producto (
  id_variante,
  id_producto,
  nombre,
  descripcion,
  precio_adicional,
  disponibilidad,
  estado
)
values
(
  'a1111111-1111-1111-1111-111111111111',
  '91111111-1111-1111-1111-111111111111',
  'Personal',
  'Porción individual.',
  0.00,
  true,
  true
),
(
  'a2222222-2222-2222-2222-222222222222',
  '91111111-1111-1111-1111-111111111111',
  'Fuente para compartir',
  'Porción familiar para compartir.',
  34.00,
  true,
  true
),
(
  'a3333333-3333-3333-3333-333333333333',
  '93333333-3333-3333-3333-333333333333',
  'Personal',
  'Porción individual.',
  0.00,
  true,
  true
),
(
  'a4444444-4444-4444-4444-444444444444',
  '94444444-4444-4444-4444-444444444444',
  'Fuente grande',
  'Jalea grande para compartir.',
  28.00,
  true,
  true
);

-- =========================================================
-- 10. Adicionales y Etiquetas
-- =========================================================

insert into adicional (
  id_adicional,
  id_establecimiento,
  nombre,
  descripcion,
  precio,
  disponibilidad,
  estado
)
values
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Porción extra de camote', 'Acompañamiento adicional.', 5.00, true, true),
('b2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Porción extra de chifles', 'Acompañamiento crocante.', 6.00, true, true),
('b3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Leche de tigre adicional', 'Shot adicional de leche de tigre.', 8.00, true, true),
('b4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Ají especial', 'Salsa picante de la casa.', 3.00, true, true);

insert into etiqueta (
  id_etiqueta,
  nombre,
  tipo,
  color_etiqueta,
  estado
)
values
('c1111111-1111-1111-1111-111111111111', 'Más vendido', 'comercial', '#4B9C73', true),
('c2222222-2222-2222-2222-222222222222', 'Picante', 'sabor', '#C8524D', true),
('c3333333-3333-3333-3333-333333333333', 'Recomendado', 'comercial', '#D99C3B', true),
('c4444444-4444-4444-4444-444444444444', 'Nuevo', 'comercial', '#468189', true);

insert into producto_etiqueta (
  id_producto,
  id_etiqueta
)
values
('91111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111'),
('91111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333'),
('92222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222'),
('93333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333'),
('95555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444');

-- =========================================================
-- 11. Caja
-- =========================================================

insert into caja (
  id_caja,
  id_establecimiento,
  nombre,
  descripcion,
  estado
)
values
(
  'd1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Caja Principal',
  'Caja de atención principal del restaurante.',
  true
);

insert into apertura_caja (
  id_apertura,
  id_caja,
  id_usuario,
  monto_inicial,
  hora_apertura,
  observaciones,
  estado
)
values
(
  'd2222222-2222-2222-2222-222222222222',
  'd1111111-1111-1111-1111-111111111111',
  '33333333-3333-3333-3333-333333333333',
  350.00,
  now() - interval '6 hours',
  'Apertura de turno de almuerzo.',
  'ABIERTA'
);

-- =========================================================
-- 12. Órdenes
-- =========================================================

insert into orden (
  id_orden,
  id_mesa,
  id_usuario,
  numero_orden,
  estado,
  tipo_servicio,
  subtotal,
  igv,
  total,
  observaciones,
  abierta_at,
  cerrada_at
)
values
(
  'e1111111-1111-1111-1111-111111111111',
  '71111111-1111-1111-1111-111111111111',
  '34444444-4444-4444-4444-444444444444',
  'ORD-2026-0001',
  'EN_PREPARACION',
  'SALON',
  84.00,
  15.12,
  99.12,
  'Mesa solicita ají aparte.',
  now() - interval '25 minutes',
  null
),
(
  'e2222222-2222-2222-2222-222222222222',
  '73333333-3333-3333-3333-333333333333',
  '34444444-4444-4444-4444-444444444444',
  'ORD-2026-0002',
  'PAGADA',
  'SALON',
  100.00,
  18.00,
  118.00,
  'Cliente solicitó boleta electrónica.',
  now() - interval '1 hour',
  now() - interval '20 minutes'
),
(
  'e3333333-3333-3333-3333-333333333333',
  null,
  '34444444-4444-4444-4444-444444444444',
  'ORD-2026-0003',
  'LISTA',
  'PARA_LLEVAR',
  48.00,
  8.64,
  56.64,
  'Pedido para recoger en barra.',
  now() - interval '18 minutes',
  null
);

insert into item_orden (
  id_item_orden,
  id_orden,
  id_producto,
  id_variante,
  cantidad,
  precio_unitario,
  subtotal,
  notas_cocina,
  estado_cocina
)
values
(
  'f1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  '91111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  1,
  38.00,
  38.00,
  'Sin culantro.',
  'EN_PREPARACION'
),
(
  'f2222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  '92222222-2222-2222-2222-222222222222',
  null,
  1,
  46.00,
  46.00,
  'Picante medio.',
  'PENDIENTE'
),
(
  'f3333333-3333-3333-3333-333333333333',
  'e2222222-2222-2222-2222-222222222222',
  '94444444-4444-4444-4444-444444444444',
  null,
  1,
  52.00,
  52.00,
  'Bien crocante.',
  'ENTREGADO'
),
(
  'f4444444-4444-4444-4444-444444444444',
  'e2222222-2222-2222-2222-222222222222',
  '93333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  1,
  48.00,
  48.00,
  'Sin arvejas.',
  'ENTREGADO'
),
(
  'f5555555-5555-5555-5555-555555555555',
  'e3333333-3333-3333-3333-333333333333',
  '93333333-3333-3333-3333-333333333333',
  'a3333333-3333-3333-3333-333333333333',
  1,
  48.00,
  48.00,
  'Empacar para llevar.',
  'LISTO'
);

insert into item_orden_adicional (
  id_item_orden_adicional,
  id_item_orden,
  id_adicional,
  cantidad,
  precio_unitario,
  subtotal
)
values
(
  'fa111111-1111-1111-1111-111111111111',
  'f1111111-1111-1111-1111-111111111111',
  'b3333333-3333-3333-3333-333333333333',
  1,
  8.00,
  8.00
),
(
  'fa222222-2222-2222-2222-222222222222',
  'f2222222-2222-2222-2222-222222222222',
  'b4444444-4444-4444-4444-444444444444',
  1,
  3.00,
  3.00
);

-- =========================================================
-- 13. Pagos
-- =========================================================

insert into pago (
  id_pago,
  id_orden,
  id_usuario,
  metodo_pago,
  monto,
  referencia,
  estado
)
values
(
  'fb111111-1111-1111-1111-111111111111',
  'e2222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  'YAPE',
  118.00,
  'YAPE-UMARI-000245',
  'CONFIRMADO'
);

-- =========================================================
-- 14. Códigos QR
-- =========================================================

insert into codigo_qr (
  id_codigo_qr,
  id_establecimiento,
  id_mesa,
  tipo,
  url_destino,
  imagen_qr,
  estado
)
values
(
  'fc111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  null,
  'CARTA_GENERAL',
  'https://umari.pe/carta',
  '/assets/images/qr/carta-general.png',
  true
),
(
  'fc222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  '71111111-1111-1111-1111-111111111111',
  'MESA',
  'https://umari.pe/carta?mesa=1',
  '/assets/images/qr/mesa-1.png',
  true
);

-- =========================================================
-- 15. Inventario
-- =========================================================

insert into insumo (
  id_insumo,
  id_establecimiento,
  nombre,
  unidad_medida,
  stock_actual,
  stock_minimo,
  costo_unitario,
  estado
)
values
(
  'fd111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'Pescado fresco',
  'kg',
  22.500,
  8.000,
  24.00,
  true
),
(
  'fd222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Limón',
  'kg',
  18.000,
  6.000,
  5.50,
  true
),
(
  'fd333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'Cebolla roja',
  'kg',
  12.000,
  4.000,
  4.80,
  true
),
(
  'fd444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'Arroz',
  'kg',
  35.000,
  10.000,
  4.20,
  true
),
(
  'fd555555-5555-5555-5555-555555555555',
  '11111111-1111-1111-1111-111111111111',
  'Mariscos mixtos',
  'kg',
  14.000,
  5.000,
  32.00,
  true
),
(
  'fd666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  'Maíz morado',
  'kg',
  9.000,
  3.000,
  7.00,
  true
);

insert into producto_insumo (
  id_producto_insumo,
  id_producto,
  id_insumo,
  cantidad_requerida,
  unidad_medida
)
values
(
  'fe111111-1111-1111-1111-111111111111',
  '91111111-1111-1111-1111-111111111111',
  'fd111111-1111-1111-1111-111111111111',
  0.250,
  'kg'
),
(
  'fe222222-2222-2222-2222-222222222222',
  '91111111-1111-1111-1111-111111111111',
  'fd222222-2222-2222-2222-222222222222',
  0.120,
  'kg'
),
(
  'fe333333-3333-3333-3333-333333333333',
  '91111111-1111-1111-1111-111111111111',
  'fd333333-3333-3333-3333-333333333333',
  0.080,
  'kg'
),
(
  'fe444444-4444-4444-4444-444444444444',
  '92222222-2222-2222-2222-222222222222',
  'fd111111-1111-1111-1111-111111111111',
  0.200,
  'kg'
),
(
  'fe555555-5555-5555-5555-555555555555',
  '92222222-2222-2222-2222-222222222222',
  'fd555555-5555-5555-5555-555555555555',
  0.180,
  'kg'
),
(
  'fe666666-6666-6666-6666-666666666666',
  '93333333-3333-3333-3333-333333333333',
  'fd444444-4444-4444-4444-444444444444',
  0.200,
  'kg'
),
(
  'fe777777-7777-7777-7777-777777777777',
  '93333333-3333-3333-3333-333333333333',
  'fd555555-5555-5555-5555-555555555555',
  0.220,
  'kg'
),
(
  'fe888888-8888-8888-8888-888888888888',
  '96666666-6666-6666-6666-666666666666',
  'fd666666-6666-6666-6666-666666666666',
  0.080,
  'kg'
);

insert into movimiento_inventario (
  id_movimiento,
  id_insumo,
  id_usuario,
  tipo_movimiento,
  cantidad,
  motivo,
  referencia
)
values
(
  'ff111111-1111-1111-1111-111111111111',
  'fd111111-1111-1111-1111-111111111111',
  '32222222-2222-2222-2222-222222222222',
  'ENTRADA',
  20.000,
  'Compra diaria a proveedor.',
  'COMPRA-PESCADO-001'
),
(
  'ff222222-2222-2222-2222-222222222222',
  'fd222222-2222-2222-2222-222222222222',
  '32222222-2222-2222-2222-222222222222',
  'ENTRADA',
  15.000,
  'Reposición de insumo crítico.',
  'COMPRA-LIMON-001'
),
(
  'ff333333-3333-3333-3333-333333333333',
  'fd111111-1111-1111-1111-111111111111',
  '35555555-5555-5555-5555-555555555555',
  'SALIDA',
  1.250,
  'Consumo por producción de pedidos.',
  'ORDENES-TURNO-ALMUERZO'
),
(
  'ff444444-4444-4444-4444-444444444444',
  'fd555555-5555-5555-5555-555555555555',
  '35555555-5555-5555-5555-555555555555',
  'SALIDA',
  0.800,
  'Consumo por preparación de arroz con mariscos.',
  'ORD-2026-0002'
);

-- =========================================================
-- 16. Auditoría Inicial
-- =========================================================

insert into auditoria (
  id_auditoria,
  id_usuario,
  tabla_afectada,
  registro_id,
  accion,
  datos_anteriores,
  datos_nuevos,
  ip_origen,
  user_agent
)
values
(
  'ab111111-1111-1111-1111-111111111111',
  '31111111-1111-1111-1111-111111111111',
  'establecimiento',
  '11111111-1111-1111-1111-111111111111',
  'SEED_INICIAL',
  null,
  '{"mensaje": "Carga inicial de datos para Umarí OS"}'::jsonb,
  '127.0.0.1',
  'Supabase SQL Editor'
);

commit;