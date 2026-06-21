// frontend/src/services/authStorage.js

const TOKEN_KEY = "umari_token"
const REFRESH_TOKEN_KEY = "umari_refresh_token"
const USER_KEY = "umari_user"
const PERMISSIONS_KEY = "umari_permissions"
const MODULES_KEY = "umari_modules"
const SESSION_KEY = "umari_session"

function getStorage(remember = false) {
  return remember ? localStorage : sessionStorage
}

function hasStoredSession(storage) {
  return Boolean(storage.getItem(TOKEN_KEY) || storage.getItem(REFRESH_TOKEN_KEY))
}

export function getActiveStorage() {
  if (hasStoredSession(localStorage)) {
    return localStorage
  }

  return sessionStorage
}

function getInactiveStorage(activeStorage) {
  return activeStorage === localStorage ? sessionStorage : localStorage
}

export function saveAuthSession(
  {
    token,
    accessToken,
    refreshToken,
    user,
    permissions = [],
    modules = [],
    session = null,
  },
  { remember = false, preserveStorage = false } = {},
) {
  const storage = preserveStorage ? getActiveStorage() : getStorage(remember)
  const accessTokenValue = accessToken || token

  if (accessTokenValue) {
    storage.setItem(TOKEN_KEY, accessTokenValue)
  }

  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user))
  }

  storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions || []))
  storage.setItem(MODULES_KEY, JSON.stringify(modules || []))

  if (session) {
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  if (!preserveStorage) {
    const inactiveStorage = getInactiveStorage(storage)

    inactiveStorage.removeItem(TOKEN_KEY)
    inactiveStorage.removeItem(REFRESH_TOKEN_KEY)
    inactiveStorage.removeItem(USER_KEY)
    inactiveStorage.removeItem(PERMISSIONS_KEY)
    inactiveStorage.removeItem(MODULES_KEY)
    inactiveStorage.removeItem(SESSION_KEY)
  }
}

export function updateStoredSession({ user, permissions = [], modules = [] }) {
  const storage = getActiveStorage()

  if (user) {
    storage.setItem(USER_KEY, JSON.stringify(user))
  }

  storage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions || []))
  storage.setItem(MODULES_KEY, JSON.stringify(modules || []))
}

export function updateStoredUser(user) {
  const storage = getActiveStorage()

  storage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredRefreshToken() {
  return (
    localStorage.getItem(REFRESH_TOKEN_KEY) ||
    sessionStorage.getItem(REFRESH_TOKEN_KEY)
  )
}

export function getStoredUser() {
  const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)

  return user ? JSON.parse(user) : null
}

export function getStoredPermissions() {
  const permissions =
    localStorage.getItem(PERMISSIONS_KEY) ||
    sessionStorage.getItem(PERMISSIONS_KEY)

  return permissions ? JSON.parse(permissions) : []
}

export function getStoredModules() {
  const modules =
    localStorage.getItem(MODULES_KEY) || sessionStorage.getItem(MODULES_KEY)

  return modules ? JSON.parse(modules) : []
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PERMISSIONS_KEY)
  localStorage.removeItem(MODULES_KEY)
  localStorage.removeItem(SESSION_KEY)

  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(PERMISSIONS_KEY)
  sessionStorage.removeItem(MODULES_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}