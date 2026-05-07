// src/services/authService.js

import { apiPrivateRequest, apiRequest } from "./api"

const TOKEN_KEY = "umari_token"
const USER_KEY = "umari_user"
const PERMISSIONS_KEY = "umari_permissions"
const MODULES_KEY = "umari_modules"

function getStorage(remember = false) {
  return remember ? localStorage : sessionStorage
}

function getActiveStorage() {
  return localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
}

export async function loginRequest({ identifier, password, remember }) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      identifier,
      password,
    }),
  })

  const storage = getStorage(remember)

  storage.setItem(TOKEN_KEY, data.token)
  storage.setItem(USER_KEY, JSON.stringify(data.user))

  const otherStorage = remember ? sessionStorage : localStorage
  otherStorage.removeItem(TOKEN_KEY)
  otherStorage.removeItem(USER_KEY)
  otherStorage.removeItem(PERMISSIONS_KEY)
  otherStorage.removeItem(MODULES_KEY)

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

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  const user =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)

  return user ? JSON.parse(user) : null
}

export function getCurrentPermissions() {
  const permissions =
    localStorage.getItem(PERMISSIONS_KEY) ||
    sessionStorage.getItem(PERMISSIONS_KEY)

  return permissions ? JSON.parse(permissions) : []
}

export function getCurrentModules() {
  const modules =
    localStorage.getItem(MODULES_KEY) || sessionStorage.getItem(MODULES_KEY)

  return modules ? JSON.parse(modules) : []
}

export function updateCurrentSession({ user, permissions = [], modules = [] }) {
  const storage = getActiveStorage()

  storage.setItem(USER_KEY, JSON.stringify(user))
  storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
  storage.setItem(MODULES_KEY, JSON.stringify(modules))
}

export function updateCurrentUser(user) {
  const storage = getActiveStorage()

  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(MODULES_KEY)

  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(PERMISSIONS_KEY)
  sessionStorage.removeItem(MODULES_KEY)
}