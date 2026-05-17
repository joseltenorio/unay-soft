// src/components/layout/AuthLayout/AuthLayout.jsx

import { Link } from "react-router-dom"
import logoUmari from "../../../assets/icons/logo-umari-dark.svg"
import loginIllustration from "../../../assets/images/login-illustration.jpg"

import "./AuthLayout.css"

export default function AuthLayout({
  variant = "login",
  visualTitle,
  visualSubtitle,
  children,
}) {
  const isLogin = variant === "login"

  return (
    <main
      className={`auth-layout auth-layout--${variant}`}
      style={{ "--auth-bg": `url(${loginIllustration})` }}
    >
      <section
        className="auth-visual"
        aria-label="Presentación de Umarí"
      >
        <div className="auth-visual__content">
          <div className="auth-visual__copy">
            <h1>{visualTitle}</h1>
            <p>{visualSubtitle}</p>
          </div>

          {isLogin && (
            <Link className="auth-visual__back" to="/">
              <span aria-hidden="true">↩</span>
              Regresar al Inicio
            </Link>
          )}
        </div>
      </section>

      <section className="auth-panel" aria-label="Formulario de acceso">
        <div className="auth-panel__inner">
          <Link
            className="auth-panel__brand"
            to="/"
            aria-label="Ir al inicio de Umarí"
          >
            <img
              src={logoUmari}
              alt=""
              className="auth-panel__logo"
              aria-hidden="true"
            />
            <span>Umarí</span>
          </Link>

          {children}
        </div>
      </section>
    </main>
  )
}