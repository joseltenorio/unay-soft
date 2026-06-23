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

const SERVICE_NOTIFICATION_TYPE = {
  READY_ORDER: "PEDIDO_LISTO",
  KITCHEN_INCIDENT: "INCIDENCIA_COCINA",
}

const SERVICE_NOTIFICATION_STATUS = {
  PENDING: "PENDIENTE",
  ATTENDED: "ATENDIDA",
  CANCELLED: "CANCELADA",
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

      responsible_user.id_usuario as responsable_id_usuario,
      responsible_user.nombres as responsable_nombres,
      responsible_user.apellidos as responsable_apellidos,
      responsible_user.username as responsable_username,
      responsible_order.id_orden as responsable_id_orden,
      responsible_order.numero_orden as responsable_numero_orden,

      table_service.active_order_count,
      table_service.active_total,
      table_service.first_order_at,
      table_service.last_order_at,

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
          order by
            io.created_at asc,
            io.id_item_orden asc
        ) filter (where io.id_item_orden is not null),
        '[]'::json
      ) as items

    from orden o
    left join mesa m
      on m.id_mesa = o.id_mesa
    inner join usuario u
      on u.id_usuario = o.id_usuario

    left join lateral (
      select
        count(*)::int as active_order_count,
        coalesce(sum(active_order.total), 0)::numeric as active_total,
        min(coalesce(active_order.abierta_at, active_order.created_at)) as first_order_at,
        max(coalesce(active_order.updated_at, active_order.created_at)) as last_order_at
      from orden active_order
      inner join usuario active_user
        on active_user.id_usuario = active_order.id_usuario
      where active_order.id_mesa = o.id_mesa
        and active_user.id_establecimiento = $1
        and active_order.cerrada_at is null
        and active_order.estado in (
          'ABIERTA',
          'EN_PREPARACION',
          'LISTA',
          'ENTREGADA'
        )
    ) table_service
      on true

    left join lateral (
      select
        first_order.id_orden,
        first_order.numero_orden,
        first_user.id_usuario,
        first_user.nombres,
        first_user.apellidos,
        first_user.username
      from orden first_order
      inner join usuario first_user
        on first_user.id_usuario = first_order.id_usuario
      where first_order.id_mesa = o.id_mesa
        and first_user.id_establecimiento = $1
        and first_order.cerrada_at is null
        and first_order.estado in (
          'ABIERTA',
          'EN_PREPARACION',
          'LISTA',
          'ENTREGADA'
        )
      order by
        coalesce(first_order.abierta_at, first_order.created_at) asc,
        first_order.id_orden asc
      limit 1
    ) responsible_order
      on true

    left join usuario responsible_user
      on responsible_user.id_usuario = responsible_order.id_usuario

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
          and not exists (
            select 1
            from orden_notificacion_servicio ns
            where ns.id_orden = o.id_orden
              and ns.tipo = 'PEDIDO_LISTO'
              and ns.estado in ('PENDIENTE', 'ATENDIDA')
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
      u.username,
      responsible_user.id_usuario,
      responsible_user.nombres,
      responsible_user.apellidos,
      responsible_user.username,
      responsible_order.id_orden,
      responsible_order.numero_orden,
      table_service.active_order_count,
      table_service.active_total,
      table_service.first_order_at,
      table_service.last_order_at

    order by
      coalesce(o.enviada_cocina_at, o.abierta_at, o.created_at) asc;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows.map((order) => {
    const orderCreator = {
      id_usuario: order.id_usuario,
      nombres: order.usuario_nombres,
      apellidos: order.usuario_apellidos,
      username: order.usuario_username,
    }

    const responsibleUser = order.responsable_id_usuario
      ? {
          id_usuario: order.responsable_id_usuario,
          nombres: order.responsable_nombres,
          apellidos: order.responsable_apellidos,
          username: order.responsable_username,
        }
      : null

    return {
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
      usuario: orderCreator,
      created_by: orderCreator,
      table_service: order.id_mesa
        ? {
            active_order_count: Number(order.active_order_count || 0),
            active_total: Number(order.active_total || 0),
            first_order_at: order.first_order_at,
            last_order_at: order.last_order_at,
            responsible_order: order.responsable_id_orden
              ? {
                  id_orden: order.responsable_id_orden,
                  numero_orden: order.responsable_numero_orden,
                }
              : null,
            responsible_user: responsibleUser,
          }
        : null,
      items: order.items || [],
    }
  })
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
            when $3::varchar(30) = 'LISTA'
              then now()
            when $3::varchar(30) = 'EN_PREPARACION'
              then null
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
            when $3::varchar(30) = 'EN_PREPARACION'
              then null
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
  if (
    currentStatus === ORDER_STATUS.READY &&
    nextStatus === ORDER_STATUS.IN_PREPARATION
  ) {
    const pendingServiceCallResult = await client.query(
      `
        select count(*)::int as pending_service_calls
        from orden_notificacion_servicio
        where id_orden = $1
          and tipo = 'PEDIDO_LISTO'
          and estado = 'PENDIENTE';
      `,
      [idOrden],
    )

    const pendingServiceCalls =
      pendingServiceCallResult.rows[0]?.pending_service_calls || 0

    if (pendingServiceCalls > 0) {
      throw createBusinessError(
        "No se puede abortar una comanda lista que ya fue notificada al mesero.",
      )
    }

    return
  }

  if (currentStatus === ORDER_STATUS.READY && nextStatus !== ORDER_STATUS.READY) {
    throw createBusinessError("Una comanda lista no puede cambiar a ese estado.")
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

  if (currentOrderStatus === ORDER_STATUS.READY) {
    throw createBusinessError("No se puede modificar un ítem de una comanda lista.")
  }

  if (
    currentItemStatus === ITEM_STATUS.READY &&
    nextStatus === ITEM_STATUS.IN_PREPARATION &&
    currentOrderStatus === ORDER_STATUS.IN_PREPARATION
  ) {
    return
  }

  if (currentItemStatus === ITEM_STATUS.READY && nextStatus !== ITEM_STATUS.READY) {
    throw createBusinessError("Un ítem listo no puede cambiar a ese estado.")
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

function normalizeOptionalText(value) {
  if (value === undefined || value === null) {
    return null
  }

  const normalizedValue = String(value).trim()

  return normalizedValue.length > 0 ? normalizedValue : null
}

function isValidServiceNotificationType(type) {
  return Object.values(SERVICE_NOTIFICATION_TYPE).includes(type)
}

async function createServiceNotification({
  idOrden,
  idEstablecimiento,
  idUsuario,
  type,
  motivo,
  mensaje,
}) {
  if (!isValidServiceNotificationType(type)) {
    throw createBusinessError("Tipo de aviso de servicio no permitido.")
  }

  const normalizedMotivo = normalizeOptionalText(motivo)
  const normalizedMensaje = normalizeOptionalText(mensaje)

  const client = await pool.connect()

  try {
    await client.query("begin")

    const orderResult = await client.query(
      `
        select
          o.id_orden,
          o.numero_orden,
          o.estado
        from orden o
        join usuario u on u.id_usuario = o.id_usuario
        where o.id_orden = $1
          and u.id_establecimiento = $2
        for update;
      `,
      [idOrden, idEstablecimiento],
    )

    if (orderResult.rowCount === 0) {
      throw createBusinessError("Comanda no encontrada.", 404)
    }

    const order = orderResult.rows[0]

    if (
      type === SERVICE_NOTIFICATION_TYPE.READY_ORDER &&
      order.estado !== ORDER_STATUS.READY
    ) {
      throw createBusinessError(
        "Solo se puede llamar al mesero cuando la comanda está lista.",
      )
    }

    if (
      type === SERVICE_NOTIFICATION_TYPE.KITCHEN_INCIDENT &&
      ![ORDER_STATUS.OPEN, ORDER_STATUS.IN_PREPARATION].includes(order.estado)
    ) {
      throw createBusinessError(
        "Solo se puede pedir apoyo en comandas abiertas o en preparación.",
      )
    }

    if (
      type === SERVICE_NOTIFICATION_TYPE.KITCHEN_INCIDENT &&
      !normalizedMotivo &&
      !normalizedMensaje
    ) {
      throw createBusinessError(
        "Debe ingresar un motivo o mensaje para pedir apoyo.",
      )
    }

    if (type === SERVICE_NOTIFICATION_TYPE.READY_ORDER) {
      const existingNotificationResult = await client.query(
        `
          select
            id_notificacion,
            id_orden,
            tipo,
            motivo,
            mensaje,
            estado,
            creado_por,
            atendido_por,
            created_at,
            atendida_at,
            updated_at
          from orden_notificacion_servicio
          where id_orden = $1
            and tipo = 'PEDIDO_LISTO'
            and estado = 'PENDIENTE'
          limit 1;
        `,
        [idOrden],
      )

      if (existingNotificationResult.rowCount > 0) {
        await client.query("commit")
        return existingNotificationResult.rows[0]
      }
    }

    const notificationResult = await client.query(
      `
        insert into orden_notificacion_servicio (
          id_orden,
          tipo,
          motivo,
          mensaje,
          estado,
          creado_por
        )
        values (
          $1,
          $2,
          $3,
          $4,
          'PENDIENTE',
          $5
        )
        returning
          id_notificacion,
          id_orden,
          tipo,
          motivo,
          mensaje,
          estado,
          creado_por,
          atendido_por,
          created_at,
          atendida_at,
          updated_at;
      `,
      [
        idOrden,
        type,
        normalizedMotivo,
        normalizedMensaje,
        idUsuario,
      ],
    )

    await client.query("commit")

    return notificationResult.rows[0]
  } catch (error) {
    await client.query("rollback")

    if (error.code === "23505") {
      throw createBusinessError(
        "Ya existe un aviso pendiente para esta comanda.",
        409,
      )
    }

    throw error
  } finally {
    client.release()
  }
}

async function getServiceNotifications({
  idEstablecimiento,
  status = SERVICE_NOTIFICATION_STATUS.PENDING,
}) {
  const normalizedStatus = normalizeOptionalText(status)

  const query = `
    select
      ns.id_notificacion,
      ns.id_orden,
      ns.tipo,
      ns.motivo,
      ns.mensaje,
      ns.estado,
      ns.creado_por,
      ns.atendido_por,
      ns.created_at,
      ns.atendida_at,
      ns.updated_at,

      o.numero_orden,
      o.estado as orden_estado,
      o.tipo_servicio,
      o.observaciones,
      o.lista_at,
      o.entregada_at,

      m.id_mesa,
      m.numero as mesa_numero,
      m.nombre as mesa_nombre,

      creador.nombres as creado_por_nombres,
      creador.apellidos as creado_por_apellidos,
      creador.username as creado_por_username,

      order_creator.id_usuario as order_creator_id_usuario,
      order_creator.nombres as order_creator_nombres,
      order_creator.apellidos as order_creator_apellidos,
      order_creator.username as order_creator_username,

      responsible_user.id_usuario as responsable_id_usuario,
      responsible_user.nombres as responsable_nombres,
      responsible_user.apellidos as responsable_apellidos,
      responsible_user.username as responsable_username,
      responsible_order.id_orden as responsable_id_orden,
      responsible_order.numero_orden as responsable_numero_orden,

      table_service.active_order_count,
      table_service.active_total,
      table_service.first_order_at,
      table_service.last_order_at,

      atendido.nombres as atendido_por_nombres,
      atendido.apellidos as atendido_por_apellidos,
      atendido.username as atendido_por_username,

      coalesce(
        json_agg(
          json_build_object(
            'id_item_orden', io.id_item_orden,
            'producto_nombre', p.nombre,
            'cantidad', io.cantidad,
            'notas_cocina', io.notas_cocina,
            'estado_cocina', io.estado_cocina,
            'listo_at', io.listo_at,
            'entregado_at', io.entregado_at
          )
          order by
            io.created_at asc,
            io.id_item_orden asc
        ) filter (where io.id_item_orden is not null),
        '[]'::json
      ) as items

    from orden_notificacion_servicio ns
    join orden o
      on o.id_orden = ns.id_orden
    join usuario creador
      on creador.id_usuario = ns.creado_por
    join usuario order_creator
      on order_creator.id_usuario = o.id_usuario

    left join lateral (
      select
        count(*)::int as active_order_count,
        coalesce(sum(active_order.total), 0)::numeric as active_total,
        min(coalesce(active_order.abierta_at, active_order.created_at)) as first_order_at,
        max(coalesce(active_order.updated_at, active_order.created_at)) as last_order_at
      from orden active_order
      inner join usuario active_user
        on active_user.id_usuario = active_order.id_usuario
      where active_order.id_mesa = o.id_mesa
        and active_user.id_establecimiento = $1
        and active_order.cerrada_at is null
        and active_order.estado in (
          'ABIERTA',
          'EN_PREPARACION',
          'LISTA',
          'ENTREGADA'
        )
    ) table_service
      on true

    left join lateral (
      select
        first_order.id_orden,
        first_order.numero_orden,
        first_user.id_usuario,
        first_user.nombres,
        first_user.apellidos,
        first_user.username
      from orden first_order
      inner join usuario first_user
        on first_user.id_usuario = first_order.id_usuario
      where first_order.id_mesa = o.id_mesa
        and first_user.id_establecimiento = $1
        and first_order.cerrada_at is null
        and first_order.estado in (
          'ABIERTA',
          'EN_PREPARACION',
          'LISTA',
          'ENTREGADA'
        )
      order by
        coalesce(first_order.abierta_at, first_order.created_at) asc,
        first_order.id_orden asc
      limit 1
    ) responsible_order
      on true

    left join usuario responsible_user
      on responsible_user.id_usuario = responsible_order.id_usuario

    left join usuario atendido
      on atendido.id_usuario = ns.atendido_por
    left join mesa m
      on m.id_mesa = o.id_mesa
    left join item_orden io
      on io.id_orden = o.id_orden
     and io.estado_cocina <> 'ANULADO'
    left join producto p
      on p.id_producto = io.id_producto

    where creador.id_establecimiento = $1
      and ($2::varchar is null or ns.estado = $2::varchar)

    group by
      ns.id_notificacion,
      ns.id_orden,
      ns.tipo,
      ns.motivo,
      ns.mensaje,
      ns.estado,
      ns.creado_por,
      ns.atendido_por,
      ns.created_at,
      ns.atendida_at,
      ns.updated_at,
      o.numero_orden,
      o.estado,
      o.tipo_servicio,
      o.observaciones,
      o.lista_at,
      o.entregada_at,
      m.id_mesa,
      m.numero,
      m.nombre,
      creador.nombres,
      creador.apellidos,
      creador.username,
      order_creator.id_usuario,
      order_creator.nombres,
      order_creator.apellidos,
      order_creator.username,
      responsible_user.id_usuario,
      responsible_user.nombres,
      responsible_user.apellidos,
      responsible_user.username,
      responsible_order.id_orden,
      responsible_order.numero_orden,
      table_service.active_order_count,
      table_service.active_total,
      table_service.first_order_at,
      table_service.last_order_at,
      atendido.nombres,
      atendido.apellidos,
      atendido.username

    order by
      case ns.tipo
        when 'PEDIDO_LISTO' then 1
        when 'INCIDENCIA_COCINA' then 2
        else 3
      end,
      ns.created_at asc;
  `

  const { rows } = await pool.query(query, [idEstablecimiento, normalizedStatus])

  return rows.map((notification) => ({
    id_notificacion: notification.id_notificacion,
    id_orden: notification.id_orden,
    tipo: notification.tipo,
    motivo: notification.motivo,
    mensaje: notification.mensaje,
    estado: notification.estado,
    creado_por: notification.creado_por,
    atendido_por: notification.atendido_por,
    created_at: notification.created_at,
    atendida_at: notification.atendida_at,
    updated_at: notification.updated_at,
    orden: {
      numero_orden: notification.numero_orden,
      estado: notification.orden_estado,
      tipo_servicio: notification.tipo_servicio,
      observaciones: notification.observaciones,
      lista_at: notification.lista_at,
      entregada_at: notification.entregada_at,
    },
    mesa: notification.id_mesa
      ? {
          id_mesa: notification.id_mesa,
          numero: notification.mesa_numero,
          nombre: notification.mesa_nombre,
        }
      : null,
    order_created_by: {
      id_usuario: notification.order_creator_id_usuario,
      nombres: notification.order_creator_nombres,
      apellidos: notification.order_creator_apellidos,
      username: notification.order_creator_username,
    },
    table_service: {
      responsible_user: notification.responsable_id_usuario
        ? {
            id_usuario: notification.responsable_id_usuario,
            nombres: notification.responsable_nombres,
            apellidos: notification.responsable_apellidos,
            username: notification.responsable_username,
          }
        : null,
      responsible_order: notification.responsable_id_orden
        ? {
            id_orden: notification.responsable_id_orden,
            numero_orden: notification.responsable_numero_orden,
          }
        : null,
      active_order_count: Number(notification.active_order_count || 0),
      active_total: Number(notification.active_total || 0),
      first_order_at: notification.first_order_at,
      last_order_at: notification.last_order_at,
    },
    creado_por_usuario: {
      nombres: notification.creado_por_nombres,
      apellidos: notification.creado_por_apellidos,
      username: notification.creado_por_username,
    },
    atendido_por_usuario: notification.atendido_por
      ? {
          nombres: notification.atendido_por_nombres,
          apellidos: notification.atendido_por_apellidos,
          username: notification.atendido_por_username,
        }
      : null,
    items: notification.items || [],
  }))
}

async function attendServiceNotification({
  idNotificacion,
  idEstablecimiento,
  idUsuario,
}) {
  const updateResult = await pool.query(
    `
      update orden_notificacion_servicio ns
      set
        estado = 'ATENDIDA',
        atendido_por = $3,
        atendida_at = now(),
        updated_at = now()
      from orden o
      join usuario creador
        on creador.id_usuario = o.id_usuario
      where ns.id_notificacion = $1
        and ns.id_orden = o.id_orden
        and creador.id_establecimiento = $2
        and ns.estado = 'PENDIENTE'
      returning
        ns.id_notificacion,
        ns.id_orden,
        ns.tipo,
        ns.motivo,
        ns.mensaje,
        ns.estado,
        ns.creado_por,
        ns.atendido_por,
        ns.created_at,
        ns.atendida_at,
        ns.updated_at;
    `,
    [idNotificacion, idEstablecimiento, idUsuario],
  )

  if (updateResult.rowCount === 0) {
    throw createBusinessError(
      "Aviso de servicio no encontrado o ya fue atendido.",
      404,
    )
  }

  return updateResult.rows[0]
}

async function markOrderAsDelivered({
  idOrden,
  idEstablecimiento,
  idUsuario,
}) {
  const client = await pool.connect()

  try {
    await client.query("begin")

    const orderResult = await client.query(
      `
        select
          o.id_orden,
          o.numero_orden,
          o.estado,
          o.lista_at,
          o.entregada_at
        from orden o
        join usuario u on u.id_usuario = o.id_usuario
        where o.id_orden = $1
          and u.id_establecimiento = $2
        for update;
      `,
      [idOrden, idEstablecimiento],
    )

    if (orderResult.rowCount === 0) {
      throw createBusinessError("Comanda no encontrada.", 404)
    }

    const currentOrder = orderResult.rows[0]

    if (currentOrder.estado !== ORDER_STATUS.READY) {
      throw createBusinessError(
        "Solo se puede confirmar entrega de comandas listas.",
      )
    }

    await client.query(
      `
        update item_orden
        set
          estado_cocina = 'ENTREGADO',
          entregado_at = case
            when entregado_at is null then now()
            else entregado_at
          end,
          updated_at = now()
        where id_orden = $1
          and estado_cocina = 'LISTO';
      `,
      [idOrden],
    )

    const orderUpdateResult = await client.query(
      `
        update orden
        set
          estado = 'ENTREGADA',
          entregada_at = case
            when entregada_at is null then now()
            else entregada_at
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
          lista_at,
          entregada_at,
          updated_at;
      `,
      [idOrden, idEstablecimiento],
    )

    await client.query(
      `
        update orden_notificacion_servicio ns
        set
          estado = 'ATENDIDA',
          atendido_por = $3,
          atendida_at = case
            when atendida_at is null then now()
            else atendida_at
          end,
          updated_at = now()
        from orden o
        join usuario creador
          on creador.id_usuario = o.id_usuario
        where ns.id_orden = o.id_orden
          and ns.id_orden = $1
          and creador.id_establecimiento = $2
          and ns.estado = 'PENDIENTE'
          and ns.tipo = 'PEDIDO_LISTO';
      `,
      [idOrden, idEstablecimiento, idUsuario],
    )

    await client.query("commit")

    return orderUpdateResult.rows[0]
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  getKitchenOrders,
  updateKitchenOrderStatus,
  updateKitchenItemStatus,
  createServiceNotification,
  getServiceNotifications,
  attendServiceNotification,
  markOrderAsDelivered,
}