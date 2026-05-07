// src/components/auth/RequirePermission.jsx

import { getCurrentPermissions } from "../../services/authService"
import {
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
} from "../../utils/permission"

export default function RequirePermission({
  permission,
  anyOf = [],
  allOf = [],
  fallback = null,
  children,
}) {
  const permissions = getCurrentPermissions()

  let isAllowed = true

  if (permission) {
    isAllowed = hasPermission(permissions, permission)
  }

  if (anyOf.length > 0) {
    isAllowed = hasAnyPermission(permissions, anyOf)
  }

  if (allOf.length > 0) {
    isAllowed = hasAllPermissions(permissions, allOf)
  }

  if (!isAllowed) {
    return fallback
  }

  return children
}