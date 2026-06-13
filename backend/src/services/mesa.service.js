// backend/src/services/salon.service.js

const { pool } = require("../config/database")

async function getMesas(idEstablecimiento) {
  const query = `
    SELECT
      m.id_mesa,
      m.id_establecimiento,
      m.id_zona,
      z.nombre AS zona_nombre,
      m.numero,
      m.nombre,
      m.capacidad,
      m.disponibilidad,
      m.estado,
      m.created_at,
      m.updated_at
    FROM mesa m
    LEFT JOIN zona z ON z.id_zona = m.id_zona
    WHERE m.id_establecimiento = $1
    ORDER BY z.nombre ASC NULLS LAST, m.numero ASC;
  `
  const { rows } = await pool.query(query, [idEstablecimiento])
  return rows
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

  const { rows } = await pool.query(
    `INSERT INTO mesa (id_establecimiento, id_zona, numero, nombre, capacidad, disponibilidad, estado)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *;`,
    [idEstablecimiento, id_zona || null, numero, nombre?.trim() || null, Number(capacidad), disponibilidad, Boolean(estado)]
  )
  return rows[0]
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

  const { rows } = await pool.query(
    `UPDATE mesa
     SET numero = $1, nombre = $2, capacidad = $3, id_zona = $4, estado = $5
     WHERE id_mesa = $6 AND id_establecimiento = $7
     RETURNING *;`,
    [numero, nombre?.trim() || null, Number(capacidad), id_zona || null, Boolean(estado), idMesa, idEstablecimiento]
  )
  return rows[0]
}

async function updateMesaDisponibilidad(idEstablecimiento, idMesa, disponibilidad) {
  const ESTADOS_VALIDOS = ["LIBRE", "OCUPADA", "RESERVADA", "MANTENIMIENTO"]
  if (!ESTADOS_VALIDOS.includes(disponibilidad)) {
    const error = new Error(`Disponibilidad inválida. Valores permitidos: ${ESTADOS_VALIDOS.join(", ")}.`)
    error.statusCode = 400
    throw error
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