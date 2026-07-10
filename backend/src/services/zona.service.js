// backend/src/services/zona.service.js

const { pool } = require("../config/database")

async function getZonas(idEstablecimiento) {
  const query = `
    SELECT
      z.id_zona,
      z.id_establecimiento,
      z.nombre,
      z.descripcion,
      z.capacidad,
      z.estado,
      z.created_at,
      z.updated_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id_mesa',       m.id_mesa,
            'numero',        m.numero,
            'nombre',        m.nombre,
            'capacidad',     m.capacidad,
            'disponibilidad', m.disponibilidad,
            'estado',        m.estado
          ) ORDER BY m.numero ASC
        ) FILTER (WHERE m.id_mesa IS NOT NULL), '[]'
      ) AS mesas
    FROM zona z
    LEFT JOIN mesa m
      ON m.id_zona = z.id_zona
     AND m.id_establecimiento = z.id_establecimiento
    WHERE z.id_establecimiento = $1
    GROUP BY z.id_zona
    ORDER BY z.nombre ASC;
  `
  const { rows } = await pool.query(query, [idEstablecimiento])
  return rows
}

async function createZona(idEstablecimiento, data) {
  const { nombre, descripcion, capacidad, estado = true } = data

  const dupQ = `
    SELECT id_zona FROM zona
    WHERE id_establecimiento = $1 AND LOWER(nombre) = LOWER($2) LIMIT 1;
  `
  const dup = await pool.query(dupQ, [idEstablecimiento, nombre.trim()])
  if (dup.rows.length > 0) {
    const error = new Error("Ya existe una zona con ese nombre en el establecimiento.")
    error.statusCode = 400
    throw error
  }

  const { rows } = await pool.query(
    `INSERT INTO zona (id_establecimiento, nombre, descripcion, capacidad, estado)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *;`,
    [idEstablecimiento, nombre.trim(), descripcion?.trim() || null, capacidad || null, Boolean(estado)]
  )
  return rows[0]
}

async function updateZona(idEstablecimiento, idZona, data) {
  const { nombre, descripcion, capacidad, estado } = data

  const exist = await pool.query(
    `SELECT id_zona FROM zona WHERE id_zona = $1 AND id_establecimiento = $2 LIMIT 1;`,
    [idZona, idEstablecimiento]
  )
  if (exist.rows.length === 0) {
    const error = new Error("La zona no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const dup = await pool.query(
    `SELECT id_zona FROM zona
     WHERE id_establecimiento = $1 AND LOWER(nombre) = LOWER($2) AND id_zona != $3 LIMIT 1;`,
    [idEstablecimiento, nombre.trim(), idZona]
  )
  if (dup.rows.length > 0) {
    const error = new Error("Ya existe otra zona con ese nombre en el establecimiento.")
    error.statusCode = 400
    throw error
  }

  const { rows } = await pool.query(
    `UPDATE zona
     SET nombre = $1, descripcion = $2, capacidad = $3, estado = $4
     WHERE id_zona = $5 AND id_establecimiento = $6
     RETURNING *;`,
    [nombre.trim(), descripcion?.trim() || null, capacidad || null, Boolean(estado), idZona, idEstablecimiento]
  )
  return rows[0]
}

async function updateZonaStatus(idEstablecimiento, idZona, estado) {
  const exist = await pool.query(
    `SELECT id_zona FROM zona WHERE id_zona = $1 AND id_establecimiento = $2 LIMIT 1;`,
    [idZona, idEstablecimiento]
  )
  if (exist.rows.length === 0) {
    const error = new Error("La zona no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const { rows } = await pool.query(
    `UPDATE zona SET estado = $1 WHERE id_zona = $2 AND id_establecimiento = $3 RETURNING *;`,
    [Boolean(estado), idZona, idEstablecimiento]
  )
  return rows[0]
}

async function deleteZona(idEstablecimiento, idZona) {
  // Desvincular mesas antes de eliminar (SET NULL por FK, pero lo hacemos explícito)
  await pool.query(
    `UPDATE mesa SET id_zona = NULL WHERE id_zona = $1 AND id_establecimiento = $2;`,
    [idZona, idEstablecimiento]
  )

  const { rows } = await pool.query(
    `DELETE FROM zona WHERE id_zona = $1 AND id_establecimiento = $2 RETURNING id_zona, nombre;`,
    [idZona, idEstablecimiento]
  )
  if (rows.length === 0) {
    const error = new Error("La zona no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }
  return rows[0]
}

module.exports = {
  getZonas,
  createZona,
  updateZona,
  updateZonaStatus,
  deleteZona,
}