// frontend/src/services/establishmentService.js

import { apiPrivateRequest } from "./api"

export async function getEstablishment() {
  const data = await apiPrivateRequest("/establishment")

  return data.establishment
}

export async function updateEstablishment(establishmentData) {
  const data = await apiPrivateRequest("/establishment", {
    method: "PUT",
    body: JSON.stringify(establishmentData),
  })

  return data.establishment
}

export async function getMetodosPago() {
  const data = await apiPrivateRequest("/establishment/metodos-pago")
  return data.metodosPago
}

export async function createMetodoPago(nombre) {
  const data = await apiPrivateRequest("/establishment/metodos-pago", {
    method: "POST",
    body: JSON.stringify({ nombre }),
  })
  return data.metodoPago
}

export async function toggleMetodoPago(idMetodoPago, estado) {
  const data = await apiPrivateRequest(`/establishment/metodos-pago/${idMetodoPago}`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })
  return data.metodoPago
}

