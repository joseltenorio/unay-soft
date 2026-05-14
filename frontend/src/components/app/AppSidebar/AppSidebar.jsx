// frontend/src/components/app/AppSidebar/AppSidebar.jsx

import { NavLink, useNavigate } from "react-router-dom"

import {
  getCurrentModules,
  getCurrentUser,
  logout,
} from "../../../services/authService"

import "./AppSidebar.css"

const moduleNavigation = {
  pos: {
    label: "POS / Salón",
    path: "/app/pos",
    icon: "◫",
    group: "Operación",
  },
  kds: {
    label: "Cocina",
    path: "/app/kds",
    icon: "▦",
    group: "Operación",
  },
  cashier: {
    label: "Caja",
    path: "/app/cashier",
    icon: "▣",
    group: "Operación",
  },
  inventory: {
    label: "Inventario",
    path: "/app/inventory",
    icon: "▤",
    group: "Operación",
  },
  bi: {
    label: "Reportes",
    path: "/app/bi",
    icon: "◈",
    group: "Análisis",
  },
  security: {
    label: "Usuarios",
    path: "/app/security",
    icon: "◎",
    group: "Administración",
  },
}

const groupOrder = ["Principal", "Operación", "Análisis", "Administración"]

function getInitials(user) {
  const firstName = user?.nombres?.trim()?.charAt(0) || "U"
  const lastName = user?.apellidos?.trim()?.charAt(0) || ""

  return `${firstName}${lastName}`.toUpperCase()
}

function getNavigationGroups(modules) {
  const availableCodes = new Set(modules.map((module) => module.codigo))

  const items = [
    {
      label: "Inicio",
      path: "/app",
      icon: "⌂",
      group: "Principal",
    },
    ...Object.entries(moduleNavigation)
      .filter(([moduleCode]) => availableCodes.has(moduleCode))
      .map(([, item]) => item),
  ]

  return groupOrder
    .map((groupName) => ({
      name: groupName,
      items: items.filter((item) => item.group === groupName),
    }))
    .filter((group) => group.items.length > 0)
}

export default function AppSidebar() {
  const navigate = useNavigate()

  const user = getCurrentUser()
  const modules = getCurrentModules()
  const navigationGroups = getNavigationGroups(modules)

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <aside className="app-sidebar" aria-label="Navegación interna">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo" aria-hidden="true">
          U
        </div>

        <div className="app-sidebar__brand-text">
          <strong>Umarí OS</strong>
          <span>Sistema interno</span>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        {navigationGroups.map((group) => (
          <section className="app-sidebar__group" key={group.name}>
            <p className="app-sidebar__group-title">{group.name}</p>

            <div className="app-sidebar__items">
              {group.items.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    isActive
                      ? "app-sidebar__item app-sidebar__item--active"
                      : "app-sidebar__item"
                  }
                  key={item.path}
                  to={item.path}
                >
                  <span className="app-sidebar__item-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className="app-sidebar__item-label">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </section>
        ))}
      </nav>

      <div className="app-sidebar__footer">
        <div className="app-sidebar__profile">
          <div className="app-sidebar__avatar" aria-hidden="true">
            {getInitials(user)}
          </div>

          <div className="app-sidebar__profile-info">
            <span>{user?.rol || "Sin rol"}</span>
            <strong>
              {user?.nombres || "Usuario"} {user?.apellidos || ""}
            </strong>
            <p>{user?.email || "Correo no disponible"}</p>
          </div>

          <button
            className="app-sidebar__profile-menu"
            type="button"
            aria-label="Opciones de cuenta"
            title="Opciones de cuenta"
          >
            ⋯
          </button>
        </div>

        <button
          className="app-sidebar__logout"
          type="button"
          onClick={handleLogout}
        >
          <span aria-hidden="true">↪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}