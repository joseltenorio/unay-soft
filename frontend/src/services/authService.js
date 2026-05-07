// src/services/authService.js

import { apiPrivateRequest, apiRequest } from "./api"

const TOKEN_KEY = "umari_token"
const USER_KEY = "umari_user"

function getStorage(remember = false) {
  return remember ? localStorage : sessionStorage
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

  return data
}

export async function getAuthenticatedUser() {
  const data = await apiPrivateRequest("/auth/me")

  return data.user
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function getCurrentUser() {
  const user =
    localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)

  return user ? JSON.parse(user) : null
}

export function updateCurrentUser(user) {
  const hasLocalSession = Boolean(localStorage.getItem(TOKEN_KEY))
  const storage = hasLocalSession ? localStorage : sessionStorage

  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}