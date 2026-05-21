// backend/src/services/kds.service.js

const { pool } = require("../config/database")

const ORDER_STATUS = {
  OPEN: "ABIERTA",
  IN_PREPARATION: "EN_PREPARACION",
  READY: "LISTA",
}

const ITEM_STATUS = {
  PENDING: "PENDIENTE",
  IN_PREPARATION: "EN_PREPARACION",
  READY: "LISTO",
}

function createBusinessError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function isValidOrderStatus(status) {
  return Object.values(ORDER_STATUS).includes(status)
}

function isValidItemStatus(status) {
  return Object.values(ITEM_STATUS).includes(status)
}

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
      and (
        o.estado in ('ABIERTA', 'EN_PREPARACION')
        or (
          o.estado = 'LISTA'
          and (
            o.lista_at is null
            or o.lista_at > now() - interval '7 seconds'
          )
        )
      )

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

async function updateKitchenOrderStatus({
  idOrden,
  idEstablecimiento,
  nextStatus,
}) {
  if (!isValidOrderStatus(nextStatus)) {
    throw createBusinessError("Estado de orden no permitido para KDS.")
  }

  const client = await pool.connect()

  try {
    await client.query("begin")

    const currentOrderResult = await client.query(
      `
        select
          o.id_orden,
          o.estado,
          o.enviada_cocina_at,
          o.preparacion_inicio_at,
          o.lista_at
        from orden o
        join usuario u on u.id_usuario = o.id_usuario
        where o.id_orden = $1
          and u.id_establecimiento = $2
        for update;
      `,
      [idOrden, idEstablecimiento],
    )

    if (currentOrderResult.rowCount === 0) {
      throw createBusinessError("Comanda no encontrada.", 404)
    }

    const currentOrder = currentOrderResult.rows[0]

    await validateOrderTransition({
      client,
      idOrden,
      currentStatus: currentOrder.estado,
      nextStatus,
    })

    if (nextStatus === ORDER_STATUS.IN_PREPARATION) {
      await client.query(
        `
          update item_orden
          set
            estado_cocina = case
              when estado_cocina = 'PENDIENTE' then 'EN_PREPARACION'
              else estado_cocina
            end,
            preparacion_inicio_at = case
              when preparacion_inicio_at is null
               and estado_cocina = 'PENDIENTE'
                then now()
              else preparacion_inicio_at
            end,
            updated_at = now()
          where id_orden = $1
            and estado_cocina = 'PENDIENTE';
        `,
        [idOrden],
      )
    }

    const updateResult = await client.query(
      `
        update orden
        set
          estado = $3::varchar(30),
          enviada_cocina_at = case
            when enviada_cocina_at is null
             and $3::varchar(30) in ('ABIERTA', 'EN_PREPARACION', 'LISTA')
              then now()
            else enviada_cocina_at
          end,
          preparacion_inicio_at = case
            when preparacion_inicio_at is null
             and $3::varchar(30) in ('EN_PREPARACION', 'LISTA')
              then now()
            else preparacion_inicio_at
          end,
          lista_at = case
            when lista_at is null
             and $3::varchar(30) = 'LISTA'
              then now()
            else lista_at
          end,
          updated_at = now()
        where id_orden = $1
          and exists (
            select 1
            from usuario u
            where u.id_usuario = orden.id_usuario
              and u.id_establecimiento = $2
          )
        returning
          id_orden,
          numero_orden,
          estado,
          enviada_cocina_at,
          preparacion_inicio_at,
          lista_at,
          updated_at;
      `,
      [idOrden, idEstablecimiento, nextStatus],
    )

    await client.query("commit")

    return updateResult.rows[0]
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

async function updateKitchenItemStatus({
  idItemOrden,
  idEstablecimiento,
  nextStatus,
}) {
  if (!isValidItemStatus(nextStatus)) {
    throw createBusinessError("Estado de ítem no permitido para KDS.")
  }

  const client = await pool.connect()

  try {
    await client.query("begin")

    const currentItemResult = await client.query(
      `
        select
          io.id_item_orden,
          io.id_orden,
          io.estado_cocina,
          io.preparacion_inicio_at,
          io.listo_at,
          o.estado as estado_orden
        from item_orden io
        join orden o on o.id_orden = io.id_orden
        join usuario u on u.id_usuario = o.id_usuario
        where io.id_item_orden = $1
          and u.id_establecimiento = $2
        for update;
      `,
      [idItemOrden, idEstablecimiento],
    )

    if (currentItemResult.rowCount === 0) {
      throw createBusinessError("Ítem de comanda no encontrado.", 404)
    }

    const currentItem = currentItemResult.rows[0]

    validateItemTransition({
      currentItemStatus: currentItem.estado_cocina,
      currentOrderStatus: currentItem.estado_orden,
      nextStatus,
    })

    const updateResult = await client.query(
      `
        update item_orden
        set
          estado_cocina = $3::varchar(30),
          preparacion_inicio_at = case
            when preparacion_inicio_at is null
             and $3::varchar(30) in ('EN_PREPARACION', 'LISTO')
              then now()
            else preparacion_inicio_at
          end,
          listo_at = case
            when listo_at is null
             and $3::varchar(30) = 'LISTO'
              then now()
            else listo_at
          end,
          updated_at = now()
        where id_item_orden = $1
          and exists (
            select 1
            from orden o
            join usuario u on u.id_usuario = o.id_usuario
            where o.id_orden = item_orden.id_orden
              and u.id_establecimiento = $2
          )
        returning
          id_item_orden,
          id_orden,
          estado_cocina,
          preparacion_inicio_at,
          listo_at,
          updated_at;
      `,
      [idItemOrden, idEstablecimiento, nextStatus],
    )

    await syncOrderStatusFromItems({
      client,
      idOrden: updateResult.rows[0].id_orden,
      idEstablecimiento,
    })

    await client.query("commit")

    return updateResult.rows[0]
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

async function validateOrderTransition({
  client,
  idOrden,
  currentStatus,
  nextStatus,
}) {
  if (currentStatus === ORDER_STATUS.READY && nextStatus !== ORDER_STATUS.READY) {
    throw createBusinessError("Una comanda lista no puede volver a preparación.")
  }

  if (
    currentStatus === ORDER_STATUS.IN_PREPARATION &&
    nextStatus === ORDER_STATUS.OPEN
  ) {
    throw createBusinessError("Una comanda en preparación no puede volver a abierta.")
  }

  if (nextStatus === ORDER_STATUS.READY) {
    const pendingItemsResult = await client.query(
      `
        select count(*)::int as pending_items
        from item_orden
        where id_orden = $1
          and estado_cocina <> 'ANULADO'
          and estado_cocina <> 'LISTO';
      `,
      [idOrden],
    )

    const pendingItems = pendingItemsResult.rows[0]?.pending_items || 0

    if (pendingItems > 0) {
      throw createBusinessError(
        "No se puede finalizar la comanda mientras existan ítems pendientes.",
      )
    }
  }
}

function validateItemTransition({
  currentItemStatus,
  currentOrderStatus,
  nextStatus,
}) {
  if (currentOrderStatus === ORDER_STATUS.OPEN && nextStatus === ITEM_STATUS.READY) {
    throw createBusinessError(
      "No se puede marcar un ítem como listo antes de iniciar la preparación de la comanda.",
    )
  }

  if (currentOrderStatus === ORDER_STATUS.READY && nextStatus !== ITEM_STATUS.READY) {
    throw createBusinessError("No se puede modificar un ítem de una comanda lista.")
  }

  if (currentItemStatus === ITEM_STATUS.READY && nextStatus !== ITEM_STATUS.READY) {
    throw createBusinessError("Un ítem listo no puede volver a preparación.")
  }
}

async function syncOrderStatusFromItems({ client, idOrden, idEstablecimiento }) {
  const summaryResult = await client.query(
    `
      select
        count(*)::int as total_items,
        count(*) filter (where estado_cocina = 'LISTO')::int as ready_items,
        count(*) filter (where estado_cocina = 'EN_PREPARACION')::int as in_preparation_items
      from item_orden io
      join orden o on o.id_orden = io.id_orden
      join usuario u on u.id_usuario = o.id_usuario
      where io.id_orden = $1
        and u.id_establecimiento = $2
        and io.estado_cocina <> 'ANULADO';
    `,
    [idOrden, idEstablecimiento],
  )

  const summary = summaryResult.rows[0]

  if (summary.total_items === 0) {
    return
  }

  if (summary.in_preparation_items > 0) {
    await client.query(
      `
        update orden
        set
          estado = 'EN_PREPARACION',
          enviada_cocina_at = case
            when enviada_cocina_at is null then now()
            else enviada_cocina_at
          end,
          preparacion_inicio_at = case
            when preparacion_inicio_at is null then now()
            else preparacion_inicio_at
          end,
          updated_at = now()
        where id_orden = $1
          and estado = 'ABIERTA';
      `,
      [idOrden],
    )
  }
}

module.exports = {
  getKitchenOrders,
  updateKitchenOrderStatus,
  updateKitchenItemStatus,
}