// src/pages/AppHome/AppHome.jsx
import { Link, useNavigate } from "react-router-dom"

import {
  getCurrentModules,
  getCurrentPermissions,
  getCurrentUser,
  logout,
} from "../../services/authService"

import "./AppHome.css"

const moduleFallbackMessages = {
  app: "Inicio interno del sistema con módulos disponibles según permisos.",
  pos: "Gestión de salón, pedidos y atención de mesas.",
  kds: "Monitor de cocina y control de preparación.",
  inventory: "Control de insumos, stock y movimientos.",
  cashier: "Caja, pagos, apertura y cierre operativo.",
  bi: "Reportes, métricas y análisis del negocio.",
  security: "Usuarios, roles y permisos del sistema.",
}

export default function AppHome() {
  const navigate = useNavigate()

  const user = getCurrentUser()
  const permissions = getCurrentPermissions()
  const modules = getCurrentModules()

  const visibleModules = modules.filter((module) =>
    ["pos", "kds", "inventory", "cashier", "bi", "security"].includes(
      module.codigo,
    ),
  )

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <main className="app-home">
      <section className="app-home__shell">
        <header className="app-home__header">
          <div>
            <p className="app-home__eyebrow">Umarí OS</p>
            <h1>Panel de trabajo</h1>
          </div>

          <button className="app-home__logout" type="button" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </header>

        <section className="app-home__card">
          <div className="app-home__user">
            <span className="app-home__avatar" aria-hidden="true">
              {user?.nombres?.charAt(0) || "U"}
            </span>

            <div>
              <p className="app-home__name">
                {user?.nombres || "Usuario"} {user?.apellidos || ""}
              </p>
              <span className="app-home__role">{user?.rol || "Sin rol"}</span>
            </div>
          </div>

          <p className="app-home__message">
            Estos son los módulos disponibles según tu perfil y permisos actuales.
          </p>

          <div className="app-home__meta">
            <div>
              <span>Correo</span>
              <strong>{user?.email || "No disponible"}</strong>
            </div>

            <div>
              <span>Usuario</span>
              <strong>{user?.username || "No disponible"}</strong>
            </div>

            <div>
              <span>Permisos activos</span>
              <strong>{permissions.length}</strong>
            </div>
          </div>

          <div className="app-home__actions">
            <Link className="app-home__action-link" to="/app/permissions-demo">
              Probar permisos del usuario
            </Link>
          </div>

          <section className="app-home__modules" aria-label="Módulos disponibles">
            {visibleModules.length > 0 ? (
              visibleModules.map((module) => (
                <article className="app-home__module-card" key={module.codigo}>
                  <span className="app-home__module-code">{module.codigo}</span>
                  <h2>{module.nombre}</h2>
                  <p>
                    {moduleFallbackMessages[module.codigo] ||
                      "Módulo disponible para tu usuario."}
                  </p>
                </article>
              ))
            ) : (
              <article className="app-home__module-empty">
                No hay módulos disponibles para este usuario.
              </article>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}