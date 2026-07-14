// backend/src/services/pos.service.js

const { pool } = require("../config/database")

const ACTIVE_ORDER_STATES = ["ABIERTA", "EN_PREPARACION", "LISTA", "ENTREGADA"]
const BLOCKED_TABLE_STATES = ["RESERVADA", "MANTENIMIENTO"]

function createHttpError(message, statusCode = 500) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function normalizeOrderItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError("Debe enviar al menos un producto en la comanda.", 400)
  }

  return items.map((item, index) => {
    const idProducto = item.id_producto
    const cantidad = Number(item.cantidad)

    if (!idProducto) {
      throw createHttpError(`El producto del ítem ${index + 1} es obligatorio.`, 400)
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw createHttpError(
        `La cantidad del ítem ${index + 1} debe ser un entero mayor a cero.`,
        400,
      )
    }

    return {
      id_producto: idProducto,
      cantidad,
      notas_cocina: item.notas_cocina?.trim() || null,
    }
  })
}

function formatTodayOrderPrefix() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `ORD-${year}${month}${day}`
}

function formatOrderNumber(prefix, sequence) {
  return `${prefix}-${String(sequence).padStart(4, "0")}`
}

async function getNextOrderNumber(client, idEstablecimiento) {
  const prefix = formatTodayOrderPrefix()

  await client.query(
    "select pg_advisory_xact_lock(hashtext($1));",
    [`umari-order-number-${idEstablecimiento}-${prefix}`],
  )

  const { rows } = await client.query(
    `
      select count(*)::int as total
      from orden
      where numero_orden like $1;
    `,
    [`${prefix}-%`],
  )

  const nextSequence = Number(rows[0]?.total || 0) + 1

  return formatOrderNumber(prefix, nextSequence)
}

async function getOrderById(client, idOrden) {
  const { rows } = await client.query(
    `
      select
        o.id_orden,
        o.id_mesa,
        m.numero as mesa_numero,
        z.nombre as zona_nombre,
        o.id_usuario,
        o.numero_orden,
        o.estado,
        o.tipo_servicio,
        o.subtotal,
        o.igv,
        o.total,
        o.observaciones,
        o.abierta_at,
        o.enviada_cocina_at,
        o.created_at,
        o.updated_at,
        coalesce(
          json_agg(
            json_build_object(
              'id_item_orden', io.id_item_orden,
              'id_producto', io.id_producto,
              'producto_nombre', p.nombre,
              'cantidad', io.cantidad,
              'precio_unitario', io.precio_unitario,
              'subtotal', io.subtotal,
              'notas_cocina', io.notas_cocina,
              'estado_cocina', io.estado_cocina
            )
            order by io.created_at asc
          ) filter (where io.id_item_orden is not null),
          '[]'
        ) as items
      from orden o
      left join mesa m on m.id_mesa = o.id_mesa
      left join zona z on z.id_zona = m.id_zona
      left join item_orden io on io.id_orden = o.id_orden
      left join producto p on p.id_producto = io.id_producto
      where o.id_orden = $1
      group by
        o.id_orden,
        m.numero,
        z.nombre;
    `,
    [idOrden],
  )

  return rows[0] || null
}

async function getPosTables(idEstablecimiento) {
  const { rows } = await pool.query(
    `
      with active_order_rows as (
        select
          o.id_mesa,
          o.id_orden,
          o.numero_orden,
          o.estado,
          o.subtotal,
          o.igv,
          o.total,
          o.observaciones,
          o.abierta_at,
          o.enviada_cocina_at,
          o.created_at,
          o.updated_at,
          u.id_usuario,
          u.nombres,
          u.apellidos,
          u.username
        from orden o
        inner join usuario u
          on u.id_usuario = o.id_usuario
        where o.estado = any($2::varchar[])
          and u.id_establecimiento = $1
      ),
      current_order_items as (
        select
          o.id_mesa,
          io.id_orden,
          io.id_item_orden,
          io.id_producto,
          p.nombre as producto_nombre,
          io.cantidad,
          io.precio_unitario,
          io.subtotal,
          io.notas_cocina,
          io.estado_cocina
        from orden o
        inner join item_orden io
          on io.id_orden = o.id_orden
        inner join producto p
          on p.id_producto = io.id_producto
        inner join usuario u
          on u.id_usuario = o.id_usuario
        where o.estado = any($2::varchar[])
          and u.id_establecimiento = $1
          and io.estado_cocina <> 'ANULADO'
      ),
      active_orders as (
        select
          id_mesa,
          count(*)::int as active_order_count,
          coalesce(sum(total), 0)::numeric as active_total,
          min(coalesce(abierta_at, created_at)) as first_order_at,
          max(coalesce(enviada_cocina_at, updated_at, created_at)) as last_order_at,
          json_agg(
            json_build_object(
              'id_orden', id_orden,
              'numero_orden', numero_orden,
              'estado', estado,
              'subtotal', subtotal,
              'igv', igv,
              'total', total,
              'observaciones', observaciones,
              'created_at', created_at,
              'created_by', json_build_object(
                'id_usuario', id_usuario,
                'nombres', nombres,
                'apellidos', apellidos,
                'username', username
              )
            )
            order by created_at desc
          ) as orders
        from active_order_rows
        group by id_mesa
      ),
      table_responsible as (
        select distinct on (id_mesa)
          id_mesa,
          id_orden as responsible_order_id,
          numero_orden as responsible_order_number,
          id_usuario,
          nombres,
          apellidos,
          username,
          coalesce(abierta_at, created_at) as assigned_at
        from active_order_rows
        order by
          id_mesa,
          coalesce(abierta_at, created_at) asc,
          id_orden asc
      )
      select
        m.id_mesa,
        m.id_establecimiento,
        m.id_zona,
        z.nombre as zona_nombre,
        m.numero,
        m.nombre,
        m.capacidad,
        m.disponibilidad,
        m.estado,
        coalesce(ao.active_order_count, 0) as active_order_count,
        coalesce(ao.active_total, 0) as active_total,
        ao.first_order_at,
        ao.last_order_at,
        coalesce(ao.orders, '[]'::json) as active_orders,
        coalesce(coi.current_items, '[]'::json) as current_items,
        tr.responsible_order_id,
        tr.responsible_order_number,
        tr.assigned_at as responsible_assigned_at,
        tr.id_usuario as responsible_user_id,
        tr.nombres as responsible_user_nombres,
        tr.apellidos as responsible_user_apellidos,
        tr.username as responsible_user_username
      from mesa m
      left join zona z
        on z.id_zona = m.id_zona
      left join active_orders ao
        on ao.id_mesa = m.id_mesa  

        left join (
          select
            id_mesa,
            json_agg(
              json_build_object(
                'id_item_orden', id_item_orden,
                'id_orden', id_orden,
                'id_producto', id_producto,
                'producto_nombre', producto_nombre,
                'cantidad', cantidad,
                'precio_unitario', precio_unitario,
                'subtotal', subtotal,
                'notas_cocina', notas_cocina,
                'estado_cocina', estado_cocina
              )
              order by id_item_orden
            ) as current_items
          from current_order_items
          group by id_mesa
        ) coi
          on coi.id_mesa = m.id_mesa

      left join table_responsible tr
        on tr.id_mesa = m.id_mesa
      where m.id_establecimiento = $1
        and m.estado = true
      order by
        coalesce(z.nombre, 'Sin zona') asc,
        m.numero asc;
    `,
    [idEstablecimiento, ACTIVE_ORDER_STATES],
  )

  return rows.map((table) => {
    const responsibleUser = table.responsible_user_id
      ? {
          id_usuario: table.responsible_user_id,
          nombres: table.responsible_user_nombres,
          apellidos: table.responsible_user_apellidos,
          username: table.responsible_user_username,
        }
      : null

    return {
      id_mesa: table.id_mesa,
      id: table.id_mesa,
      id_establecimiento: table.id_establecimiento,
      id_zona: table.id_zona,
      zona_nombre: table.zona_nombre || "Sin zona",
      floor: table.zona_nombre || "Sin zona",
      numero: table.numero,
      number: table.numero,
      nombre: table.nombre,
      capacidad: table.capacidad,
      disponibilidad: table.disponibilidad,
      estado: table.estado,
      occupied:
        table.disponibilidad === "OCUPADA" ||
        Number(table.active_order_count) > 0,
      active_order_count: Number(table.active_order_count || 0),
      active_total: Number(table.active_total || 0),
      first_order_at: table.first_order_at,
      last_order_at: table.last_order_at,
      active_orders: table.active_orders || [],
      current_items: table.current_items || [],
      table_service: {
        responsible_user: responsibleUser,
        responsible_order: table.responsible_order_id
          ? {
              id_orden: table.responsible_order_id,
              numero_orden: table.responsible_order_number,
              assigned_at: table.responsible_assigned_at,
            }
          : null,
        active_order_count: Number(table.active_order_count || 0),
        active_total: Number(table.active_total || 0),
        first_order_at: table.first_order_at,
        last_order_at: table.last_order_at,
      },
    }
  })
}

async function getPosMenu(idEstablecimiento) {
  const { rows } = await pool.query(
    `
      select
        p.id_producto,
        p.id_establecimiento,
        p.id_categoria,
        c.nombre as categoria_nombre,
        c.orden_display as categoria_orden,
        p.nombre,
        p.descripcion,
        p.precio_base,
        p.imagen_referencial,
        p.disponibilidad,
        p.popularidad_score,
        p.estado
      from producto p
      inner join categoria c
        on c.id_categoria = p.id_categoria
      where p.id_establecimiento = $1
        and p.estado = true
        and p.disponibilidad = true
        and c.estado = true
      order by
        c.orden_display asc,
        c.nombre asc,
        p.nombre asc;
    `,
    [idEstablecimiento],
  )

  const categoriesMap = new Map()

  rows.forEach((product) => {
    if (!categoriesMap.has(product.id_categoria)) {
      categoriesMap.set(product.id_categoria, {
        id_categoria: product.id_categoria,
        nombre: product.categoria_nombre,
        orden_display: product.categoria_orden,
      })
    }
  })

  const products = rows.map((product) => ({
    id_producto: product.id_producto,
    id: product.id_producto,
    id_establecimiento: product.id_establecimiento,
    id_categoria: product.id_categoria,
    categoria_nombre: product.categoria_nombre,
    category: product.categoria_nombre,
    nombre: product.nombre,
    name: product.nombre,
    descripcion: product.descripcion,
    precio_base: Number(product.precio_base),
    price: Number(product.precio_base),
    imagen_referencial: product.imagen_referencial,
    disponibilidad: product.disponibilidad,
    popularidad_score: product.popularidad_score,
    estado: product.estado,
  }))

  return {
    categories: [
      {
        id_categoria: "all",
        nombre: "Todos",
        orden_display: -1,
      },
      ...Array.from(categoriesMap.values()),
    ],
    products,
  }
}

async function createPosOrder({
  idEstablecimiento,
  idUsuario,
  idMesa,
  observaciones,
  items,
}) {
  const normalizedItems = normalizeOrderItems(items)

  const client = await pool.connect()

  try {
    await client.query("begin")

    const { rows: establishmentRows } = await client.query(
      `
        select igv_porcentaje
        from establecimiento
        where id_establecimiento = $1
          and estado = true
        limit 1;
      `,
      [idEstablecimiento],
    )

    if (establishmentRows.length === 0) {
      throw createHttpError("El establecimiento no existe o se encuentra inactivo.", 404)
    }

    const igvPorcentaje = Number(establishmentRows[0].igv_porcentaje || 0)

    const { rows: tableRows } = await client.query(
      `
        select
          id_mesa,
          numero,
          disponibilidad,
          estado
        from mesa
        where id_mesa = $1
          and id_establecimiento = $2
          and estado = true
        for update;
      `,
      [idMesa, idEstablecimiento],
    )

    if (tableRows.length === 0) {
      throw createHttpError("La mesa no existe o no pertenece al establecimiento.", 404)
    }

    const table = tableRows[0]

    if (BLOCKED_TABLE_STATES.includes(table.disponibilidad)) {
      throw createHttpError(
        `La mesa ${table.numero} no está disponible para registrar comandas.`,
        409,
      )
    }

    const productIds = [...new Set(normalizedItems.map((item) => item.id_producto))]

    const { rows: productRows } = await client.query(
      `
        select
          p.id_producto,
          p.nombre,
          p.precio_base
        from producto p
        inner join categoria c
          on c.id_categoria = p.id_categoria
        where p.id_producto = any($1::uuid[])
          and p.id_establecimiento = $2
          and p.estado = true
          and p.disponibilidad = true
          and c.estado = true;
      `,
      [productIds, idEstablecimiento],
    )

    if (productRows.length !== productIds.length) {
      throw createHttpError(
        "Uno o más productos no existen, están inactivos o no están disponibles.",
        400,
      )
    }

    const productMap = new Map(
      productRows.map((product) => [product.id_producto, product]),
    )

    const calculatedItems = normalizedItems.map((item) => {
    const product = productMap.get(item.id_producto)
    const precioUnitario = Number(product.precio_base)
    const subtotal = precioUnitario * item.cantidad

      return {
        ...item,
        precio_unitario: precioUnitario,
        subtotal,
      }
    })

    const totalConIgv = calculatedItems.reduce(
      (accumulator, item) => accumulator + item.subtotal,
      0,
    )

    const total = Number(totalConIgv.toFixed(2))
    const subtotal = Number((total / (1 + igvPorcentaje / 100)).toFixed(2))
    const igv = Number((total - subtotal).toFixed(2))

    const numeroOrden = await getNextOrderNumber(client, idEstablecimiento)

    const { rows: orderRows } = await client.query(
      `
        insert into orden (
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
          enviada_cocina_at
        )
        values (
          $1,
          $2,
          $3,
          'ABIERTA',
          'SALON',
          $4,
          $5,
          $6,
          $7,
          now(),
          now()
        )
        returning id_orden;
      `,
      [
        idMesa,
        idUsuario,
        numeroOrden,
        subtotal,
        igv,
        total,
        observaciones?.trim() || null,
      ],
    )

    const idOrden = orderRows[0].id_orden

    for (const item of calculatedItems) {
      await client.query(
        `
          insert into item_orden (
            id_orden,
            id_producto,
            cantidad,
            precio_unitario,
            subtotal,
            notas_cocina,
            estado_cocina
          )
          values ($1, $2, $3, $4, $5, $6, 'PENDIENTE');
        `,
        [
          idOrden,
          item.id_producto,
          item.cantidad,
          item.precio_unitario,
          item.subtotal,
          item.notas_cocina,
        ],
      )
    }

    await client.query(
      `
        update mesa
        set disponibilidad = 'OCUPADA',
            updated_at = now()
        where id_mesa = $1
          and id_establecimiento = $2;
      `,
      [idMesa, idEstablecimiento],
    )

    const order = await getOrderById(client, idOrden)

    await client.query("commit")

    return order
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

async function cancelOrderItem({ idItemOrden, idEstablecimiento, cantidadACancelar }) {
  const client = await pool.connect()

  try {
    await client.query("begin")

    const { rows: itemRows } = await client.query(
      `
        select
          io.id_item_orden,
          io.id_orden,
          io.cantidad,
          io.precio_unitario,
          io.estado_cocina,
          o.estado as estado_orden
        from item_orden io
        inner join orden o on o.id_orden = io.id_orden
        inner join usuario u on u.id_usuario = o.id_usuario
        where io.id_item_orden = $1
          and u.id_establecimiento = $2
        for update of io;
      `,
      [idItemOrden, idEstablecimiento],
    )

    if (itemRows.length === 0) {
      throw createHttpError("Ítem de comanda no encontrado.", 404)
    }

    const item = itemRows[0]

    if (item.estado_cocina !== "PENDIENTE") {
      throw createHttpError(
        "Solo se pueden cancelar productos que cocina aún no ha empezado a preparar.",
        409,
      )
    }

    const cantidadOriginal = Number(item.cantidad)
    const cantidadCancelar = Math.min(
      Number(cantidadACancelar) || cantidadOriginal,
      cantidadOriginal,
    )

    if (cantidadCancelar <= 0) {
      throw createHttpError("La cantidad a cancelar debe ser mayor a cero.", 400)
    }

    if (cantidadCancelar >= cantidadOriginal) {
      await client.query(
        `
          update item_orden
          set estado_cocina = 'ANULADO',
              updated_at = now()
          where id_item_orden = $1;
        `,
        [idItemOrden],
      )
    } else {
      const nuevaCantidad = cantidadOriginal - cantidadCancelar
      const nuevoSubtotal = Number(item.precio_unitario) * nuevaCantidad

      await client.query(
        `
          update item_orden
          set cantidad = $2,
              subtotal = $3,
              updated_at = now()
          where id_item_orden = $1;
        `,
        [idItemOrden, nuevaCantidad, nuevoSubtotal],
      )
    }

    const { rows: establishmentRows } = await client.query(
      `
        select igv_porcentaje
        from establecimiento e
        inner join usuario u on u.id_establecimiento = e.id_establecimiento
        inner join orden o on o.id_usuario = u.id_usuario
        where o.id_orden = $1
        limit 1;
      `,
      [item.id_orden],
    )

    const igvPorcentaje = Number(establishmentRows[0]?.igv_porcentaje || 0)

    const { rows: totalsRows } = await client.query(
      `
        select coalesce(sum(subtotal), 0) as total_con_igv
        from item_orden
        where id_orden = $1
          and estado_cocina <> 'ANULADO';
      `,
      [item.id_orden],
    )

    const totalConIgv = Number(totalsRows[0].total_con_igv)
    const total = Number(totalConIgv.toFixed(2))
    const subtotal = Number((total / (1 + igvPorcentaje / 100)).toFixed(2))
    const igv = Number((total - subtotal).toFixed(2))

    await client.query(
      `
        update orden
        set subtotal = $2,
            igv = $3,
            total = $4,
            updated_at = now()
        where id_orden = $1;
      `,
      [item.id_orden, subtotal, igv, total],
    )

    await client.query("commit")

    return { id_orden: item.id_orden, id_item_orden: idItemOrden }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

// ── Enviar a caja ────────────────────────────────────────────────
// Envía TODAS las órdenes activas de la mesa a caja de una vez.
// Regla: todas deben estar ENTREGADA (si alguna sigue en un estado
// previo, se rechaza). La mesa NO se libera aquí — se libera recién
// cuando se registra el pago desde el módulo de Caja.

async function enviarOrdenACaja({ idEstablecimiento, idUsuario, idMesa }) {
  const client = await pool.connect()

  try {
    await client.query("begin")

    const { rows: tableRows } = await client.query(
      `
        select id_mesa, numero
        from mesa
        where id_mesa = $1
          and id_establecimiento = $2
          and estado = true
        for update;
      `,
      [idMesa, idEstablecimiento],
    )

    if (tableRows.length === 0) {
      throw createHttpError("La mesa no existe o no pertenece al establecimiento.", 404)
    }

    const { rows: orderRows } = await client.query(
      `
        select o.id_orden, o.estado
        from orden o
        inner join usuario u
          on u.id_usuario = o.id_usuario
        where o.id_mesa = $1
          and u.id_establecimiento = $2
          and o.estado = any($3::varchar[])
        for update;
      `,
      [idMesa, idEstablecimiento, ACTIVE_ORDER_STATES],
    )

    if (orderRows.length === 0) {
      throw createHttpError("Esta mesa no tiene órdenes activas para enviar a caja.", 409)
    }

    const ordenesNoEntregadas = orderRows.filter((order) => order.estado !== "ENTREGADA")

    if (ordenesNoEntregadas.length > 0) {
      throw createHttpError(
        "Todos los pedidos de la mesa deben estar entregados antes de enviarlos a caja.",
        409,
      )
    }

    const idOrdenes = orderRows.map((order) => order.id_orden)

    await client.query(
      `
        update orden
        set estado = 'ENVIADA_A_CAJA',
            enviada_caja_at = now(),
            updated_at = now()
        where id_orden = any($1::uuid[]);
      `,
      [idOrdenes],
    )

    await client.query("commit")

    return {
      id_mesa: idMesa,
      ordenes_enviadas: idOrdenes,
    }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  ACTIVE_ORDER_STATES,
  createPosOrder,
  getPosMenu,
  getPosTables,
  cancelOrderItem,
  enviarOrdenACaja,
}