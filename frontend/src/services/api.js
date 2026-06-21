// frontend/src/services/api.js

import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredRefreshToken,
  saveAuthSession,
} from "./authStorage"

const API_URL = import.meta.env.VITE_API_URL

async function parseResponse(response) {
  return response.json().catch(() => null)
}

function buildHeaders(options = {}, token = null) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken()

  if (!refreshToken) {
    throw new Error("No existe refresh token para renovar la sesión.")
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ refreshToken }),
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    clearAuthSession()
    throw new Error(data?.message || "No se pudo renovar la sesión.")
  }

  saveAuthSession(data, { preserveStorage: true })

  return data.accessToken || data.token
}

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`

  const response = await fetch(url, {
    headers: buildHeaders(options),
    ...options,
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    throw new Error(data?.message || "Error en la petición al servidor.")
  }

  return data
}

export async function apiPrivateRequest(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`
  const token = getStoredAccessToken()

  const response = await fetch(url, {
    headers: buildHeaders(options, token),
    ...options,
  })

  const data = await parseResponse(response)

  if (response.ok) {
    return data
  }

  if (response.status !== 401) {
    throw new Error(data?.message || "Error en la petición al servidor.")
  }

  const newAccessToken = await refreshAccessToken()

  const retryResponse = await fetch(url, {
    headers: buildHeaders(options, newAccessToken),
    ...options,
  })

  const retryData = await parseResponse(retryResponse)

  if (!retryResponse.ok) {
    if (retryResponse.status === 401) {
      clearAuthSession()
    }

    throw new Error(retryData?.message || "Error en la petición al servidor.")
  }

  return retryData
}