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
  return {
  token,
  user: {
    id_usuario: user.id_usuario,
    id_establecimiento: user.id_establecimiento,
    id_rol: user.id_rol,
    nombres: user.nombres,
    apellidos: user.apellidos,
    email: user.email,
    username: user.username,
    rol: user.rol,
  },
  modules,
  permissions,  // ← solo agrega esta línea
}
}