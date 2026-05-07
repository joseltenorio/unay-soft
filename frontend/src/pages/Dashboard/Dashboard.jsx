// src/pages/Dashboard/Dashboard.jsx 

import { Link, useNavigate } from "react-router-dom"

import {
  getCurrentModules,
  getCurrentPermissions,
  getCurrentUser,
  logout,
} from "../../services/authService"
import { hasPermission } from "../../utils/permission"

import "./Dashboard.css"

const moduleFallbackMessages = {
  dashboard: "Panel principal de indicadores operativos.",
  pos: "Gestión de salón, pedidos y atención de mesas.",
  kds: "Monitor de cocina y control de preparación.",
  inventory: "Control de insumos, stock y movimientos.",
  cashier: "Caja, pagos, apertura y cierre operativo.",
  bi: "Reportes, métricas y análisis del negocio.",
  security: "Usuarios, roles y permisos del sistema.",
}

export default function Dashboard() {
  const navigate = useNavigate()

  const user = getCurrentUser()
  const permissions = getCurrentPermissions()
  const modules = getCurrentModules()

  const canViewDashboard = hasPermission(permissions, "dashboard.ver")

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <main className="dashboard">
      <section className="dashboard__shell">
        <header className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">Umarí OS</p>
            <h1>Panel de trabajo</h1>
          </div>

          <button
            className="dashboard__logout"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </header>

        <section className="dashboard__card">
          <div className="dashboard__user">
            <span className="dashboard__avatar" aria-hidden="true">
              {user?.nombres?.charAt(0) || "U"}
            </span>

            <div>
              <p className="dashboard__name">
                {user?.nombres || "Usuario"} {user?.apellidos || ""}
              </p>
              <span className="dashboard__role">{user?.rol || "Sin rol"}</span>
            </div>
          </div>

          <p className="dashboard__message">
            {canViewDashboard
              ? "Estos son los módulos disponibles según tus permisos actuales."
              : "Tu usuario inició sesión, pero no tiene permiso para visualizar el dashboard."}
          </p>

          <div className="dashboard__meta">
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

          <div className="dashboard__actions">
            <Link className="dashboard__action-link" to="/dashboard/permissions-demo">
              Probar permisos del usuario
            </Link>
          </div>

          <section className="dashboard__modules" aria-label="Módulos disponibles">
            {modules.length > 0 ? (
              modules.map((module) => (
                <article className="dashboard__module-card" key={module.codigo}>
                  <span className="dashboard__module-code">{module.codigo}</span>
                  <h2>{module.nombre}</h2>
                  <p>
                    {moduleFallbackMessages[module.codigo] ||
                      "Módulo disponible para tu usuario."}
                  </p>
                </article>
              ))
            ) : (
              <article className="dashboard__module-empty">
                No hay módulos disponibles para este usuario.
              </article>
            )}
          </section>
        </section>
      </section>
    </main>
  )
}