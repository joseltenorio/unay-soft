// src/services/userService.js

import { apiPrivateRequest } from "./api"

export async function getUsers() {
  const data = await apiPrivateRequest("/users")

  return data.users
}