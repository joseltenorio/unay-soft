-- =========================================================
-- UMARI OS - DATABASE SCHEMA
-- PostgreSQL / Supabase
-- =========================================================

-- Extension for UUID generation
create extension if not exists "uuid-ossp";

-- =========================================================
-- Clean Start
-- =========================================================

drop table if exists movimiento_inventario cascade;
drop table if exists producto_insumo cascade;
drop table if exists insumo cascade;
drop table if exists codigo_qr cascade;
drop table if exists cierre_caja cascade;
drop table if exists apertura_caja cascade;
drop table if exists caja cascade;
drop table if exists pago cascade;
drop table if exists item_orden_adicional cascade;
drop table if exists orden_notificacion_servicio cascade;
drop table if exists item_orden cascade;
drop table if exists orden cascade;
drop table if exists producto_etiqueta cascade;
drop table if exists etiqueta cascade;
drop table if exists adicional cascade;
drop table if exists variante_producto cascade;
drop table if exists producto cascade;
drop table if exists categoria cascade;
drop table if exists mesa cascade;
drop table if exists zona cascade;
drop table if exists auditoria cascade;
drop table if exists password_reset_token cascade;
drop table if exists sesion_usuario cascade;
drop table if exists rol_permiso cascade;
drop table if exists permiso cascade;
drop table if exists modulo cascade;
drop table if exists usuario cascade;
drop table if exists rol cascade;
drop table if exists establecimiento cascade;

-- =========================================================
-- 1. Establecimiento
-- =========================================================

create table establecimiento (
  id_establecimiento uuid primary key default uuid_generate_v4(),
  nombre_comercial varchar(120) not null,
  razon_social varchar(160),
  ruc varchar(11),
  direccion text,
  telefono varchar(20),
  email varchar(120),
  logo_url text,
  igv_porcentaje numeric(5,2) not null default 18.00,
  moneda_codigo varchar(8) not null default 'PEN',
  moneda_simbolo varchar(8) not null default 'S/.',
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_establecimiento_ruc unique (ruc),
  constraint uq_establecimiento_email unique (email),
  constraint chk_establecimiento_igv check (igv_porcentaje >= 0),
  constraint chk_establecimiento_moneda_codigo check (length(trim(moneda_codigo)) > 0),
  constraint chk_establecimiento_moneda_simbolo check (length(trim(moneda_simbolo)) > 0)
);

-- =========================================================
-- 2. Seguridad: Usuarios, Roles, Permisos
-- =========================================================

create table rol (
  id_rol uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(60) not null,
  descripcion text,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_rol_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_rol_establecimiento_nombre
    unique (id_establecimiento, nombre)
);

create table usuario (
  id_usuario uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  id_rol uuid not null,
  nombres varchar(100) not null,
  apellidos varchar(100) not null,
  email varchar(120) not null,
  username varchar(60) not null,
  password_hash text not null,
  celular varchar(20),
  foto_url text,
  estado boolean not null default true,
  ultimo_acceso_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_usuario_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint fk_usuario_rol
    foreign key (id_rol)
    references rol(id_rol)
    on update cascade
    on delete restrict,

  constraint uq_usuario_email unique (email),
  constraint uq_usuario_username unique (username)
);

create table modulo (
  id_modulo uuid primary key default uuid_generate_v4(),
  nombre varchar(80) not null,
  codigo varchar(60) not null,
  descripcion text,
  ruta_frontend varchar(160),
  icono varchar(80),
  orden_display integer not null default 0,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_modulo_codigo unique (codigo)
);

create table permiso (
  id_permiso uuid primary key default uuid_generate_v4(),
  id_modulo uuid not null,
  accion varchar(60) not null,
  codigo varchar(80) not null,
  descripcion text,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_permiso_modulo
    foreign key (id_modulo)
    references modulo(id_modulo)
    on update cascade
    on delete restrict,

  constraint uq_permiso_codigo unique (codigo)
);

create table rol_permiso (
  id_rol_permiso uuid primary key default uuid_generate_v4(),
  id_rol uuid not null,
  id_permiso uuid not null,
  created_at timestamptz not null default now(),

  constraint fk_rol_permiso_rol
    foreign key (id_rol)
    references rol(id_rol)
    on update cascade
    on delete cascade,

  constraint fk_rol_permiso_permiso
    foreign key (id_permiso)
    references permiso(id_permiso)
    on update cascade
    on delete cascade,

  constraint uq_rol_permiso unique (id_rol, id_permiso)
);

create table sesion_usuario (
  id_sesion uuid primary key default uuid_generate_v4(),
  id_usuario uuid not null,
  refresh_token_hash text not null,
  ip_origen varchar(45),
  user_agent text,
  expira_at timestamptz not null,
  revocado_at timestamptz,
  created_at timestamptz not null default now(),

  constraint fk_sesion_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete cascade
);

create table password_reset_token (
  id_password_reset_token uuid primary key default uuid_generate_v4(),
  id_usuario uuid not null,
  token_hash text not null,
  expira_at timestamptz not null,
  usado_at timestamptz,
  created_at timestamptz not null default now(),

  constraint fk_password_reset_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete cascade
);

create table auditoria (
  id_auditoria uuid primary key default uuid_generate_v4(),
  id_usuario uuid,
  tabla_afectada varchar(80) not null,
  registro_id uuid,
  accion varchar(80) not null,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  ip_origen varchar(45),
  user_agent text,
  created_at timestamptz not null default now(),

  constraint fk_auditoria_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete set null
);

-- =========================================================
-- 3. Salon/ Mesas
-- =========================================================

create table zona (
  id_zona uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(80) not null,
  descripcion text,
  capacidad integer,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_zona_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_zona_nombre unique (id_establecimiento, nombre),
  constraint chk_zona_capacidad check (capacidad is null or capacidad >= 0)
);

create table mesa (
  id_mesa uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  id_zona uuid,
  numero integer not null,
  nombre varchar(80),
  capacidad integer not null default 4,
  disponibilidad varchar(30) not null default 'LIBRE',
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_mesa_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint fk_mesa_zona
    foreign key (id_zona)
    references zona(id_zona)
    on update cascade
    on delete set null,

  constraint uq_mesa_numero unique (id_establecimiento, numero),
  constraint chk_mesa_capacidad check (capacidad > 0),
  constraint chk_mesa_disponibilidad
    check (disponibilidad in ('LIBRE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO'))
);

-- =========================================================
-- 4. Carta / productos
-- =========================================================

create table categoria (
  id_categoria uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(80) not null,
  descripcion text,
  orden_display integer not null default 0,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_categoria_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_categoria_nombre unique (id_establecimiento, nombre)
);

create table producto (
  id_producto uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  id_categoria uuid not null,
  nombre varchar(120) not null,
  descripcion text,
  precio_base numeric(10,2) not null default 0,
  imagen_referencial text,
  disponibilidad boolean not null default true,
  popularidad_score integer not null default 0,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_producto_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint fk_producto_categoria
    foreign key (id_categoria)
    references categoria(id_categoria)
    on update cascade
    on delete restrict,

  constraint chk_producto_precio check (precio_base >= 0),
  constraint chk_producto_popularidad check (popularidad_score >= 0)
);

create table variante_producto (
  id_variante uuid primary key default uuid_generate_v4(),
  id_producto uuid not null,
  nombre varchar(80) not null,
  descripcion text,
  precio_adicional numeric(10,2) not null default 0,
  disponibilidad boolean not null default true,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_variante_producto
    foreign key (id_producto)
    references producto(id_producto)
    on update cascade
    on delete cascade,

  constraint uq_variante_producto_nombre unique (id_producto, nombre),
  constraint chk_variante_precio check (precio_adicional >= 0)
);

create table adicional (
  id_adicional uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(80) not null,
  descripcion text,
  precio numeric(10,2) not null default 0,
  disponibilidad boolean not null default true,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_adicional_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_adicional_nombre unique (id_establecimiento, nombre),
  constraint chk_adicional_precio check (precio >= 0)
);

create table etiqueta (
  id_etiqueta uuid primary key default uuid_generate_v4(),
  nombre varchar(80) not null,
  tipo varchar(60),
  color_etiqueta varchar(20),
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint uq_etiqueta_nombre unique (nombre)
);

create table producto_etiqueta (
  id_producto_etiqueta uuid primary key default uuid_generate_v4(),
  id_producto uuid not null,
  id_etiqueta uuid not null,
  created_at timestamptz not null default now(),

  constraint fk_producto_etiqueta_producto
    foreign key (id_producto)
    references producto(id_producto)
    on update cascade
    on delete cascade,

  constraint fk_producto_etiqueta_etiqueta
    foreign key (id_etiqueta)
    references etiqueta(id_etiqueta)
    on update cascade
    on delete cascade,

  constraint uq_producto_etiqueta unique (id_producto, id_etiqueta)
);

-- =========================================================
-- 5. Ordenes / Comandas
-- =========================================================

create table orden (
  id_orden uuid primary key default uuid_generate_v4(),
  id_mesa uuid,
  id_usuario uuid not null,
  numero_orden varchar(30) not null,
  estado varchar(30) not null default 'ABIERTA',
  tipo_servicio varchar(30) not null default 'SALON',
  subtotal numeric(10,2) not null default 0,
  igv numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  observaciones text,
  abierta_at timestamptz not null default now(),
  enviada_cocina_at timestamptz,
  preparacion_inicio_at timestamptz,
  lista_at timestamptz,
  entregada_at timestamptz,
  cerrada_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_orden_mesa
    foreign key (id_mesa)
    references mesa(id_mesa)
    on update cascade
    on delete set null,

  constraint fk_orden_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint uq_orden_numero unique (numero_orden),

  constraint chk_orden_estado
    check (estado in ('ABIERTA', 'EN_PREPARACION', 'LISTA', 'ENTREGADA', 'PAGADA', 'ANULADA')),

  constraint chk_orden_tipo_servicio
    check (tipo_servicio in ('SALON', 'PARA_LLEVAR', 'DELIVERY')),

  constraint chk_orden_montos
    check (subtotal >= 0 and igv >= 0 and total >= 0)
);

create table item_orden (
  id_item_orden uuid primary key default uuid_generate_v4(),
  id_orden uuid not null,
  id_producto uuid not null,
  id_variante uuid,
  cantidad integer not null default 1,
  precio_unitario numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  notas_cocina text,
  estado_cocina varchar(30) not null default 'PENDIENTE',
  preparacion_inicio_at timestamptz,
  listo_at timestamptz,
  entregado_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_item_orden_orden
    foreign key (id_orden)
    references orden(id_orden)
    on update cascade
    on delete cascade,

  constraint fk_item_orden_producto
    foreign key (id_producto)
    references producto(id_producto)
    on update cascade
    on delete restrict,

  constraint fk_item_orden_variante
    foreign key (id_variante)
    references variante_producto(id_variante)
    on update cascade
    on delete set null,

  constraint chk_item_orden_cantidad check (cantidad > 0),
  constraint chk_item_orden_montos check (precio_unitario >= 0 and subtotal >= 0),
  constraint chk_item_orden_estado_cocina
    check (estado_cocina in ('PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'ANULADO'))
);

create table orden_notificacion_servicio (
  id_notificacion uuid primary key default uuid_generate_v4(),
  id_orden uuid not null,
  tipo varchar(40) not null,
  motivo varchar(80),
  mensaje text,
  estado varchar(30) not null default 'PENDIENTE',
  creado_por uuid not null,
  atendido_por uuid,
  created_at timestamptz not null default now(),
  atendida_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint fk_notificacion_servicio_orden
    foreign key (id_orden)
    references orden(id_orden)
    on update cascade
    on delete cascade,

  constraint fk_notificacion_servicio_creado_por
    foreign key (creado_por)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint fk_notificacion_servicio_atendido_por
    foreign key (atendido_por)
    references usuario(id_usuario)
    on update cascade
    on delete set null,

  constraint chk_notificacion_servicio_tipo
    check (tipo in ('PEDIDO_LISTO', 'INCIDENCIA_COCINA')),

  constraint chk_notificacion_servicio_estado
    check (estado in ('PENDIENTE', 'ATENDIDA', 'CANCELADA')),

  constraint chk_notificacion_servicio_motivo
    check (
      tipo <> 'INCIDENCIA_COCINA'
      or motivo is not null
      or mensaje is not null
    )
);

create index idx_notificacion_servicio_orden
  on orden_notificacion_servicio(id_orden);

create index idx_notificacion_servicio_estado
  on orden_notificacion_servicio(estado);

create index idx_notificacion_servicio_tipo_estado
  on orden_notificacion_servicio(tipo, estado);

create unique index uq_notificacion_pedido_listo_pendiente
  on orden_notificacion_servicio(id_orden, tipo)
  where tipo = 'PEDIDO_LISTO'
    and estado = 'PENDIENTE';

create table item_orden_adicional (
  id_item_orden_adicional uuid primary key default uuid_generate_v4(),
  id_item_orden uuid not null,
  id_adicional uuid not null,
  cantidad integer not null default 1,
  precio_unitario numeric(10,2) not null default 0,
  subtotal numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),

  constraint fk_item_adicional_item
    foreign key (id_item_orden)
    references item_orden(id_item_orden)
    on update cascade
    on delete cascade,

  constraint fk_item_adicional_adicional
    foreign key (id_adicional)
    references adicional(id_adicional)
    on update cascade
    on delete restrict,

  constraint uq_item_adicional unique (id_item_orden, id_adicional),
  constraint chk_item_adicional_cantidad check (cantidad > 0),
  constraint chk_item_adicional_montos check (precio_unitario >= 0 and subtotal >= 0)
);

-- =========================================================
-- 6. Pagos / Caja
-- =========================================================

create table metodo_pago (
  id_metodo_pago uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(80) not null,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_metodo_pago_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_metodo_pago_nombre unique (id_establecimiento, nombre)
);

create table pago (
  id_pago uuid primary key default uuid_generate_v4(),
  id_orden uuid not null,
  id_usuario uuid not null,
  id_apertura uuid,
  id_metodo_pago uuid not null,
  monto numeric(10,2) not null,
  referencia varchar(120),
  estado varchar(30) not null default 'CONFIRMADO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_pago_orden
    foreign key (id_orden)
    references orden(id_orden)
    on update cascade
    on delete restrict,

  constraint fk_pago_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint fk_pago_apertura
    foreign key (id_apertura)
    references apertura_caja(id_apertura)
    on update cascade
    on delete restrict,

  constraint fk_pago_metodo_pago
    foreign key (id_metodo_pago)
    references metodo_pago(id_metodo_pago)
    on update cascade
    on delete restrict,

  constraint chk_pago_estado
    check (estado in ('PENDIENTE', 'CONFIRMADO', 'ANULADO')),

  constraint chk_pago_monto check (monto >= 0)
);

create table caja (
  id_caja uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(80) not null,
  descripcion text,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_caja_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_caja_nombre unique (id_establecimiento, nombre)
);

create table apertura_caja (
  id_apertura uuid primary key default uuid_generate_v4(),
  id_caja uuid not null,
  id_usuario uuid not null,
  monto_inicial numeric(10,2) not null default 0,
  hora_apertura timestamptz not null default now(),
  observaciones text,
  estado varchar(30) not null default 'ABIERTA',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_apertura_caja
    foreign key (id_caja)
    references caja(id_caja)
    on update cascade
    on delete restrict,

  constraint fk_apertura_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint chk_apertura_estado
    check (estado in ('ABIERTA', 'CERRADA', 'ANULADA')),

  constraint chk_apertura_monto check (monto_inicial >= 0)
);

create table cierre_caja (
  id_cierre_caja uuid primary key default uuid_generate_v4(),
  id_apertura uuid not null,
  id_usuario uuid not null,
  total_efectivo numeric(10,2) not null default 0,
  total_tarjeta numeric(10,2) not null default 0,
  total_yape numeric(10,2) not null default 0,
  total_plin numeric(10,2) not null default 0,
  total_transferencia numeric(10,2) not null default 0,
  total_otros numeric(10,2) not null default 0,
  total_sistema numeric(10,2) not null default 0,
  total_declarado numeric(10,2) not null default 0,
  diferencia numeric(10,2) not null default 0,
  hora_cierre timestamptz not null default now(),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_cierre_apertura
    foreign key (id_apertura)
    references apertura_caja(id_apertura)
    on update cascade
    on delete restrict,

  constraint fk_cierre_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint uq_cierre_apertura unique (id_apertura)
);

-- =========================================================
-- 7. QR
-- =========================================================

create table codigo_qr (
  id_codigo_qr uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  id_mesa uuid,
  tipo varchar(40) not null,
  url_destino text not null,
  imagen_qr text,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_qr_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint fk_qr_mesa
    foreign key (id_mesa)
    references mesa(id_mesa)
    on update cascade
    on delete set null,

  constraint chk_qr_tipo
    check (tipo in ('CARTA_GENERAL', 'MESA', 'PROMOCION'))
);

-- =========================================================
-- 8. Inventario
-- =========================================================

create table insumo (
  id_insumo uuid primary key default uuid_generate_v4(),
  id_establecimiento uuid not null,
  nombre varchar(100) not null,
  unidad_medida varchar(30) not null,
  stock_actual numeric(10,3) not null default 0,
  stock_minimo numeric(10,3) not null default 0,
  costo_unitario numeric(10,2) not null default 0,
  estado boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_insumo_establecimiento
    foreign key (id_establecimiento)
    references establecimiento(id_establecimiento)
    on update cascade
    on delete restrict,

  constraint uq_insumo_nombre unique (id_establecimiento, nombre),
  constraint chk_insumo_stock check (stock_actual >= 0 and stock_minimo >= 0 and costo_unitario >= 0)
);

create table producto_insumo (
  id_producto_insumo uuid primary key default uuid_generate_v4(),
  id_producto uuid not null,
  id_insumo uuid not null,
  cantidad_requerida numeric(10,3) not null,
  unidad_medida varchar(30) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint fk_producto_insumo_producto
    foreign key (id_producto)
    references producto(id_producto)
    on update cascade
    on delete cascade,

  constraint fk_producto_insumo_insumo
    foreign key (id_insumo)
    references insumo(id_insumo)
    on update cascade
    on delete restrict,

  constraint uq_producto_insumo unique (id_producto, id_insumo),
  constraint chk_producto_insumo_cantidad check (cantidad_requerida > 0)
);

create table movimiento_inventario (
  id_movimiento uuid primary key default uuid_generate_v4(),
  id_insumo uuid not null,
  id_usuario uuid not null,
  tipo_movimiento varchar(30) not null,
  cantidad numeric(10,3) not null,
  motivo text,
  referencia varchar(120),
  created_at timestamptz not null default now(),

  constraint fk_movimiento_insumo
    foreign key (id_insumo)
    references insumo(id_insumo)
    on update cascade
    on delete restrict,

  constraint fk_movimiento_usuario
    foreign key (id_usuario)
    references usuario(id_usuario)
    on update cascade
    on delete restrict,

  constraint chk_movimiento_tipo
    check (tipo_movimiento in ('ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA')),

  constraint chk_movimiento_cantidad check (cantidad > 0)
);

-- =========================================================
-- 9. Indexes para optimización
-- =========================================================

create index idx_usuario_establecimiento on usuario(id_establecimiento);
create index idx_usuario_rol on usuario(id_rol);

create index idx_permiso_modulo on permiso(id_modulo);
create index idx_rol_permiso_rol on rol_permiso(id_rol);
create index idx_rol_permiso_permiso on rol_permiso(id_permiso);

create index idx_mesa_establecimiento on mesa(id_establecimiento);
create index idx_producto_categoria on producto(id_categoria);
create index idx_producto_establecimiento on producto(id_establecimiento);

create index idx_orden_usuario on orden(id_usuario);
create index idx_orden_mesa on orden(id_mesa);
create index idx_orden_estado on orden(estado);
create index idx_orden_enviada_cocina_at on orden(enviada_cocina_at);
create index idx_orden_preparacion_inicio_at on orden(preparacion_inicio_at);
create index idx_orden_lista_at on orden(lista_at);

create index idx_item_orden_orden on item_orden(id_orden);
create index idx_item_orden_estado_cocina on item_orden(estado_cocina);
create index idx_pago_orden on pago(id_orden);
create index idx_pago_apertura on pago(id_apertura);
create index idx_pago_metodo_pago on pago(id_metodo_pago);

create index idx_metodo_pago_establecimiento on metodo_pago(id_establecimiento);

create index idx_insumo_establecimiento on insumo(id_establecimiento);
create index idx_movimiento_insumo on movimiento_inventario(id_insumo);

-- =========================================================
-- 10. UPDATED_AT Automatico
-- =========================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_establecimiento_updated_at
before update on establecimiento
for each row execute function set_updated_at();

create trigger trg_rol_updated_at
before update on rol
for each row execute function set_updated_at();

create trigger trg_usuario_updated_at
before update on usuario
for each row execute function set_updated_at();

create trigger trg_modulo_updated_at
before update on modulo
for each row execute function set_updated_at();

create trigger trg_permiso_updated_at
before update on permiso
for each row execute function set_updated_at();

create trigger trg_zona_updated_at
before update on zona
for each row execute function set_updated_at();

create trigger trg_mesa_updated_at
before update on mesa
for each row execute function set_updated_at();

create trigger trg_categoria_updated_at
before update on categoria
for each row execute function set_updated_at();

create trigger trg_producto_updated_at
before update on producto
for each row execute function set_updated_at();

create trigger trg_variante_producto_updated_at
before update on variante_producto
for each row execute function set_updated_at();

create trigger trg_adicional_updated_at
before update on adicional
for each row execute function set_updated_at();

create trigger trg_etiqueta_updated_at
before update on etiqueta
for each row execute function set_updated_at();

create trigger trg_orden_updated_at
before update on orden
for each row execute function set_updated_at();

create trigger trg_item_orden_updated_at
before update on item_orden
for each row execute function set_updated_at();

create trigger trg_pago_updated_at
before update on pago
for each row execute function set_updated_at();

create trigger trg_metodo_pago_updated_at
before update on metodo_pago
for each row execute function set_updated_at();

create trigger trg_caja_updated_at
before update on caja
for each row execute function set_updated_at();

create trigger trg_apertura_caja_updated_at
before update on apertura_caja
for each row execute function set_updated_at();

create trigger trg_cierre_caja_updated_at
before update on cierre_caja
for each row execute function set_updated_at();

create trigger trg_codigo_qr_updated_at
before update on codigo_qr
for each row execute function set_updated_at();

create trigger trg_insumo_updated_at
before update on insumo
for each row execute function set_updated_at();

create trigger trg_producto_insumo_updated_at
before update on producto_insumo
for each row execute function set_updated_at();