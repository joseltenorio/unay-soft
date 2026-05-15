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