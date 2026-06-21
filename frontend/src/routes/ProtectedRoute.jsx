// frontend/src/routes/ProtectedRoute.jsx

import { useEffect, useState } from "react"
import { Navigate, useLocation } from "react-router-dom"

import {
  getAuthenticatedUser,
  getToken,
  logoutLocal,
} from "../services/authService"

import "./ProtectedRoute.css"

export default function ProtectedRoute({ children }) {
  const location = useLocation()

  const [status, setStatus] = useState("checking")

  useEffect(() => {
    let isMounted = true

    async function validateSession() {
      const token = getToken()

      if (!token) {
        if (isMounted) {
          setStatus("unauthenticated")
        }

        return
      }

      try {
        await getAuthenticatedUser()

        if (isMounted) {
          setStatus("authenticated")
        }
      } catch {
        logoutLocal()

        if (isMounted) {
          setStatus("unauthenticated")
        }
      }
    }

    validateSession()

    return () => {
      isMounted = false
    }
  }, [])

  if (status === "checking") {
    return (
      <main className="protected-route-status">
        <div className="protected-route-status__card">
          <span className="protected-route-status__eyebrow">Umarí OS</span>
          <p className="protected-route-status__message">Validando sesión...</p>
        </div>
      </main>
    )
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}