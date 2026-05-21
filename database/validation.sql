-- =========================================================
-- Umarí OS - Database Validation Queries
-- PostgreSQL / Supabase
-- =========================================================

-- Conteo general de registros por tabla principal
select 'establecimiento' as tabla, count(*) as registros from establecimiento
union all
select 'rol', count(*) from rol
union all
select 'usuario', count(*) from usuario
union all
select 'modulo', count(*) from modulo
union all
select 'permiso', count(*) from permiso
union all
select 'rol_permiso', count(*) from rol_permiso
union all
select 'zona', count(*) from zona
union all
select 'mesa', count(*) from mesa
union all
select 'categoria', count(*) from categoria
union all
select 'producto', count(*) from producto
union all
select 'orden', count(*) from orden
union all
select 'item_orden', count(*) from item_orden
union all
select 'orden_notificacion_servicio', count(*) from orden_notificacion_servicio
union all
select 'pago', count(*) from pago
union all
select 'insumo', count(*) from insumo
union all
select 'producto_insumo', count(*) from producto_insumo
union all
select 'movimiento_inventario', count(*) from movimiento_inventario;

-- Usuarios con roles
select
  u.nombres,
  u.apellidos,
  u.email,
  u.username,
  r.nombre as rol,
  e.nombre_comercial as establecimiento
from usuario u
join rol r on r.id_rol = u.id_rol
join establecimiento e on e.id_establecimiento = u.id_establecimiento
order by r.nombre, u.nombres;

-- Roles con permisos asignados
select
  r.nombre as rol,
  m.nombre as modulo,
  p.accion,
  p.codigo as permiso
from rol_permiso rp
join rol r on r.id_rol = rp.id_rol
join permiso p on p.id_permiso = rp.id_permiso
join modulo m on m.id_modulo = p.id_modulo
order by r.nombre, m.orden_display, p.accion;

-- productos por categoría
select
  c.nombre as categoria,
  p.nombre as producto,
  p.precio_base,
  p.disponibilidad
from producto p
join categoria c on c.id_categoria = p.id_categoria
order by c.orden_display, p.nombre;

-- Órdenes con usuario, mesa y total
select
  o.numero_orden,
  o.estado,
  o.tipo_servicio,
  u.nombres || ' ' || u.apellidos as usuario,
  m.numero as mesa,
  o.subtotal,
  o.igv,
  o.total
from orden o
left join mesa m on m.id_mesa = o.id_mesa
join usuario u on u.id_usuario = o.id_usuario
order by o.created_at desc;

-- =========================================================
-- KDS - Órdenes activas para monitor de cocina
-- =========================================================

select
  o.id_orden,
  o.numero_orden,
  o.estado,
  o.tipo_servicio,
  m.numero as mesa,
  u.nombres || ' ' || u.apellidos as usuario,
  o.abierta_at,
  o.enviada_cocina_at,
  o.preparacion_inicio_at,
  o.lista_at,
  o.entregada_at,
  count(io.id_item_orden) as total_items
from orden o
left join mesa m on m.id_mesa = o.id_mesa
join usuario u on u.id_usuario = o.id_usuario
left join item_orden io on io.id_orden = o.id_orden
where o.estado in ('ABIERTA', 'EN_PREPARACION', 'LISTA')
group by
  o.id_orden,
  o.numero_orden,
  o.estado,
  o.tipo_servicio,
  m.numero,
  u.nombres,
  u.apellidos,
  o.abierta_at,
  o.enviada_cocina_at,
  o.preparacion_inicio_at,
  o.lista_at,
  o.entregada_at
order by coalesce(o.enviada_cocina_at, o.abierta_at) asc;

-- =========================================================
-- KDS - Ítems por orden con estado de cocina
-- =========================================================

select
  o.numero_orden,
  io.id_item_orden,
  p.nombre as producto,
  io.cantidad,
  io.notas_cocina,
  io.estado_cocina,
  io.preparacion_inicio_at,
  io.listo_at,
  io.entregado_at
from item_orden io
join orden o on o.id_orden = io.id_orden
join producto p on p.id_producto = io.id_producto
where o.estado in ('ABIERTA', 'EN_PREPARACION', 'LISTA', 'ENTREGADA')
order by
  o.numero_orden,
  io.created_at asc;

-- =========================================================
-- KDS - Permisos asignados al módulo de cocina
-- =========================================================

select
  m.codigo as modulo,
  p.codigo as permiso,
  p.accion,
  p.descripcion,
  p.estado
from permiso p
join modulo m on m.id_modulo = p.id_modulo
where m.codigo = 'kds'
order by p.codigo;

-- =========================================================
-- POS - Permisos asignados para avisos de cocina
-- =========================================================

select
  m.codigo as modulo,
  p.codigo as permiso,
  p.accion,
  p.descripcion,
  p.estado
from permiso p
join modulo m on m.id_modulo = p.id_modulo
where p.codigo in (
  'pos.ver_avisos_cocina',
  'pos.atender_avisos_cocina',
  'pos.confirmar_entrega'
)
order by p.codigo;

-- =========================================================
-- Notificaciones de servicio cocina / salón
-- =========================================================

select
  n.id_notificacion,
  n.tipo,
  n.motivo,
  n.mensaje,
  n.estado,
  o.numero_orden,
  o.estado as estado_orden,
  m.numero as mesa,
  creador.nombres || ' ' || creador.apellidos as creado_por,
  atendido.nombres || ' ' || atendido.apellidos as atendido_por,
  n.created_at,
  n.atendida_at,
  n.updated_at
from orden_notificacion_servicio n
join orden o on o.id_orden = n.id_orden
left join mesa m on m.id_mesa = o.id_mesa
join usuario creador on creador.id_usuario = n.creado_por
left join usuario atendido on atendido.id_usuario = n.atendido_por
order by n.created_at desc;

-- Permisos nuevos por rol
select
  r.nombre as rol,
  p.codigo as permiso
from rol_permiso rp
join rol r on r.id_rol = rp.id_rol
join permiso p on p.id_permiso = rp.id_permiso
where p.codigo in (
  'kds.notificar_servicio',
  'pos.ver_avisos_cocina',
  'pos.atender_avisos_cocina',
  'pos.confirmar_entrega'
)
order by r.nombre, p.codigo;

-- Órdenes listas o entregadas con trazabilidad de tiempos
select
  o.numero_orden,
  o.estado,
  o.lista_at,
  o.entregada_at,
  count(io.id_item_orden) as total_items,
  count(*) filter (where io.estado_cocina = 'LISTO') as items_listos,
  count(*) filter (where io.estado_cocina = 'ENTREGADO') as items_entregados
from orden o
left join item_orden io on io.id_orden = o.id_orden
where o.estado in ('LISTA', 'ENTREGADA')
group by
  o.id_orden,
  o.numero_orden,
  o.estado,
  o.lista_at,
  o.entregada_at
order by coalesce(o.entregada_at, o.lista_at, o.created_at) desc;
