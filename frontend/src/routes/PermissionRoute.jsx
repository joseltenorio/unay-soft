// src/routes/PermissionRoute.jsx

import { Navigate } from "react-router-dom"

import { getCurrentPermissions } from "../services/authService"
import { hasPermission } from "../utils/permission"

export default function PermissionRoute({ permission, children }) {
  const permissions = getCurrentPermissions()

  if (!hasPermission(permissions, permission)) {
    return <Navigate to="/app/unauthorized" replace />
  }

  return children
}