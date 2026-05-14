// frontend/src/pages/AppHome/AppHome.jsx

import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"

import logoUmari from "../../assets/icons/logo-umari.svg"

import {
  getCurrentModules,
  getCurrentPermissions,
  getCurrentUser,
} from "../../services/authService"
import { getUsers } from "../../services/userService"

import "./AppHome.css"

const roleContent = {
  Administrador: {
    eyebrow: "Centro administrativo",
    title: "Control operativo del sistema",
    description:
      "Supervisa usuarios, accesos, módulos disponibles y mantenimiento interno de Umarí OS.",
    primaryAction: {
      label: "Gestionar usuarios",
      to: "/app/security",
    },
    secondaryAction: {
      label: "Revisar reportes",
      to: "/app/bi",
    },
    metrics: [
      {
        key: "activeUsers",
        label: "Usuarios activos",
        fallback: "—",
      },
      {
        key: "inactiveUsers",
        label: "Usuarios inactivos",
        fallback: "—",
      },
      {
        key: "modules",
        label: "Módulos disponibles",
        fallback: "0",
      },
      {
        key: "permissions",
        label: "Permisos activos",
        fallback: "0",
      },
    ],
    pendingTitle: "Pendientes administrativos",
    pending: [
      "Revisar usuarios activos e inactivos.",
      "Validar asignación de roles por perfil.",
      "Confirmar que los módulos críticos estén protegidos.",
      "Mantener actualizado el acceso del personal.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Entrar a Usuarios.",
      "Crear o editar cuentas internas.",
      "Validar acceso por perfil.",
      "Cerrar sesión al finalizar pruebas.",
    ],
  },

  Gerente: {
    eyebrow: "Supervisión general",
    title: "Vista operativa del restaurante",
    description:
      "Monitorea áreas clave como salón, caja, inventario y reportes para tomar decisiones de gestión.",
    primaryAction: {
      label: "Ir a reportes",
      to: "/app/bi",
    },
    secondaryAction: {
      label: "Revisar caja",
      to: "/app/cashier",
    },
    metrics: [
      {
        key: "operationStatus",
        label: "Operación",
        fallback: "Activa",
      },
      {
        key: "cashStatus",
        label: "Caja",
        fallback: "Por validar",
      },
      {
        key: "inventoryStatus",
        label: "Inventario",
        fallback: "En revisión",
      },
      {
        key: "modules",
        label: "Módulos disponibles",
        fallback: "0",
      },
    ],
    pendingTitle: "Pendientes de supervisión",
    pending: [
      "Revisar el estado de caja.",
      "Validar inventario crítico.",
      "Consultar reportes del día.",
      "Supervisar operación de salón y cocina.",
    ],
    flowTitle: "Áreas clave",
    flow: [
      "Salón y pedidos.",
      "Caja y pagos.",
      "Inventario e insumos.",
      "Reportes operativos.",
    ],
  },

  Cajero: {
    eyebrow: "Caja del turno",
    title: "Control de pagos y cierre operativo",
    description:
      "Gestiona el flujo de caja, pagos del turno y validaciones necesarias antes del cierre.",
    primaryAction: {
      label: "Ir a caja",
      to: "/app/cashier",
    },
    secondaryAction: {
      label: "Ir a POS",
      to: "/app/pos",
    },
    metrics: [
      {
        key: "cashStatus",
        label: "Estado de caja",
        fallback: "Inicial",
      },
      {
        key: "payments",
        label: "Pagos",
        fallback: "Pendiente",
      },
      {
        key: "closing",
        label: "Cierre",
        fallback: "Por validar",
      },
      {
        key: "modules",
        label: "Módulos disponibles",
        fallback: "0",
      },
    ],
    pendingTitle: "Pendientes de caja",
    pending: [
      "Revisar pagos pendientes.",
      "Validar comprobantes.",
      "Preparar cierre del turno.",
      "Confirmar operaciones registradas.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Abrir caja.",
      "Registrar pagos.",
      "Validar comprobantes.",
      "Cerrar turno.",
    ],
  },

  Mozo: {
    eyebrow: "Atención de salón",
    title: "Gestión de mesas y pedidos",
    description:
      "Organiza la atención del salón, registro de pedidos y coordinación con cocina y caja.",
    primaryAction: {
      label: "Ir a POS / Salón",
      to: "/app/pos",
    },
    secondaryAction: null,
    metrics: [
      {
        key: "tables",
        label: "Mesas",
        fallback: "Por iniciar",
      },
      {
        key: "orders",
        label: "Pedidos",
        fallback: "En curso",
      },
      {
        key: "kitchen",
        label: "Cocina",
        fallback: "Por coordinar",
      },
      {
        key: "cashier",
        label: "Cobro",
        fallback: "Pendiente",
      },
    ],
    pendingTitle: "Pendientes de salón",
    pending: [
      "Registrar pedidos de mesa.",
      "Enviar comandas a cocina.",
      "Coordinar pedidos listos.",
      "Derivar pagos a caja.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Seleccionar mesa.",
      "Agregar productos.",
      "Enviar comanda.",
      "Coordinar pago.",
    ],
  },

  Cocina: {
    eyebrow: "Cocina activa",
    title: "Preparación y despacho",
    description:
      "Prioriza pedidos, controla preparación y mantiene coordinación con el salón.",
    primaryAction: {
      label: "Ir a Cocina / KDS",
      to: "/app/kds",
    },
    secondaryAction: null,
    metrics: [
      {
        key: "pendingOrders",
        label: "Pendientes",
        fallback: "Por iniciar",
      },
      {
        key: "preparing",
        label: "Preparación",
        fallback: "En curso",
      },
      {
        key: "ready",
        label: "Listos",
        fallback: "Por despachar",
      },
      {
        key: "priority",
        label: "Prioridad",
        fallback: "Normal",
      },
    ],
    pendingTitle: "Pendientes de cocina",
    pending: [
      "Revisar pedidos nuevos.",
      "Priorizar pedidos antiguos.",
      "Actualizar estados de preparación.",
      "Avisar pedidos listos a salón.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Tomar pedido.",
      "Marcar en preparación.",
      "Finalizar pedido.",
      "Despachar a salón.",
    ],
  },
}

const defaultContent = {
  eyebrow: "Centro operativo",
  title: "Panel interno de Umarí OS",
  description:
    "Consulta tus accesos disponibles y continúa con las tareas asignadas según tu perfil.",
  primaryAction: {
    label: "Ir al primer módulo",
    to: "/app",
  },
  secondaryAction: null,
  metrics: [
    {
      key: "modules",
      label: "Módulos disponibles",
      fallback: "0",
    },
    {
      key: "permissions",
      label: "Permisos activos",
      fallback: "0",
    },
    {
      key: "session",
      label: "Sesión",
      fallback: "Validada",
    },
  ],
  pendingTitle: "Pendientes",
  pending: [
    "Revisar los accesos asignados.",
    "Ingresar al módulo correspondiente.",
    "Reportar accesos faltantes al administrador.",
  ],
  flowTitle: "Flujo recomendado",
  flow: ["Ingresar al sistema.", "Seleccionar módulo.", "Realizar operación."],
}

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return "Buenos días"
  if (hour < 19) return "Buenas tardes"
  return "Buenas noches"
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

function getFirstName(user) {
  return user?.nombres?.split(" ")?.[0] || "Usuario"
}

function hasSecurityManagement(permissions) {
  return permissions.includes("security.gestionar_usuarios")
}

export default function AppHome() {
  const user = useMemo(() => getCurrentUser(), [])
  const permissions = useMemo(() => getCurrentPermissions(), [])
  const modules = useMemo(() => getCurrentModules(), [])

  const [adminStats, setAdminStats] = useState({
    activeUsers: null,
    inactiveUsers: null,
    isLoading: false,
  })

  const content = roleContent[user?.rol] || defaultContent

  useEffect(() => {
    if (!hasSecurityManagement(permissions)) {
      return
    }

    let isMounted = true

    async function loadAdminStats() {
      try {
        setAdminStats((currentStats) => ({
          ...currentStats,
          isLoading: true,
        }))

        const users = await getUsers()

        if (!isMounted) return

        setAdminStats({
          activeUsers: users.filter((userItem) => userItem.estado).length,
          inactiveUsers: users.filter((userItem) => !userItem.estado).length,
          isLoading: false,
        })
      } catch {
        if (!isMounted) return

        setAdminStats({
          activeUsers: null,
          inactiveUsers: null,
          isLoading: false,
        })
      }
    }

    loadAdminStats()

    return () => {
      isMounted = false
    }
  }, [permissions])

  const metricValues = useMemo(
    () => ({
      activeUsers:
        adminStats.activeUsers === null ? "—" : String(adminStats.activeUsers),
      inactiveUsers:
        adminStats.inactiveUsers === null
          ? "—"
          : String(adminStats.inactiveUsers),
      modules: String(modules.length),
      permissions: String(permissions.length),
      operationStatus: "Activa",
      cashStatus: "Inicial",
      inventoryStatus: "En revisión",
      payments: "Pendiente",
      closing: "Por validar",
      tables: "Por iniciar",
      orders: "En curso",
      kitchen: "Por coordinar",
      cashier: "Pendiente",
      pendingOrders: "Por iniciar",
      preparing: "En curso",
      ready: "Por despachar",
      priority: "Normal",
      session: "Validada",
    }),
    [adminStats, modules.length, permissions.length],
  )

  return (
    <section className="app-home">
      <header className="app-home__header">
        <div>
          <p className="app-home__eyebrow">{content.eyebrow}</p>
          <h1>
            {getGreeting()}, {getFirstName(user)}
          </h1>
          <p>
            {content.title} · <span>{getTodayLabel()}</span>
          </p>
        </div>

        <div className="app-home__role-card">
          <span>{user?.rol || "Sin rol"}</span>
          <strong>{user?.username || user?.email || "usuario"}</strong>
        </div>
      </header>

      <section className="app-home__hero">
        <div className="app-home__hero-content">
          <span>{content.eyebrow}</span>
          <h2>{content.title}</h2>
          <p>{content.description}</p>

          <div className="app-home__actions">
            {content.primaryAction && (
              <Link
                className="app-home__button app-home__button--primary"
                to={content.primaryAction.to}
              >
                {content.primaryAction.label}
              </Link>
            )}

            {content.secondaryAction && (
              <Link
                className="app-home__button app-home__button--secondary"
                to={content.secondaryAction.to}
              >
                {content.secondaryAction.label}
              </Link>
            )}
          </div>
        </div>

        <div className="app-home__hero-mark" aria-hidden="true">
          <img src={logoUmari} alt="" />
        </div>
      </section>

      <section className="app-home__metrics" aria-label="Métricas del perfil">
        {content.metrics.map((metric) => (
          <article className="app-home__metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>
              {metricValues[metric.key] || metric.fallback}
            </strong>
          </article>
        ))}
      </section>

      <section className="app-home__grid">
        <article className="app-home__panel">
          <div className="app-home__panel-header">
            <span>01</span>
            <h3>{content.pendingTitle}</h3>
          </div>

          <ul className="app-home__list">
            {content.pending.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="app-home__panel">
          <div className="app-home__panel-header">
            <span>02</span>
            <h3>{content.flowTitle}</h3>
          </div>

          <ol className="app-home__steps">
            {content.flow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </article>

        <article className="app-home__panel app-home__panel--accent">
          <div className="app-home__panel-header">
            <span>03</span>
            <h3>Estado de acceso</h3>
          </div>

          <div className="app-home__access">
            <div>
              <span>Permisos</span>
              <strong>{permissions.length}</strong>
            </div>

            <div>
              <span>Módulos</span>
              <strong>{modules.length}</strong>
            </div>

            <div>
              <span>Sesión</span>
              <strong>Activa</strong>
            </div>
          </div>
        </article>
      </section>
    </section>
  )
}