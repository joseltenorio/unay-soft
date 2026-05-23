// backend/src/services/categoria.service.js

const { pool } = require("../config/database")

async function getCategorias(idEstablecimiento) {
  const query = `
    select
      id_categoria,
      id_establecimiento,
      nombre,
      descripcion,
      orden_display,
      estado,
      created_at,
      updated_at
    from categoria
    where id_establecimiento = $1
    order by orden_display asc, nombre asc;
  `
  const { rows } = await pool.query(query, [idEstablecimiento])
  return rows
}

async function createCategoria(idEstablecimiento, data) {
  const { nombre, descripcion, orden_display = 0 } = data

  const dupQ = `
    select id_categoria from categoria
    where lower(nombre) = lower($1) and id_establecimiento = $2
    limit 1;
  `
  const dup = await pool.query(dupQ, [nombre.trim(), idEstablecimiento])
  if (dup.rows.length > 0) {
    const error = new Error("Ya existe una categoría con ese nombre.")
    error.statusCode = 409
    throw error
  }

  const insertQ = `
    insert into categoria (id_establecimiento, nombre, descripcion, orden_display, estado)
    values ($1, $2, $3, $4, true)
    returning
      id_categoria, id_establecimiento, nombre, descripcion, orden_display, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(insertQ, [
    idEstablecimiento,
    nombre.trim(),
    descripcion?.trim() || null,
    Number(orden_display) || 0,
  ])
  return rows[0]
}

async function updateCategoria(idEstablecimiento, idCategoria, data) {
  const { nombre, descripcion, orden_display = 0, estado = true } = data

  const existQ = `
    select id_categoria from categoria
    where id_categoria = $1 and id_establecimiento = $2 limit 1;
  `
  const exist = await pool.query(existQ, [idCategoria, idEstablecimiento])
  if (exist.rows.length === 0) {
    const error = new Error("La categoría no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const dupQ = `
    select id_categoria from categoria
    where lower(nombre) = lower($1)
      and id_establecimiento = $2
      and id_categoria <> $3
    limit 1;
  `
  const dup = await pool.query(dupQ, [nombre.trim(), idEstablecimiento, idCategoria])
  if (dup.rows.length > 0) {
    const error = new Error("Ya existe otra categoría con ese nombre.")
    error.statusCode = 409
    throw error
  }

  const updateQ = `
    update categoria
    set nombre = $1, descripcion = $2, orden_display = $3, estado = $4
    where id_categoria = $5 and id_establecimiento = $6
    returning
      id_categoria, id_establecimiento, nombre, descripcion, orden_display, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(updateQ, [
    nombre.trim(),
    descripcion?.trim() || null,
    Number(orden_display) || 0,
    Boolean(estado),
    idCategoria,
    idEstablecimiento,
  ])
  return rows[0]
}
async function deleteCategoria(idEstablecimiento, idCategoria) {
  // Verifica que no tenga productos activos
  const { rows: productos } = await pool.query(
    `SELECT COUNT(*) FROM producto 
     WHERE id_categoria = $1 AND estado = true`,
    [idCategoria]
  )

  if (parseInt(productos[0].count) > 0) {
    const error = new Error("No puedes eliminar una categoría con productos activos.")
    error.statusCode = 409
    throw error
  }

  const { rows } = await pool.query(
    `DELETE FROM categoria 
     WHERE id_categoria = $1 AND id_establecimiento = $2
     RETURNING id_categoria, nombre`,
    [idCategoria, idEstablecimiento]
  )

  if (rows.length === 0) {
    const error = new Error("La categoría no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}

async function updateCategoriaStatus(idEstablecimiento, idCategoria, estado) {
  const existQ = `
    select id_categoria from categoria
    where id_categoria = $1 and id_establecimiento = $2 limit 1;
  `
  const exist = await pool.query(existQ, [idCategoria, idEstablecimiento])
  if (exist.rows.length === 0) {
    const error = new Error("La categoría no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const updateQ = `
    update categoria set estado = $1
    where id_categoria = $2 and id_establecimiento = $3
    returning
      id_categoria, id_establecimiento, nombre, descripcion, orden_display, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(updateQ, [Boolean(estado), idCategoria, idEstablecimiento])
  return rows[0]
}

module.exports = {
  getCategorias,
  createCategoria,
  updateCategoria,
  updateCategoriaStatus,
  deleteCategoria
}