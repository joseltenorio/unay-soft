// backend/src/services/sunat.service.js

const { createBusinessError } = require("../utils/userValidation")

// URL base de Decolecta para consulta de RUC
const DECOLECTA_URL = "https://api.decolecta.com/v1/sunat/ruc"

// Token desde .env — nunca hardcodeado
const DECOLECTA_TOKEN = process.env.DECOLECTA_TOKEN

async function consultarRuc(ruc) {
  const response = await fetch(`${DECOLECTA_URL}?numero=${ruc}`, {
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${DECOLECTA_TOKEN}`,
    },
  })

  // 422 = RUC con formato inválido según Decolecta
  if (response.status === 422) {
    throw createBusinessError("El RUC ingresado no es válido.", 422)
  }

  // Cualquier otro error de la API externa
  if (!response.ok) {
    throw createBusinessError("Error al consultar SUNAT. Intente nuevamente.", 502)
  }

  const data = await response.json()

  // Solo devolvemos lo que el frontend necesita
  return {
    ruc:         data.numero_documento,
    razonSocial: data.razon_social,
    estado:      data.estado,
    condicion:   data.condicion,
  }
}

module.exports = { consultarRuc }