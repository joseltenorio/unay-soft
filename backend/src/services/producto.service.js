// backend/src/services/producto.service.js
const { pool } = require("../config/database")

async function getProductos(idEstablecimiento) {
  const query = `
    SELECT
      p.id_producto,
      p.id_establecimiento,
      p.id_categoria,
      c.nombre as categoria_nombre,
      p.nombre,
      p.descripcion,
      p.precio_base,
      p.imagen_referencial,
      p.disponibilidad,
      p.popularidad_score,
      p.estado,
      p.created_at,
      p.updated_at,
      COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id_etiqueta', e.id_etiqueta,
            'nombre', e.nombre,
            'color_etiqueta', e.color_etiqueta
          )
        ) FILTER (WHERE e.id_etiqueta IS NOT NULL), '[]'
      ) as etiquetas
    FROM producto p
    JOIN categoria c ON c.id_categoria = p.id_categoria
    LEFT JOIN producto_etiqueta pe ON pe.id_producto = p.id_producto
    LEFT JOIN etiqueta e ON e.id_etiqueta = pe.id_etiqueta
    WHERE p.id_establecimiento = $1
    GROUP BY
      p.id_producto, p.id_establecimiento, p.id_categoria,
      c.nombre, c.orden_display, 
      p.nombre, p.descripcion, p.precio_base,
      p.imagen_referencial, p.disponibilidad, p.popularidad_score,
      p.estado, p.created_at, p.updated_at
    ORDER BY c.orden_display ASC, c.nombre ASC, p.nombre ASC;
  `
  const { rows } = await pool.query(query, [idEstablecimiento])
  return rows
}

async function createProducto(idEstablecimiento, data) {
  const {
    nombre,
    descripcion,
    precio_base,
    id_categoria,
    imagen_referencial,
    disponibilidad = true,
    estado = true,
  } = data

  const catQ = `
    select id_categoria from categoria
    where id_categoria = $1 and id_establecimiento = $2 and estado = true limit 1;
  `
  const cat = await pool.query(catQ, [id_categoria, idEstablecimiento])
  if (cat.rows.length === 0) {
    const error = new Error("La categoría seleccionada no existe o no pertenece al establecimiento.")
    error.statusCode = 400
    throw error
  }

  const insertQ = `
    insert into producto
      (id_establecimiento, id_categoria, nombre, descripcion, precio_base, imagen_referencial, disponibilidad, estado)
    values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning
      id_producto, id_establecimiento, id_categoria, nombre, descripcion,
      precio_base, imagen_referencial, disponibilidad, popularidad_score, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(insertQ, [
    idEstablecimiento,
    id_categoria,
    nombre.trim(),
    descripcion?.trim() || null,
    Number(precio_base),
    imagen_referencial?.trim() || null,
    Boolean(disponibilidad),
    Boolean(estado),
  ])
  return rows[0]
}

async function updateProducto(idEstablecimiento, idProducto, data) {
  const {
    nombre,
    descripcion,
    precio_base,
    id_categoria,
    imagen_referencial,
    disponibilidad = true,
    estado = true,
  } = data

  const existQ = `
    select id_producto from producto
    where id_producto = $1 and id_establecimiento = $2 limit 1;
  `
  const exist = await pool.query(existQ, [idProducto, idEstablecimiento])
  if (exist.rows.length === 0) {
    const error = new Error("El producto no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const catQ = `
    select id_categoria from categoria
    where id_categoria = $1 and id_establecimiento = $2 and estado = true limit 1;
  `
  const cat = await pool.query(catQ, [id_categoria, idEstablecimiento])
  if (cat.rows.length === 0) {
    const error = new Error("La categoría seleccionada no existe o no pertenece al establecimiento.")
    error.statusCode = 400
    throw error
  }

  const updateQ = `
    update producto
    set
      id_categoria = $1,
      nombre = $2,
      descripcion = $3,
      precio_base = $4,
      imagen_referencial = $5,
      disponibilidad = $6,
      estado = $7
    where id_producto = $8 and id_establecimiento = $9
    returning
      id_producto, id_establecimiento, id_categoria, nombre, descripcion,
      precio_base, imagen_referencial, disponibilidad, popularidad_score, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(updateQ, [
    id_categoria,
    nombre.trim(),
    descripcion?.trim() || null,
    Number(precio_base),
    imagen_referencial?.trim() || null,
    Boolean(disponibilidad),
    Boolean(estado),
    idProducto,
    idEstablecimiento,
  ])
  return rows[0]
}

async function deleteProducto(idEstablecimiento, idProducto) {
  const { rows } = await pool.query(
    `DELETE FROM producto 
     WHERE id_producto = $1 AND id_establecimiento = $2
     RETURNING id_producto, nombre`,
    [idProducto, idEstablecimiento]
  )

  if (rows.length === 0) {
    const error = new Error("El producto no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}

async function updateProductoStatus(idEstablecimiento, idProducto, estado) {
  const existQ = `
    select id_producto from producto
    where id_producto = $1 and id_establecimiento = $2 limit 1;
  `
  const exist = await pool.query(existQ, [idProducto, idEstablecimiento])
  if (exist.rows.length === 0) {
    const error = new Error("El producto no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  const updateQ = `
    update producto set estado = $1
    where id_producto = $2 and id_establecimiento = $3
    returning
      id_producto, id_establecimiento, id_categoria, nombre, descripcion,
      precio_base, imagen_referencial, disponibilidad, popularidad_score, estado, created_at, updated_at;
  `
  const { rows } = await pool.query(updateQ, [Boolean(estado), idProducto, idEstablecimiento])
  return rows[0]
}

async function setProductoTags(idEstablecimiento, idProducto, tagIds) {
  // Verifica que el producto pertenece al establecimiento
  const exist = await pool.query(
    `SELECT id_producto FROM producto 
     WHERE id_producto = $1 AND id_establecimiento = $2 LIMIT 1`,
    [idProducto, idEstablecimiento]
  )

  if (exist.rows.length === 0) {
    const error = new Error("El producto no existe o no pertenece al establecimiento.")
    error.statusCode = 404
    throw error
  }

  // Borra las etiquetas actuales y reinserta
  await pool.query(
    `DELETE FROM producto_etiqueta WHERE id_producto = $1`,
    [idProducto]
  )

  if (tagIds.length > 0) {
    const values = tagIds.map((_, i) => `($1, $${i + 2})`).join(", ")
    await pool.query(
      `INSERT INTO producto_etiqueta (id_producto, id_etiqueta) VALUES ${values}`,
      [idProducto, ...tagIds]
    )
  }
}

module.exports = {
  getProductos,
  createProducto,
  updateProducto,
  updateProductoStatus,
  deleteProducto,
  setProductoTags,
}