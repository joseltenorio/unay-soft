// src/pages/RestorePassword/RestorePassword.jsx

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import AuthLayout from "../../components/layout/AuthLayout/AuthLayout"
import AuthToast from "../../components/common/AuthToast/AuthToast"

import "./RestorePassword.css"

export default function RestorePassword() {
  const [email, setEmail] = useState("")
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

    if (!email.trim()) {
      setToast({
        type: "error",
        title: "Error",
        message: "No se ha ingresado ningún correo.",
      })
      return
    }

    setToast({
      type: "success",
      title: "Código enviado",
      message: "Revise su correo para continuar la recuperación.",
    })
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
        variant="restore"
        visualTitle="Reestableciendo tu acceso a la excelencia"
        visualSubtitle="Vuélvete a conectar a tu eficiencia y efectividad."
      >
        <form className="restore-form" onSubmit={handleSubmit}>
          <header className="restore-form__header">
            <h1>Restablecer contraseña</h1>
            <p>Ingresa tu correo para recibir un enlace de recuperación.</p>
          </header>

          <div className="restore-form__group">
            <label htmlFor="restore-email">Correo</label>
            <input
              id="restore-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Ingresa tu correo"
              autoComplete="email"
            />
          </div>

          <button className="auth-submit-button restore-form__submit" type="submit">
            Enviar código
          </button>

          <Link className="restore-form__cancel" to="/login">
            Cancelar
          </Link>

          <p className="restore-form__notice">
            Se enviará un email al correo ingresado con indicaciones para
            restaurar tu contraseña.
          </p>

          <p className="restore-form__copyright">© 2026 Umarí.</p>
        </form>
      </AuthLayout>
    </>
  )
}