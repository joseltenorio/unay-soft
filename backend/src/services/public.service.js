// backend/src/services/public.service.js
const { pool } = require("../config/database")

async function getCartaPublica(idEstablecimiento) {
  // Verifica que el establecimiento exista y esté activo
  const estQ = await pool.query(
    `SELECT id_establecimiento, nombre_comercial, logo_url, moneda_simbolo
     FROM establecimiento
     WHERE id_establecimiento = $1 AND estado = true LIMIT 1`,
    [idEstablecimiento]
  )
  if (estQ.rows.length === 0) {
    const error = new Error("Establecimiento no encontrado.")
    error.statusCode = 404
    throw error
  }

  // Trae categorías activas con sus productos disponibles y activos
  const categoriasQ = await pool.query(
    `SELECT
       c.id_categoria,
       c.nombre,
       c.descripcion,
       c.orden_display,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id_producto',       p.id_producto,
             'nombre',            p.nombre,
             'descripcion',       p.descripcion,
             'precio_base',       p.precio_base,
             'imagen_referencial', p.imagen_referencial,
             'etiquetas',         (
               SELECT COALESCE(
                 JSON_AGG(
                   JSON_BUILD_OBJECT(
                     'nombre',         e.nombre,
                     'color_etiqueta', e.color_etiqueta
                   )
                 ), '[]'
               )
               FROM producto_etiqueta pe
               JOIN etiqueta e ON e.id_etiqueta = pe.id_etiqueta
               WHERE pe.id_producto = p.id_producto
             )
           ) ORDER BY p.nombre ASC
         ) FILTER (WHERE p.id_producto IS NOT NULL), '[]'
       ) AS productos
     FROM categoria c
     LEFT JOIN producto p
       ON p.id_categoria = c.id_categoria
       AND p.estado = true          -- CA5: solo activos
       AND p.disponibilidad = true  -- CA5: solo disponibles
     WHERE c.id_establecimiento = $1
       AND c.estado = true          -- CA2: solo categorías activas
     GROUP BY c.id_categoria
     ORDER BY c.orden_display ASC, c.nombre ASC`,
    [idEstablecimiento]
  )

  return {
    establecimiento: estQ.rows[0],
    categorias: categoriasQ.rows,
  }
}

module.exports = { getCartaPublica}