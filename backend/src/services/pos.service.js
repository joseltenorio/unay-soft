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

    const subtotal = calculatedItems.reduce(
      (accumulator, item) => accumulator + item.subtotal,
      0,
    )

    const igv = Number(((subtotal * igvPorcentaje) / 100).toFixed(2))
    const total = Number((subtotal + igv).toFixed(2))

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

module.exports = {
  ACTIVE_ORDER_STATES,
  createPosOrder,
}