// frontend/src/utils/permission.js

export function hasPermission(permissions = [], requiredPermission = "") {
  if (!requiredPermission) {
    return false
  }

  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(permissions = [], requiredPermissions = []) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return false
  }

  return requiredPermissions.some((permission) =>
    permissions.includes(permission),
  )
}

export function hasAllPermissions(permissions = [], requiredPermissions = []) {
  if (!Array.isArray(requiredPermissions) || requiredPermissions.length === 0) {
    return false
  }

  return requiredPermissions.every((permission) =>
    permissions.includes(permission),
  )
}