// backend/src/services/kds.service.js

const { pool } = require("../config/database")

async function getKitchenOrders(idEstablecimiento) {
  const query = `
    select
      o.id_orden,
      o.numero_orden,
      o.estado,
      o.tipo_servicio,
      o.subtotal,
      o.igv,
      o.total,
      o.observaciones,
      o.abierta_at,
      o.enviada_cocina_at,
      o.preparacion_inicio_at,
      o.lista_at,
      o.created_at,
      o.updated_at,

      m.id_mesa,
      m.numero as mesa_numero,
      m.nombre as mesa_nombre,

      u.id_usuario,
      u.nombres as usuario_nombres,
      u.apellidos as usuario_apellidos,
      u.username as usuario_username,

      coalesce(
        json_agg(
          json_build_object(
            'id_item_orden', io.id_item_orden,
            'id_producto', p.id_producto,
            'producto_nombre', p.nombre,
            'producto_descripcion', p.descripcion,
            'cantidad', io.cantidad,
            'precio_unitario', io.precio_unitario,
            'subtotal', io.subtotal,
            'notas_cocina', io.notas_cocina,
            'estado_cocina', io.estado_cocina,
            'preparacion_inicio_at', io.preparacion_inicio_at,
            'listo_at', io.listo_at,
            'created_at', io.created_at,
            'updated_at', io.updated_at
          )
          order by io.created_at asc
        ) filter (where io.id_item_orden is not null),
        '[]'::json
      ) as items

    from orden o
    left join mesa m
      on m.id_mesa = o.id_mesa
    inner join usuario u
      on u.id_usuario = o.id_usuario
    left join item_orden io
      on io.id_orden = o.id_orden
     and io.estado_cocina <> 'ANULADO'
    left join producto p
      on p.id_producto = io.id_producto

    where u.id_establecimiento = $1
      and o.estado in ('ABIERTA', 'EN_PREPARACION', 'LISTA')

    group by
      o.id_orden,
      o.numero_orden,
      o.estado,
      o.tipo_servicio,
      o.subtotal,
      o.igv,
      o.total,
      o.observaciones,
      o.abierta_at,
      o.enviada_cocina_at,
      o.preparacion_inicio_at,
      o.lista_at,
      o.created_at,
      o.updated_at,
      m.id_mesa,
      m.numero,
      m.nombre,
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.username

    order by
      coalesce(o.enviada_cocina_at, o.abierta_at, o.created_at) asc;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows.map((order) => ({
    id_orden: order.id_orden,
    numero_orden: order.numero_orden,
    estado: order.estado,
    tipo_servicio: order.tipo_servicio,
    subtotal: Number(order.subtotal),
    igv: Number(order.igv),
    total: Number(order.total),
    observaciones: order.observaciones,
    abierta_at: order.abierta_at,
    enviada_cocina_at: order.enviada_cocina_at,
    preparacion_inicio_at: order.preparacion_inicio_at,
    lista_at: order.lista_at,
    created_at: order.created_at,
    updated_at: order.updated_at,
    mesa: order.id_mesa
      ? {
          id_mesa: order.id_mesa,
          numero: order.mesa_numero,
          nombre: order.mesa_nombre,
        }
      : null,
    usuario: {
      id_usuario: order.id_usuario,
      nombres: order.usuario_nombres,
      apellidos: order.usuario_apellidos,
      username: order.usuario_username,
    },
    items: order.items || [],
  }))
}

module.exports = {
  getKitchenOrders,
}