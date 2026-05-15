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

module.exports = {
  getEstablishmentById,
  updateEstablishment,
}