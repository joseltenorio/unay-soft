// frontend/src/services/sunatService.js

import { apiPrivateRequest } from "./api"

export async function consultarRuc(ruc) {
  const data = await apiPrivateRequest(`/sunat/${ruc}`, {
    method: "GET",
  })

  return data
}