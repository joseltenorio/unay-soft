// frontend/src/components/app/AppSidebar/AppSidebar.jsx

import { useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Boxes,
  ChefHat,
  Home,
  LogOut,
  Search,
  ShieldUser,
  Store,
  Utensils,
  Wallet,
} from "lucide-react"

import logoUmari from "../../../assets/icons/logo-umari.svg"
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
    icon: Utensils,
    group: "Operación",
    keywords: "pos salon mesas pedidos mozo atención",
  },
  kds: {
    label: "Cocina",
    path: "/app/kds",
    icon: ChefHat,
    group: "Operación",
    keywords: "cocina kds pedidos preparación",
  },
  cashier: {
    label: "Caja",
    path: "/app/cashier",
    icon: Wallet,
    group: "Operación",
    keywords: "caja pagos cierre cajero",
  },
  inventory: {
    label: "Inventario",
    path: "/app/inventory",
    icon: Boxes,
    group: "Operación",
    keywords: "inventario insumos stock almacén",
  },
  bi: {
    label: "Reportes",
    path: "/app/bi",
    icon: BarChart3,
    group: "Análisis",
    keywords: "reportes bi indicadores ventas analítica",
  },
  security: {
    label: "Usuarios",
    path: "/app/security",
    icon: ShieldUser,
    group: "Administración",
    keywords: "usuarios seguridad roles permisos admin administrador",
  },
}

const groupOrder = ["Principal", "Operación", "Análisis", "Administración"]

function getInitials(user) {
  const firstName = user?.nombres?.trim()?.charAt(0) || "U"
  const lastName = user?.apellidos?.trim()?.charAt(0) || ""

  return `${firstName}${lastName}`.toUpperCase()
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getNavigationGroups(modules, searchTerm) {
  const availableCodes = new Set(modules.map((module) => module.codigo))
  const normalizedSearchTerm = normalizeText(searchTerm.trim())

  const items = [
    {
      label: "Inicio",
      path: "/app",
      icon: Home,
      group: "Principal",
      keywords: "inicio home centro operativo principal",
    },
    ...Object.entries(moduleNavigation)
      .filter(([moduleCode]) => availableCodes.has(moduleCode))
      .map(([, item]) => item),
  ]

  const filteredItems = normalizedSearchTerm
    ? items.filter((item) => {
        const searchableText = normalizeText(
          `${item.label} ${item.group} ${item.keywords}`,
        )

        return searchableText.includes(normalizedSearchTerm)
      })
    : items

  return groupOrder
    .map((groupName) => ({
      name: groupName,
      items: filteredItems.filter((item) => item.group === groupName),
    }))
    .filter((group) => group.items.length > 0)
}

export default function AppSidebar({ isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const user = useMemo(() => getCurrentUser(), [])
  const modules = useMemo(() => getCurrentModules(), [])

  const navigationGroups = useMemo(
    () => getNavigationGroups(modules, searchTerm),
    [modules, searchTerm],
  )

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  function handleSearchClick() {
    if (isCollapsed) {
      onToggleCollapse()
    }
  }

  return (
    <aside
      className={isCollapsed ? "app-sidebar app-sidebar--collapsed" : "app-sidebar"}
      aria-label="Navegación interna"
    >
      <div className="app-sidebar__brand">
        <div className="app-sidebar__brand-pill">
          <span className="app-sidebar__logo" aria-hidden="true">
            <img src={logoUmari} alt="" />
          </span>

          {!isCollapsed && (
            <strong className="app-sidebar__brand-name">Umarí OS</strong>
          )}
        </div>

        <button
          className="app-sidebar__collapse-button"
          type="button"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          {isCollapsed ? "›" : "‹"}
        </button>
      </div>

      <div className="app-sidebar__search">
        <span aria-hidden="true">
          <Search size={17} strokeWidth={2.4} />
        </span>

        {!isCollapsed && (
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Buscar módulo..."
            aria-label="Buscar módulo"
          />
        )}

        {isCollapsed && (
          <button
            className="app-sidebar__search-button"
            type="button"
            onClick={handleSearchClick}
            aria-label="Expandir para buscar módulos"
            title="Buscar módulos"
          />
        )}
      </div>

      <nav className="app-sidebar__nav">
        {navigationGroups.length > 0 ? (
          navigationGroups.map((group) => (
            <section className="app-sidebar__group" key={group.name}>
              <p
                className="app-sidebar__group-title"
                aria-hidden={isCollapsed ? "true" : undefined}
              >
                {group.name}
              </p>

              <div className="app-sidebar__items">
                {group.items.map((item) => {
                  const ItemIcon = item.icon

                  return (
                    <NavLink
                      end={item.path === "/app"}
                      className={({ isActive }) =>
                        isActive
                          ? "app-sidebar__item app-sidebar__item--active"
                          : "app-sidebar__item"
                      }
                      key={item.path}
                      to={item.path}
                      title={isCollapsed ? item.label : undefined}
                      onClick={() => setSearchTerm("")}
                    >
                      <span className="app-sidebar__item-icon" aria-hidden="true">
                        <ItemIcon size={18} strokeWidth={2.25} />
                      </span>

                      {!isCollapsed && (
                        <span className="app-sidebar__item-label">
                          {item.label}
                        </span>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </section>
          ))
        ) : (
          !isCollapsed && (
            <p className="app-sidebar__empty">No se encontraron módulos.</p>
          )
        )}
      </nav>

      <div className="app-sidebar__footer">
        <div
          className="app-sidebar__profile"
          title={
            isCollapsed
              ? `${user?.rol || "Sin rol"} · ${user?.nombres || "Usuario"} ${
                  user?.apellidos || ""
                }`
              : undefined
          }
        >
          <div className="app-sidebar__avatar" aria-hidden="true">
            {getInitials(user)}
          </div>

          {!isCollapsed && (
            <>
              <div className="app-sidebar__profile-info">
                <span>{user?.rol || "Sin rol"}</span>
                <strong>
                  {user?.nombres || "Usuario"} {user?.apellidos || ""}
                </strong>
              </div>

              <button
                className="app-sidebar__profile-menu"
                type="button"
                aria-label="Opciones de cuenta"
                title="Opciones de cuenta"
              >
                ⋯
              </button>
            </>
          )}
        </div>

        <button
          className="app-sidebar__logout"
          type="button"
          onClick={handleLogout}
          title={isCollapsed ? "Cerrar sesión" : undefined}
        >
          <span aria-hidden="true">
            <LogOut size={17} strokeWidth={2.4} />
          </span>

          {!isCollapsed && "Cerrar sesión"}
        </button>
      </div>
    </aside>
  )
}