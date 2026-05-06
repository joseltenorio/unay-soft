// src/services/api.js

const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || "Error en la petición al servidor.")
  }

  return data
}

export async function apiPrivateRequest(endpoint, options = {}) {
  const token =
    localStorage.getItem("umari_token") || sessionStorage.getItem("umari_token")

  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    ...options,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || "Error en la petición al servidor.")
  }

  return data
}