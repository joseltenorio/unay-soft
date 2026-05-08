// frontend/src/utils/permission.js

export function hasPermission(permissions, requiredPermission) {
  return permissions.includes(requiredPermission)
}

export function hasAnyPermission(permissions, requiredPermissions = []) {
  return requiredPermissions.some((permission) =>
    permissions.includes(permission),
  )
}

export function hasAllPermissions(permissions, requiredPermissions = []) {
  return requiredPermissions.every((permission) =>
    permissions.includes(permission),
  )
}