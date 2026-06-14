// frontend/src/components/app/AppSidebar/AppSidebar.jsx

import { useMemo, useState } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import {
  BarChart3,
  BookOpen,
  Boxes,
  ChefHat,
  Home,
  LogOut,
  LayoutGrid,
  Search,
  ShieldUser,
  Store,
  Utensils,
  Wallet,
  Menu,
} from "lucide-react"

import logoUmari from "../../../assets/icons/logo-umari-black.svg"
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
  menu: {
    label: "Carta",
    path: "/app/menu",
    icon: BookOpen,
    group: "Operación",
    keywords: "carta menu menú catalogo catálogo categorias categorías productos platos",
  },
  bi: {
    label: "Reportes",
    path: "/app/bi",
    icon: BarChart3,
    group: "Análisis",
    keywords: "reportes bi indicadores ventas analítica analytics",
  },
  salon: {
    label: "Zonas/Mesas",
    path: "/app/salon",
    icon: LayoutGrid,
    group: "Administración",
    keywords: "salon mesas zonas distribución plano",
  },
  security: {
    label: "Usuarios",
    path: "/app/security",
    icon: ShieldUser,
    group: "Administración",
    keywords: "usuarios seguridad roles permisos administrador",
  },
  establishment: {
    label: "Establecimiento",
    path: "/app/establishment",
    icon: Store,
    group: "Administración",
    keywords:
      "establecimiento local negocio configuración configuracion ruc razón social igv moneda logo",
  },
}

const groupOrder = ["Principal", "Operación", "Análisis", "Administración"]

function normalizeText(value = "") {
  return value
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

function getInitials(user) {
  const firstName = user?.nombres?.trim()?.charAt(0) || "U"
  const lastName = user?.apellidos?.trim()?.charAt(0) || ""

  return `${firstName}${lastName}`.toUpperCase()
}

function getDisplayName(user) {
  const fullName = `${user?.nombres || ""} ${user?.apellidos || ""}`.trim()

  return fullName || user?.username || "Usuario"
}

function getNavigationGroups(modules, searchTerm) {
  const safeModules = Array.isArray(modules) ? modules : []
  const availableCodes = new Set(safeModules.map((module) => module.codigo))
  const normalizedSearchTerm = normalizeText(searchTerm.trim())

  const items = [
    {
      label: "Inicio",
      path: "/app",
      icon: Home,
      group: "Principal",
      keywords: "inicio home principal panel centro operativo",
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

export default function AppSidebar({
  isCollapsed = false,
  onToggleCollapse,
  variant = "default",
  isOpen = true,
  onClose,
}) {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState("")
  const [sidebarTooltip, setSidebarTooltip] = useState(null)

  const isDrawer = variant === "drawer"
  const shouldCollapse = !isDrawer && isCollapsed

  const user = useMemo(() => getCurrentUser(), [])
  const modules = useMemo(() => getCurrentModules(), [])

  const navigationGroups = useMemo(
    () => getNavigationGroups(modules, searchTerm),
    [modules, searchTerm],
  )

  const displayName = getDisplayName(user)
  const roleName = user?.rol || "Sin rol"

  function handleLogout() {
    if (isDrawer && onClose) {
      onClose()
    }

    logout()
    navigate("/login", { replace: true })
  }

  function handleSearchClick() {
    if (shouldCollapse && onToggleCollapse) {
      onToggleCollapse()
    }
  }

  function handleNavigationClick() {
    setSearchTerm("")

    if (isDrawer && onClose) {
      onClose()
    }
  }

  function showCollapsedTooltip(event, label) {
    if (!shouldCollapse || !label) return

    const rect = event.currentTarget.getBoundingClientRect()

    setSidebarTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    })
  }

  function hideCollapsedTooltip() {
    setSidebarTooltip(null)
  }

  return (
    <aside
      id={isDrawer ? "kds-navigation-drawer" : undefined}
      className={[
        "app-sidebar",
        shouldCollapse ? "app-sidebar--collapsed" : "",
        isDrawer ? "app-sidebar--drawer" : "",
        isDrawer && isOpen ? "app-sidebar--drawer-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={isDrawer ? "Navegación de cocina" : "Navegación principal"}
    >
      <button
        type="button"
        className="app-sidebar__toggle"
        onClick={isDrawer ? onClose : onToggleCollapse}
        aria-label={
          isDrawer
            ? "Cerrar navegación"
            : shouldCollapse
              ? "Expandir menú"
              : "Colapsar menú"
        }
        onMouseEnter={(event) =>
          showCollapsedTooltip(
            event,
            shouldCollapse ? "Expandir menú" : "Colapsar menú",
          )
        }
        onMouseLeave={hideCollapsedTooltip}
        onFocus={(event) =>
          showCollapsedTooltip(
            event,
            shouldCollapse ? "Expandir menú" : "Colapsar menú",
          )
        }
        onBlur={hideCollapsedTooltip}
      >
        <Menu size={16} strokeWidth={2.4} />
      </button>

      <div className="app-sidebar__content">
        <div className="app-sidebar__top">
          <NavLink
            to="/app"
            end
            className="app-sidebar__brand"
            aria-label="Ir al inicio de Umarí OS"
            onClick={handleNavigationClick}
            onMouseEnter={(event) => showCollapsedTooltip(event, "Umarí OS")}
            onMouseLeave={hideCollapsedTooltip}
            onFocus={(event) => showCollapsedTooltip(event, "Umarí OS")}
            onBlur={hideCollapsedTooltip}
          >
            <img src={logoUmari} alt="Umarí" className="app-sidebar__logo" />

            {!shouldCollapse && (
              <span className="app-sidebar__brand-name">Umarí OS</span>
            )}
          </NavLink>

          <div
            className="app-sidebar__search"
            onClick={handleSearchClick}
            role={shouldCollapse ? "button" : undefined}
            tabIndex={shouldCollapse ? 0 : undefined}
            aria-label="Buscar módulo"
            onMouseEnter={(event) => showCollapsedTooltip(event, "Buscar módulo")}
            onMouseLeave={hideCollapsedTooltip}
            onFocus={(event) => showCollapsedTooltip(event, "Buscar módulo")}
            onBlur={hideCollapsedTooltip}
          >
            <Search
              className="app-sidebar__search-icon"
              size={19}
              strokeWidth={2.2}
            />

            {!shouldCollapse && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar"
                className="app-sidebar__search-input"
                aria-label="Buscar módulo"
              />
            )}
          </div>

          <nav className="app-sidebar__nav" aria-label="Módulos internos">
            {navigationGroups.length > 0 ? (
              navigationGroups.map((group) => (
                <section className="app-sidebar__section" key={group.name}>
                  <h2 className="app-sidebar__section-title">
                    {shouldCollapse ? "..." : group.name}
                  </h2>

                  <div className="app-sidebar__section-links">
                    {group.items.map((item) => {
                      const ItemIcon = item.icon

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          end={item.path === "/app"}
                          className={({ isActive }) =>
                            isActive
                              ? "app-sidebar__link app-sidebar__link--active"
                              : "app-sidebar__link"
                          }
                          aria-label={item.label}
                          onClick={handleNavigationClick}
                          onMouseEnter={(event) =>
                            showCollapsedTooltip(event, item.label)
                          }
                          onMouseLeave={hideCollapsedTooltip}
                          onFocus={(event) =>
                            showCollapsedTooltip(event, item.label)
                          }
                          onBlur={hideCollapsedTooltip}
                        >
                          <ItemIcon
                            className="app-sidebar__link-icon"
                            size={20}
                            strokeWidth={2.1}
                          />

                          {!shouldCollapse && (
                            <span className="app-sidebar__link-label">
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
              !shouldCollapse && (
                <p className="app-sidebar__empty">No se encontraron módulos.</p>
              )
            )}
          </nav>
        </div>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__divider" />

          <div
            className="app-sidebar__profile"
            aria-label={`${roleName} · ${displayName}`}
            onMouseEnter={(event) =>
              showCollapsedTooltip(event, `${roleName} · ${displayName}`)
            }
            onMouseLeave={hideCollapsedTooltip}
          >
            <div className="app-sidebar__avatar" aria-hidden="true">
              {getInitials(user)}
            </div>

            {!shouldCollapse && (
              <div className="app-sidebar__profile-content">
                <span className="app-sidebar__profile-role">
                  {roleName.toUpperCase()}
                </span>
                <strong className="app-sidebar__profile-name">
                  {displayName}
                </strong>
              </div>
            )}
          </div>

          <button
            type="button"
            className="app-sidebar__logout"
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            onMouseEnter={(event) =>
              showCollapsedTooltip(event, "Cerrar sesión")
            }
            onMouseLeave={hideCollapsedTooltip}
            onFocus={(event) => showCollapsedTooltip(event, "Cerrar sesión")}
            onBlur={hideCollapsedTooltip}
          >
            <LogOut
              className="app-sidebar__logout-icon"
              size={20}
              strokeWidth={2.1}
            />

            {!shouldCollapse && <span>Cerrar sesión</span>}
          </button>
        </div>
      </div>

      {sidebarTooltip && (
        <div
          className="app-sidebar__floating-tooltip"
          style={{
            top: `${sidebarTooltip.top}px`,
            left: `${sidebarTooltip.left}px`,
          }}
          role="tooltip"
        >
          {sidebarTooltip.label}
        </div>
      )}
    </aside>
  )
}