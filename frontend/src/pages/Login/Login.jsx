// src/pages/Login/Login.jsx

import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

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

  useEffect(() => {
    if (!toast) return

    const timer = window.setTimeout(() => {
      setToast(null)
    }, 2500)

    return () => window.clearTimeout(timer)
  }, [toast])

  function handleSubmit(event) {
    event.preventDefault()

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

    setToast({
      type: "success",
      title: "Realizado con éxito",
      message: "Usted se ha logeado con éxito.",
    })

    window.setTimeout(() => {
      navigate("/dashboard")
    }, 900)
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
              placeholder="Ingresa tu usuario"
              autoComplete="username"
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
              />

              <button
                type="button"
                className="login-form__password-toggle"
                onClick={() => setShowPassword((current) => !current)}
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
              />
              <span />
              Recordarme
            </label>

            <Link className="login-form__forgot" to="/restore-password">
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <button className="btn btn-primary login-form__submit" type="submit">
            Ingresar
          </button>

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