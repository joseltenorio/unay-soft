// backend/src/services/establishment.service.js

const { pool } = require("../config/database")

async function getEstablishmentById(idEstablecimiento) {
  const query = `
    select
      id_establecimiento,
      nombre_comercial,
      razon_social,
      ruc,
      direccion,
      telefono,
      email,
      logo_url,
      igv_porcentaje,
      moneda_codigo,
      moneda_simbolo,
      slug,
      estado,
      created_at,
      updated_at
    from establecimiento
    where id_establecimiento = $1
    limit 1;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  if (rows.length === 0) {
    const error = new Error("El establecimiento no existe.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}

async function updateEstablishment(idEstablecimiento, establishmentData) {
  const {
    nombre_comercial,
    razon_social,
    ruc,
    direccion,
    telefono,
    email,
    logo_url,
    igv_porcentaje,
    moneda_codigo,
    moneda_simbolo,
  } = establishmentData

  const normalizedRuc = ruc.trim()
  const normalizedEmail = email?.trim()?.toLowerCase() || null
  const normalizedCurrencyCode = moneda_codigo?.trim()?.toUpperCase() || "PEN"
  const normalizedCurrencySymbol = moneda_simbolo?.trim() || "S/."

  const query = `
    update establecimiento
    set
      nombre_comercial = $1,
      razon_social = $2,
      ruc = $3,
      direccion = $4,
      telefono = $5,
      email = $6,
      logo_url = $7,
      igv_porcentaje = $8,
      moneda_codigo = $9,
      moneda_simbolo = $10,
      updated_at = now()
    where id_establecimiento = $11
    returning
      id_establecimiento,
      nombre_comercial,
      razon_social,
      ruc,
      direccion,
      telefono,
      email,
      logo_url,
      igv_porcentaje,
      moneda_codigo,
      moneda_simbolo,
      slug,
      estado,
      created_at,
      updated_at;
  `

  const values = [
    nombre_comercial.trim(),
    razon_social.trim(),
    normalizedRuc,
    direccion.trim(),
    telefono?.trim() || null,
    normalizedEmail,
    logo_url?.trim() || null,
    Number(igv_porcentaje),
    normalizedCurrencyCode,
    normalizedCurrencySymbol,
    idEstablecimiento,
  ]

  const { rows } = await pool.query(query, values)

  if (rows.length === 0) {
    const error = new Error("El establecimiento no existe.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}


async function updateEstablishmentLogo(idEstablecimiento, logoUrl) {
  const query = `
    update establecimiento
    set
      logo_url = $1,
      updated_at = now()
    where id_establecimiento = $2
    returning logo_url;
  `

  const { rows } = await pool.query(query, [logoUrl, idEstablecimiento])

  if (rows.length === 0) {
    const error = new Error("El establecimiento no existe.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}

// Busca establecimiento por slug (para carta pública)
async function getEstablishmentBySlug(slug) {
  const { rows } = await pool.query(
    `SELECT id_establecimiento, nombre_comercial, logo_url, moneda_simbolo, slug
     FROM establecimiento
     WHERE slug = $1 AND estado = true
     LIMIT 1`,
    [slug]
  )
  if (rows.length === 0) {
    const error = new Error("Establecimiento no encontrado.")
    error.statusCode = 404
    throw error
  }
  return rows[0]
}

// Actualiza el slug (lo llama editEstablishment)
async function updateEstablishmentSlug(idEstablecimiento, slug) {
  // Verifica que el slug no esté en uso por otro establecimiento
  const { rows: existing } = await pool.query(
    `SELECT id_establecimiento FROM establecimiento 
     WHERE slug = $1 AND id_establecimiento != $2`,
    [slug, idEstablecimiento]
  )
  if (existing.length > 0) {
    const error = new Error("El slug ya está en uso por otro establecimiento.")
    error.statusCode = 409
    throw error
  }

  const { rows } = await pool.query(
    `UPDATE establecimiento SET slug = $1, updated_at = now()
     WHERE id_establecimiento = $2
     RETURNING slug`,
    [slug, idEstablecimiento]
  )
  return rows[0]
}
module.exports = {
  getEstablishmentById,
  getEstablishmentBySlug,  
  updateEstablishment,
  updateEstablishmentSlug,
  updateEstablishmentLogo,
}
