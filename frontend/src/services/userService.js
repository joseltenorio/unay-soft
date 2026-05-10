// frontend/src/services/userService.js

import { apiPrivateRequest } from "./api"

export async function getUsers() {
  const data = await apiPrivateRequest("/users")

  return data.users
}

export async function createUser(userData) {
  const data = await apiPrivateRequest("/users", {
    method: "POST",
    body: JSON.stringify(userData),
  })

  return data.user
}

export async function updateUser(idUsuario, userData) {
  const data = await apiPrivateRequest(`/users/${idUsuario}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })

  return data.user
}

export async function updateUserStatus(idUsuario, estado) {
  const data = await apiPrivateRequest(`/users/${idUsuario}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })

  return data.user
}