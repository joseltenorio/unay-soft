// backend/src/services/salon.service.js

const { pool } = require("../config/database")
const ACTIVE_ORDER_STATES = ["ABIERTA", "EN_PREPARACION", "LISTA", "ENTREGADA"]

async function getActiveOrderCount(idEstablecimiento, idMesa) {
  const { rows } = await pool.query(
    `
      select count(*)::int as active_order_count
      from orden o
      join usuario u
        on u.id_usuario = o.id_usuario
      where o.id_mesa = $1
        and u.id_establecimiento = $2
        and o.estado = any($3::varchar[]);
    `,
    [idMesa, idEstablecimiento, ACTIVE_ORDER_STATES]
  )

  return Number(rows[0]?.active_order_count || 0)
}

async function ensureMesaHasNoActiveAccount(idEstablecimiento, idMesa, message) {
  const activeOrderCount = await getActiveOrderCount(idEstablecimiento, idMesa)

  if (activeOrderCount > 0) {
    const error = new Error(message)
    error.statusCode = 409
    throw error
  }
}


async function getMesas(idEstablecimiento) {
  const query = `
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
      where u.id_establecimiento = $1
        and o.estado = any($2::varchar[])
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
      m.created_at,
      m.updated_at,
      coalesce(ao.active_order_count, 0) as active_order_count,
      coalesce(ao.active_total, 0) as active_total,
      ao.first_order_at,
      ao.last_order_at,
      coalesce(ao.orders, '[]'::json) as active_orders,
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
    left join table_responsible tr
      on tr.id_mesa = m.id_mesa
    where m.id_establecimiento = $1
    order by z.nombre asc nulls last, m.numero asc;
  `
  const { rows } = await pool.query(query, [idEstablecimiento, ACTIVE_ORDER_STATES])

  return rows.map((mesa) => {
    const responsibleUser = mesa.responsible_user_id
      ? {
          id_usuario: mesa.responsible_user_id,
          nombres: mesa.responsible_user_nombres,
          apellidos: mesa.responsible_user_apellidos,
          username: mesa.responsible_user_username,
        }
      : null

    return {
      ...mesa,
      active_order_count: Number(mesa.active_order_count || 0),
      active_total: Number(mesa.active_total || 0),
      active_orders: mesa.active_orders || [],
      table_service: {
        responsible_user: responsibleUser,
        responsible_order: mesa.responsible_order_id
          ? {
              id_orden: mesa.responsible_order_id,
              numero_orden: mesa.responsible_order_number,
              assigned_at: mesa.responsible_assigned_at,
            }
          : null,
        active_order_count: Number(mesa.active_order_count || 0),
        active_total: Number(mesa.active_total || 0),
        first_order_at: mesa.first_order_at,
        last_order_at: mesa.last_order_at,
      },
    }
  })
}

async function createMesa(idEstablecimiento, data) {
  const { numero, nombre, capacidad = 4, id_zona, disponibilidad = "LIBRE", estado = true } = data

  const dup = await pool.query(
    `SELECT id_mesa FROM mesa WHERE id_establecimiento = $1 AND numero = $2 LIMIT 1;`,
    [idEstablecimiento, numero]
  )
  if (dup.rows.length > 0) {
    const error = new Error(`Ya existe una mesa con el número ${numero} en el establecimiento.`)
    error.statusCode = 400
    throw error
  }

  if (id_zona) {
    const zonaQ = await pool.query(
      `SELECT id_zona FROM zona WHERE id_zona = $1 AND id_establecimiento = $2 AND estado = true LIMIT 1;`,
      [id_zona, idEstablecimiento]
    )
    if (zonaQ.rows.length === 0) {
      const error = new Error("La zona seleccionada no existe o no pertenece al establecimiento.")
      error.statusCode = 400
      throw error
    }
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO mesa (id_establecimiento, id_zona, numero, nombre, capacidad, disponibilidad, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;`,
      [idEstablecimiento, id_zona || null, numero, nombre?.trim() || null, Number(capacidad), disponibilidad, Boolean(estado)]
    )
    return rows[0]
  } catch (error) {
    if (error.code === "23505") {
      const err = new Error(`Ya existe una mesa con el número ${numero} en el establecimiento.`)
      err.statusCode = 400
      throw err
    }
    throw error
  }
}
 
  async function updateMesa(idEstablecimiento, idMesa, data) {
    const { numero, nombre, capacidad, id_zona, estado } = data

    const exist = await pool.query(
      `SELECT id_mesa FROM mesa WHERE id_mesa = $1 AND id_establecimiento = $2 LIMIT 1;`,
      [idMesa, idEstablecimiento]
    )
    if (exist.rows.length === 0) {
      const error = new Error("La mesa no existe o no pertenece al establecimiento.")
      error.statusCode = 404
      throw error
    }

    const dup = await pool.query(
      `SELECT id_mesa FROM mesa WHERE id_establecimiento = $1 AND numero = $2 AND id_mesa != $3 LIMIT 1;`,
      [idEstablecimiento, numero, idMesa]
    )
    if (dup.rows.length > 0) {
      const error = new Error(`Ya existe otra mesa con el número ${numero} en el establecimiento.`)
      error.statusCode = 400
      throw error
    }

    if (id_zona) {
      const zonaQ = await pool.query(
        `SELECT id_zona FROM zona WHERE id_zona = $1 AND id_establecimiento = $2 AND estado = true LIMIT 1;`,
        [id_zona, idEstablecimiento]
      )
      if (zonaQ.rows.length === 0) {
        const error = new Error("La zona seleccionada no existe o no pertenece al establecimiento.")
        error.statusCode = 400
        throw error
      }
    }

    try {
      const { rows } = await pool.query(
        `UPDATE mesa
        SET numero = $1, nombre = $2, capacidad = $3, id_zona = $4, estado = $5
        WHERE id_mesa = $6 AND id_establecimiento = $7
        RETURNING *;`,
        [numero, nombre?.trim() || null, Number(capacidad), id_zona || null, Boolean(estado), idMesa, idEstablecimiento]
      )
      return rows[0]
    } catch (error) {
      if (error.code === "23505") {
        const err = new Error(`Ya existe otra mesa con el número ${numero} en el establecimiento.`)
        err.statusCode = 400
        throw err
      }
      throw error
    }
  }

async function updateMesaDisponibilidad(idEstablecimiento, idMesa, disponibilidad) {
  const ESTADOS_VALIDOS = ["LIBRE", "OCUPADA", "RESERVADA", "MANTENIMIENTO"]
  if (!ESTADOS_VALIDOS.includes(disponibilidad)) {
    const error = new Error(`Disponibilidad inválida. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}.`)
    error.statusCode = 400
    throw error
  }

  if (disponibilidad !== "OCUPADA") {
    await ensureMesaHasNoActiveAccount(
      idEstablecimiento,
      idMesa,
      "No se puede cambiar la disponibilidad de una mesa con cuenta activa.",
    )
  }

  const { rows } = await pool.query(
    `UPDATE mesa SET disponibilidad = $1
     WHERE id_mesa = $2 AND id_establecimiento = $3
     RETURNING id_mesa, numero, nombre, disponibilidad, estado, updated_at;`,
    [disponibilidad, idMesa, idEstablecimiento]
  )
  if (rows.length === 0) {
    const error = new Error("La mesa no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }
  return rows[0]
}

async function updateMesaStatus(idEstablecimiento, idMesa, estado) {
  if (estado === false) {
    await ensureMesaHasNoActiveAccount(
      idEstablecimiento,
      idMesa,
      "No se puede desactivar una mesa con cuenta activa.",
    )
  }

  const { rows } = await pool.query(
    `UPDATE mesa SET estado = $1
     WHERE id_mesa = $2 AND id_establecimiento = $3
     RETURNING *;`,
    [Boolean(estado), idMesa, idEstablecimiento]
  )
  if (rows.length === 0) {
    const error = new Error("La mesa no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }
  return rows[0]
}

async function deleteMesa(idEstablecimiento, idMesa) {
  await ensureMesaHasNoActiveAccount(
    idEstablecimiento,
    idMesa,
    "No se puede eliminar una mesa con cuenta activa.",
  )

  const { rows } = await pool.query(
    `DELETE FROM mesa WHERE id_mesa = $1 AND id_establecimiento = $2 RETURNING id_mesa, numero, nombre;`,
    [idMesa, idEstablecimiento]
  )
  if (rows.length === 0) {
    const error = new Error("La mesa no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }
  return rows[0]
}

module.exports = {
  getMesas,
  createMesa,
  updateMesa,
  updateMesaDisponibilidad,
  updateMesaStatus,
  deleteMesa,
}