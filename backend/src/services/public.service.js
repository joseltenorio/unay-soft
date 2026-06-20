// backend/src/services/public.service.js
const { pool } = require("../config/database")
const { getEstablishmentBySlug } = require("./establishment.service")

async function getCartaPublica(slug) {
  const est = await getEstablishmentBySlug(slug)

  const categoriasQ = await pool.query(
    `SELECT
       c.id_categoria,
       c.nombre,
       c.descripcion,
       c.orden_display,
       COALESCE(
         JSON_AGG(
           JSON_BUILD_OBJECT(
             'id_producto',        p.id_producto,
             'nombre',             p.nombre,
             'descripcion',        p.descripcion,
             'precio_base',        p.precio_base,
             'imagen_referencial', p.imagen_referencial,
             'etiquetas',          (
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
       AND p.estado = true
       AND p.disponibilidad = true
     WHERE c.id_establecimiento = $1
       AND c.estado = true
     GROUP BY c.id_categoria
     ORDER BY c.orden_display ASC, c.nombre ASC`,
    [est.id_establecimiento]
  )

  return {
    establecimiento: est,
    categorias: categoriasQ.rows,
  }
}

async function getOrCreateQR(idEstablecimiento, baseUrl, slug) {
  const urlDestino = `${baseUrl}/carta/${slug}`

  const existing = await pool.query(
    `SELECT id_codigo_qr, url_destino, imagen_qr
     FROM codigo_qr
     WHERE id_establecimiento = $1
       AND tipo = 'CARTA_GENERAL'
       AND estado = true
       AND id_mesa IS NULL
     LIMIT 1`,
    [idEstablecimiento]
  )

  if (existing.rows.length > 0) {
    const qrActual = existing.rows[0]
    // Si el slug cambió, actualiza la URL y regenera la imagen
    if (qrActual.url_destino !== urlDestino) {
      const { rows } = await pool.query(
        `UPDATE codigo_qr
         SET url_destino = $1, imagen_qr = NULL
         WHERE id_codigo_qr = $2
         RETURNING id_codigo_qr, url_destino, imagen_qr`,
        [urlDestino, qrActual.id_codigo_qr]
      )
      return rows[0]
    }
    return qrActual
  }

  // No existe — crea nuevo
  const { rows } = await pool.query(
    `INSERT INTO codigo_qr (id_establecimiento, tipo, url_destino, estado)
     VALUES ($1, 'CARTA_GENERAL', $2, true)
     RETURNING id_codigo_qr, url_destino, imagen_qr`,
    [idEstablecimiento, urlDestino]
  )
  return rows[0]
}

async function saveQRImagen(idCodigoQr, imagenBase64) {
  const { rows } = await pool.query(
    `UPDATE codigo_qr
     SET imagen_qr = $1
     WHERE id_codigo_qr = $2
     RETURNING id_codigo_qr, url_destino, imagen_qr`,
    [imagenBase64, idCodigoQr]
  )
  return rows[0]
}

module.exports = { getCartaPublica, getOrCreateQR, saveQRImagen }