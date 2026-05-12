// src/pages/Login/Login.jsx

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { getToken, loginRequest } from "../../services/authService"

import AuthLayout from "../../components/layout/AuthLayout/AuthLayout"
import AuthToast from "../../components/common/AuthToast/AuthToast"

import "./Login.css"

export default function Login() {
  const navigate = useNavigate()

  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [toast, setToast] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (getToken()) {
      navigate("/app", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [toast])

  async function handleSubmit(event) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    if (!identifier.trim()) {
      setToast({
        type: "error",
        title: "Error",
        message: "No ha ingresado ningún correo o usuario.",
      })
      return
    }

    if (!password.trim()) {
      setToast({
        type: "error",
        title: "Error",
        message: "No ha ingresado ninguna contraseña.",
      })
      return
    }

    const minimumFeedbackTime = 450
    const startedAt = Date.now()

    try {
      setIsSubmitting(true)

      await loginRequest({
        identifier: identifier.trim(),
        password,
        remember,
      })

      const elapsedTime = Date.now() - startedAt
      const remainingTime = Math.max(0, minimumFeedbackTime - elapsedTime)

      window.setTimeout(() => {
        setToast({
          type: "success",
          title: "Login exitoso",
          message: "Bienvenido a Umarí OS.",
        })

        window.setTimeout(() => {
          navigate("/app")
        }, 400)
      }, remainingTime)
    } catch (error) {
      const elapsedTime = Date.now() - startedAt
      const remainingTime = Math.max(0, minimumFeedbackTime - elapsedTime)

      window.setTimeout(() => {
        setToast({
          type: "error",
          title: "Acceso denegado",
          message: error.message,
        })

        setIsSubmitting(false)
      }, remainingTime)
    }
  }

  return (
    <>
      {toast && (
        <AuthToast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <AuthLayout
        variant="login"
        visualTitle="Orquestando la experiencia culinaria de Umarí."
        visualSubtitle="Tu acceso al flujo de trabajo impecable de Umarí."
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <header className="login-form__header">
            <h1>
              Gestiona todo tu trabajo desde un <strong>solo lugar</strong>
            </h1>
          </header>

          <div className="login-form__group">
            <label htmlFor="identifier">Correo o usuario</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Ingresa tu correo o usuario"
              autoComplete="username"
              disabled={isSubmitting}
            />
          </div>

          <div className="login-form__group">
            <label htmlFor="password">Contraseña</label>

            <div className="login-form__password">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
                disabled={isSubmitting}
              />

              <button
                type="button"
                className="login-form__password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "◡" : "●"}
              </button>
            </div>
          </div>

          <div className="login-form__options">
            <label className="login-form__remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                disabled={isSubmitting}
              />
              <span />
              Recordarme
            </label>

            <Link className="login-form__forgot" to="/restore-password">
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <button
            className="auth-submit-button login-form__submit"
            type="submit"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting && <span className="login-form__spinner" aria-hidden="true" />}
            <span>{isSubmitting ? "Ingresando..." : "Ingresar"}</span>
          </button>

          {isSubmitting && (
            <p className="login-form__status">Validando credenciales...</p>
          )}

          <p className="login-form__help">
            ¿Problemas con tu acceso? Contacta al Administrador del Sistema o
            Contacta a Soporte Técnico.
          </p>

          <p className="login-form__copyright">© 2026 Umarí.</p>
        </form>
      </AuthLayout>
    </>
  )
}