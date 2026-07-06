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

async function getMetodosPagoByEstablishment(idEstablecimiento) {
  const query = `
    select
      id_metodo_pago,
      id_establecimiento,
      nombre,
      estado,
      created_at,
      updated_at
    from metodo_pago
    where id_establecimiento = $1
    order by created_at;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows
}

async function createMetodoPago(idEstablecimiento, nombre) {
  const query = `
    insert into metodo_pago (
      id_establecimiento,
      nombre
    )
    values ($1, $2)
    returning
      id_metodo_pago,
      id_establecimiento,
      nombre,
      estado,
      created_at,
      updated_at;
  `

  try {
    const { rows } = await pool.query(query, [
      idEstablecimiento,
      nombre.trim(),
    ])

    return rows[0]
  } catch (error) {
    if (error.code === "23505") {
      const e = new Error("Ya existe un método de pago con ese nombre.")
      e.statusCode = 409
      throw e
    }

    throw error
  }
}

async function toggleMetodoPago(
  idEstablecimiento,
  idMetodoPago,
  estado,
) {
  const query = `
    update metodo_pago
    set
      estado = $1,
      updated_at = now()
    where
      id_metodo_pago = $2
      and id_establecimiento = $3
    returning
      id_metodo_pago,
      id_establecimiento,
      nombre,
      estado,
      created_at,
      updated_at;
  `

  const { rows } = await pool.query(query, [
    estado,
    idMetodoPago,
    idEstablecimiento,
  ])

  if (rows.length === 0) {
    const error = new Error("El método de pago no existe.")
    error.statusCode = 404
    throw error
  }

  return rows[0]
}

async function deleteMetodoPago(
  idEstablecimiento,
  idMetodoPago,
) {
  const paymentQuery = `
    select 1
    from pago
    where id_metodo_pago = $1
    limit 1;
  `

  const paymentResult = await pool.query(paymentQuery, [
    idMetodoPago,
  ])

  if (paymentResult.rows.length > 0) {
    const error = new Error(
      "No se puede eliminar porque el método de pago ya fue utilizado."
    )
    error.statusCode = 409
    throw error
  }

    const deleteQuery = `
    delete
    from metodo_pago
    where
      id_metodo_pago = $1
      and id_establecimiento = $2
    returning id_metodo_pago;
  `

  const { rows } = await pool.query(deleteQuery, [
    idMetodoPago,
    idEstablecimiento,
  ])

  if (rows.length === 0) {
    const error = new Error("El método de pago no existe.")
    error.statusCode = 404
    throw error
  }
}

module.exports = {
  getEstablishmentById,
  updateEstablishment,
  updateEstablishmentLogo,
  getMetodosPagoByEstablishment,
  createMetodoPago,
  toggleMetodoPago,
  deleteMetodoPago
}