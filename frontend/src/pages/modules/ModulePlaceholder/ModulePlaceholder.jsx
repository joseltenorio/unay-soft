// src/pages/modules/ModulePlaceholder/ModulePlaceholder.jsx

import { Link } from "react-router-dom"

import { getCurrentUser } from "../../../services/authService"

import "./ModulePlaceholder.css"

export default function ModulePlaceholder({
  eyebrow,
  title,
  description,
  permission,
}) {
  const user = getCurrentUser()

  return (
    <main className="module-placeholder">
      <section className="module-placeholder__shell">
        <header className="module-placeholder__header">
          <div>
            <p className="module-placeholder__eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p>{description}</p>
          </div>

          <Link className="module-placeholder__back" to="/app">
            Volver al inicio interno
          </Link>
        </header>

        <section className="module-placeholder__card">
          <div>
            <span className="module-placeholder__status">
              Página temporal
            </span>

            <h2>Este módulo está listo para iniciar su lógica</h2>

            <p>
              Esta pantalla todavía no es el diseño final. Sirve para validar
              rutas, permisos, navegación interna y estructura base antes de
              construir las funcionalidades reales.
            </p>
          </div>

          <div className="module-placeholder__meta">
            <div>
              <span>Usuario</span>
              <strong>
                {user?.nombres || "Usuario"} {user?.apellidos || ""}
              </strong>
            </div>

            <div>
              <span>Rol</span>
              <strong>{user?.rol || "Sin rol"}</strong>
            </div>

            <div>
              <span>Permiso requerido</span>
              <strong>{permission}</strong>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}