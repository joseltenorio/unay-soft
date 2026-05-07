// src/routes/ProtectedRoute.jsx

import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"

import {
  getAuthenticatedUser,
  getToken,
  logout,
  updateCurrentUser,
} from "../services/authService"

import "./ProtectedRoute.css"

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  const [status, setStatus] = useState("checking")

  useEffect(() => {
    async function validateSession() {
      const token = getToken()

      if (!token) {
        setStatus("unauthenticated")
        return
      }

      try {
        const user = await getAuthenticatedUser()
        updateCurrentUser(user)
        setStatus("authenticated")
      } catch {
        logout()
        setStatus("unauthenticated")
      }
    }

    validateSession()
  }, [])

  if (status === "checking") {
    return (
      <main className="protected-route-status">
        <p className="protected-route-status__message">Validando sesión...</p>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}