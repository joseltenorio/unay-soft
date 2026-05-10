// frontend/src/services/roleService.js

import { apiPrivateRequest } from "./api"

export async function getRoles() {
  const data = await apiPrivateRequest("/roles")

  return data.roles
}