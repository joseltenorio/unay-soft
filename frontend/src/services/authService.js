// src/services/authService.js

import { apiPrivateRequest, apiRequest } from "./api"
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredModules,
  getStoredPermissions,
  getStoredRefreshToken,
  getStoredUser,
  saveAuthSession,
  updateStoredSession,
  updateStoredUser,
} from "./authStorage"

export async function loginRequest({ identifier, password, remember }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
      remember,
    }),
  })

  saveAuthSession(data, { remember })

  return data
}

export async function getAuthenticatedUser() {
  const data = await apiPrivateRequest("/auth/me")

  updateCurrentSession({
    user: data.user,
    permissions: data.permissions,
    modules: data.modules,
  })

  return data
}

export async function logout() {
  try {
    const token = getStoredAccessToken()

    if (token) {
      await apiPrivateRequest("/auth/logout", {
        method: "POST",
      })
    }
  } catch {
    // Aunque el backend rechace el token por expirado o revocado,
    // la sesión local debe limpiarse igual.
  } finally {
    clearAuthSession()
  }
}

export function logoutLocal() {
  clearAuthSession()
}

export function getToken() {
  return getStoredAccessToken()
}

export function getRefreshToken() {
  return getStoredRefreshToken()
}

export function getCurrentUser() {
  return getStoredUser()
}

export function getCurrentPermissions() {
  return getStoredPermissions()
}

export function getCurrentModules() {
  return getStoredModules()
}

export function updateCurrentSession({ user, permissions = [], modules = [] }) {
  updateStoredSession({ user, permissions, modules })
}

export function updateCurrentUser(user) {
  updateStoredUser(user)
}