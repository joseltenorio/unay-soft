// backend/src/services/public.service.js

const { pool } = require("../config/database")

const QR_TYPE_CARTA_GENERAL = "CARTA_GENERAL"

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || "http://localhost:5173").replace(/\/+$/, "")
}

function buildCartaUrl(baseUrl, idEstablecimiento) {
  return `${normalizeBaseUrl(baseUrl)}/carta/${idEstablecimiento}`
}

async function getCartaPublica(idEstablecimiento) {
  const establishmentQuery = `
    select
      id_establecimiento,
      nombre_comercial,
      logo_url,
      moneda_simbolo
    from establecimiento
    where id_establecimiento = $1
      and estado = true
    limit 1;
  `

  const establishmentResult = await pool.query(establishmentQuery, [
    idEstablecimiento,
  ])

  if (establishmentResult.rows.length === 0) {
    const error = new Error("Establecimiento no encontrado.")
    error.statusCode = 404
    throw error
  }

  const categoriesQuery = `
    select
      c.id_categoria,
      c.nombre,
      c.descripcion,
      c.orden_display,
      coalesce(
        json_agg(
          json_build_object(
            'id_producto', p.id_producto,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio_base', p.precio_base,
            'imagen_referencial', p.imagen_referencial,
            'etiquetas', (
              select coalesce(
                json_agg(
                  json_build_object(
                    'nombre', e.nombre,
                    'color_etiqueta', e.color_etiqueta
                  )
                ),
                '[]'
              )
              from producto_etiqueta pe
              join etiqueta e
                on e.id_etiqueta = pe.id_etiqueta
              where pe.id_producto = p.id_producto
            )
          )
          order by p.nombre asc
        ) filter (where p.id_producto is not null),
        '[]'
      ) as productos
    from categoria c
    left join producto p
      on p.id_categoria = c.id_categoria
     and p.estado = true
     and p.disponibilidad = true
    where c.id_establecimiento = $1
      and c.estado = true
    group by c.id_categoria
    order by c.orden_display asc, c.nombre asc;
  `

  const categoriesResult = await pool.query(categoriesQuery, [idEstablecimiento])

  return {
    establecimiento: establishmentResult.rows[0],
    categorias: categoriesResult.rows,
  }
}

async function getOrCreateQR(idEstablecimiento, baseUrl) {
  const urlDestino = buildCartaUrl(baseUrl, idEstablecimiento)

  const existingQuery = `
    select
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr
    from codigo_qr
    where id_establecimiento = $1
      and tipo = $2
      and estado = true
    order by created_at desc
    limit 1;
  `

  const existingResult = await pool.query(existingQuery, [
    idEstablecimiento,
    QR_TYPE_CARTA_GENERAL,
  ])

  if (existingResult.rows.length > 0) {
    const existingQr = existingResult.rows[0]

    if (existingQr.url_destino === urlDestino) {
      return existingQr
    }

    const updateQuery = `
      update codigo_qr
      set
        url_destino = $1,
        imagen_qr = null,
        updated_at = now()
      where id_codigo_qr = $2
        and estado = true
      returning
        id_codigo_qr,
        id_establecimiento,
        tipo,
        url_destino,
        imagen_qr;
    `

    const updateResult = await pool.query(updateQuery, [
      urlDestino,
      existingQr.id_codigo_qr,
    ])

    return updateResult.rows[0]
  }

  const insertQuery = `
    insert into codigo_qr (
      id_establecimiento,
      tipo,
      url_destino
    )
    values ($1, $2, $3)
    returning
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr;
  `

  const insertResult = await pool.query(insertQuery, [
    idEstablecimiento,
    QR_TYPE_CARTA_GENERAL,
    urlDestino,
  ])

  return insertResult.rows[0]
}

async function saveQRImagen(idCodigoQr, imagenBase64) {
  const updateQuery = `
    update codigo_qr
    set
      imagen_qr = $1,
      updated_at = now()
    where id_codigo_qr = $2
      and estado = true
    returning
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr;
  `

  const updateResult = await pool.query(updateQuery, [
    imagenBase64,
    idCodigoQr,
  ])

  if (updateResult.rows.length === 0) {
    const error = new Error("No se pudo actualizar la imagen del QR.")
    error.statusCode = 404
    throw error
  }

  return updateResult.rows[0]
}

module.exports = {
  getCartaPublica,
  getOrCreateQR,
  saveQRImagen,
}