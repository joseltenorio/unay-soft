// frontend/src/pages/AppHome/AppHome.jsx

import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts"
import {
  DollarSign, Receipt, Users, LayoutGrid,
  CheckCircle, UtensilsCrossed, UserPlus, AlertTriangle,
  TrendingUp, TrendingDown,
} from "lucide-react"

import Footer from "../../components/layout/Footer/Footer"

import {
  getCurrentModules,
  getCurrentPermissions,
  getCurrentUser,
} from "../../services/authService"
import { getUsers } from "../../services/userService"

import "./AppHome.css"

const SALES_DATA = [
  { day: "Lun", ingresos: 3200 },
  { day: "Mar", ingresos: 2800 },
  { day: "Mié", ingresos: 4100 },
  { day: "Jue", ingresos: 3600 },
  { day: "Vie", ingresos: 5200 },
  { day: "Sáb", ingresos: 6800 },
  { day: "Hoy", ingresos: 4820 },
]

const RECENT_ORDERS = [
  {
    id: "ORD-0041",
    mesa: "Mesa 1",
    productos: "Ceviche Clásico, Ceviche Mixto",
    total: "S/ 99.12",
    mozo: "Lucía Mejía",
    estado: "prep",
    estadoLabel: "En preparación",
    tiempo: "hace 25 min",
  },
  {
    id: "ORD-0040",
    mesa: "Mesa 3",
    productos: "Jalea Mixta, Arroz c/ Mariscos",
    total: "S/ 118.00",
    mozo: "Lucía Mejía",
    estado: "paid",
    estadoLabel: "Pagada",
    tiempo: "hace 1 hora",
  },
  {
    id: "ORD-0039",
    mesa: "Para llevar",
    productos: "Arroz con Mariscos",
    total: "S/ 56.64",
    mozo: "Lucía Mejía",
    estado: "done",
    estadoLabel: "Lista",
    tiempo: "hace 18 min",
  },
  {
    id: "ORD-0038",
    mesa: "Mesa 7",
    productos: "Tiradito, Sudado de Pescado",
    total: "S/ 142.00",
    mozo: "Carlos Ríos",
    estado: "cancel",
    estadoLabel: "Cancelada",
    tiempo: "hace 2 horas",
  },
]

const ACTIVITY = [
  {
    id: 1,
    icon: CheckCircle,
    color: "teal",
    title: "Orden #ORD-0041 pagada",
    sub: "Cajero · Marcos Salazar",
    time: "hace 3 min",
  },
  {
    id: 2,
    icon: UtensilsCrossed,
    color: "amber",
    title: "Mesa 3 abierta en salón",
    sub: "Mozo · Lucía Mejía",
    time: "hace 8 min",
  },
  {
    id: 3,
    icon: UserPlus,
    color: "green",
    title: "Usuario nuevo registrado",
    sub: "Admin · Jose Tenorio",
    time: "hace 22 min",
  },
  {
    id: 4,
    icon: AlertTriangle,
    color: "coral",
    title: "Stock bajo: Pescado fresco",
    sub: "Inventario · alerta automática",
    time: "hace 35 min",
  },
]

const roleContent = {
  Administrador: {
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
      "Crear o editar cuentas.",
      "Validar acceso por perfil.",
      "Cerrar sesión al finalizar.",
    ],
    primaryAction: { label: "Gestionar usuarios", to: "/app/security" },
    secondaryAction: { label: "Revisar reportes", to: "/app/bi" },
  },
  Gerente: {
    pendingTitle: "Pendientes de supervisión",
    pending: [
      "Revisar el estado de caja.",
      "Validar inventario crítico.",
      "Consultar reportes del día.",
      "Supervisar salón y cocina.",
    ],
    flowTitle: "Áreas clave",
    flow: [
      "Salón y pedidos.",
      "Caja y pagos.",
      "Inventario e insumos.",
      "Reportes operativos.",
    ],
    primaryAction: { label: "Ir a reportes", to: "/app/bi" },
    secondaryAction: { label: "Revisar caja", to: "/app/cashier" },
  },
  Cajero: {
    pendingTitle: "Pendientes de caja",
    pending: [
      "Revisar pagos pendientes.",
      "Validar comprobantes.",
      "Preparar cierre del turno.",
      "Confirmar operaciones.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Abrir caja.",
      "Registrar pagos.",
      "Validar comprobantes.",
      "Cerrar turno.",
    ],
    primaryAction: { label: "Ir a caja", to: "/app/cashier" },
    secondaryAction: { label: "Ir a POS", to: "/app/pos" },
  },
  Mozo: {
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
    primaryAction: { label: "Ir a POS / Salón", to: "/app/pos" },
    secondaryAction: null,
  },
  Cocina: {
    pendingTitle: "Pendientes de cocina",
    pending: [
      "Revisar pedidos nuevos.",
      "Priorizar pedidos antiguos.",
      "Actualizar estados.",
      "Avisar pedidos listos.",
    ],
    flowTitle: "Flujo recomendado",
    flow: [
      "Tomar pedido.",
      "Marcar en preparación.",
      "Finalizar pedido.",
      "Despachar a salón.",
    ],
    primaryAction: { label: "Ir a Cocina / KDS", to: "/app/kds" },
    secondaryAction: null,
  },
}

const defaultRoleContent = {
  pendingTitle: "Pendientes",
  pending: [
    "Revisar accesos asignados.",
    "Ingresar al módulo.",
    "Reportar accesos faltantes.",
  ],
  flowTitle: "Flujo recomendado",
  flow: [
    "Ingresar al sistema.",
    "Seleccionar módulo.",
    "Realizar operación.",
  ],
  primaryAction: { label: "Ir al sistema", to: "/app" },
  secondaryAction: null,
}

function getGreeting() {
  const h = new Date().getHours()

  if (h < 12) return "Buenos días"
  if (h < 19) return "Buenas tardes"

  return "Buenas noches"
}

function formatDay() {
  return new Intl.DateTimeFormat("es-PE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

function getFirstName(user) {
  return user?.nombres?.split(" ")?.[0] || "Usuario"
}

function getInitials(user) {
  const a = user?.nombres?.split(" ")?.[0]?.[0] || "U"
  const b = user?.apellidos?.split(" ")?.[0]?.[0] || ""

  return (a + b).toUpperCase()
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="ah-tooltip">
      <span className="ah-tooltip__label">{label}</span>
      <span className="ah-tooltip__val">
        S/ {payload[0].value.toLocaleString("es-PE")}
      </span>
    </div>
  )
}

export default function AppHome() {
  const user = useMemo(() => getCurrentUser(), [])
  const permissions = useMemo(() => getCurrentPermissions(), [])
  const modules = useMemo(() => getCurrentModules(), [])

  const [adminStats, setAdminStats] = useState({
    activeUsers: null,
    inactiveUsers: null,
  })

  const roleContent_ = roleContent[user?.rol] || defaultRoleContent

  useEffect(() => {
    if (!permissions.includes("security.gestionar_usuarios")) return

    let alive = true

    getUsers()
      .then((users) => {
        if (!alive) return

        setAdminStats({
          activeUsers: users.filter((u) => u.estado).length,
          inactiveUsers: users.filter((u) => !u.estado).length,
        })
      })
      .catch(() => {})

    return () => {
      alive = false
    }
  }, [permissions])

  const kpis = [
    {
      icon: DollarSign,
      color: "teal",
      label: "Ingresos hoy",
      value: "S/ 4,820",
      trend: "+12%",
      trendUp: true,
    },
    {
      icon: Receipt,
      color: "amber",
      label: "Pedidos activos",
      value: "38",
      trend: "+8%",
      trendUp: true,
    },
    {
      icon: Users,
      color: "green",
      label: "Usuarios activos",
      value:
        adminStats.activeUsers !== null
          ? String(adminStats.activeUsers)
          : String(modules.length > 0 ? 6 : 0),
      trend: "+2",
      trendUp: true,
    },
    {
      icon: LayoutGrid,
      color: "coral",
      label: "Mesas ocupadas",
      value: "4 / 6",
      trend: "2 libres",
      trendUp: false,
    },
  ]

  return (
    <div className="ah">
      <div className="ah__content">
        <div className="ah__topbar">
          <div className="ah__topbar-left">
            <div className="ah__avatar">{getInitials(user)}</div>

            <div>
              <h1 className="ah__greeting">
                {getGreeting()}, {getFirstName(user)}
              </h1>

              <p className="ah__sub">
                Control Operativo · <span>{formatDay()}</span>
              </p>
            </div>
          </div>

          <div className="ah__topbar-right">
            <span className="ah__role-badge">
              <span className="ah__role-dot" />
              {user?.rol || "Usuario"}
            </span>

            <span className="ah__notif-badge">🔔 3</span>

            {roleContent_.primaryAction && (
              <Link className="ah__cta" to={roleContent_.primaryAction.to}>
                {roleContent_.primaryAction.label}
              </Link>
            )}
          </div>
        </div>

        <div className="ah__kpis">
          {kpis.map((kpi) => {
            const Icon = kpi.icon

            return (
              <div key={kpi.label} className="ah__kpi">
                <div className="ah__kpi-top">
                  <span className={`ah__kpi-icon ah__kpi-icon--${kpi.color}`}>
                    <Icon size={18} strokeWidth={2} />
                  </span>

                  <span
                    className={`ah__kpi-trend ${
                      kpi.trendUp ? "ah__kpi-trend--up" : "ah__kpi-trend--down"
                    }`}
                  >
                    {kpi.trendUp ? (
                      <TrendingUp size={11} strokeWidth={2.5} />
                    ) : (
                      <TrendingDown size={11} strokeWidth={2.5} />
                    )}

                    {kpi.trend}
                  </span>
                </div>

                <div className="ah__kpi-val">{kpi.value}</div>
                <div className="ah__kpi-label">{kpi.label}</div>
              </div>
            )
          })}
        </div>

        <div className="ah__grid2">
          <div className="ah__card">
            <div className="ah__card-header">
              <div>
                <div className="ah__card-title">Resumen de ingresos</div>
                <div className="ah__card-sub">Últimos 7 días</div>
              </div>

              <span className="ah__card-pill">Esta semana</span>
            </div>

            <div className="ah__legend">
              <span className="ah__leg-item">
                <span className="ah__leg-sq ah__leg-sq--dark" />
                Ingresos
              </span>

              <span className="ah__leg-item">
                <span className="ah__leg-sq ah__leg-sq--teal" />
                Hoy
              </span>
            </div>

            <ResponsiveContainer width="100%" height={168}>
              <BarChart
                data={SALES_DATA}
                barSize={26}
                margin={{ top: 4, right: 0, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: "#68706c" }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#68706c" }}
                  tickFormatter={(v) => `S/${Math.round(v / 1000)}k`}
                  width={38}
                />

                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(3,25,38,0.04)" }}
                />

                <Bar dataKey="ingresos" radius={[6, 6, 0, 0]}>
                  {SALES_DATA.map((entry) => (
                    <Cell
                      key={entry.day}
                      fill={entry.day === "Hoy" ? "#77aca2" : "#031926"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="ah__card">
            <div className="ah__card-header">
              <div>
                <div className="ah__card-title">Actividad reciente</div>
                <div className="ah__card-sub">Últimas acciones del sistema</div>
              </div>
            </div>

            <ul className="ah__activity">
              {ACTIVITY.map((item) => {
                const Icon = item.icon

                return (
                  <li key={item.id} className="ah__act-item">
                    <span className={`ah__act-dot ah__act-dot--${item.color}`}>
                      <Icon size={14} strokeWidth={2.2} />
                    </span>

                    <div className="ah__act-info">
                      <strong>{item.title}</strong>
                      <span>{item.sub}</span>
                    </div>

                    <span className="ah__act-time">{item.time}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="ah__card">
          <div className="ah__card-header">
            <div>
              <div className="ah__card-title">Pedidos recientes</div>
              <div className="ah__card-sub">Órdenes del día en curso</div>
            </div>

            <button className="ah__card-pill ah__card-pill--btn">
              Ver todos
            </button>
          </div>

          <div className="ah__table-wrap">
            <table className="ah__table">
              <thead>
                <tr>
                  <th>Orden</th>
                  <th>Mesa</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Mozo</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div className="ah__tbl-id">{o.id}</div>
                      <div className="ah__tbl-sub">{o.tiempo}</div>
                    </td>

                    <td>{o.mesa}</td>

                    <td className="ah__tbl-prods">{o.productos}</td>

                    <td>
                      <strong>{o.total}</strong>
                    </td>

                    <td>{o.mozo}</td>

                    <td>
                      <span className={`ah__status ah__status--${o.estado}`}>
                        {o.estadoLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ah__panels">
          <div className="ah__panel">
            <div className="ah__panel-hdr">
              <span className="ah__panel-num">01</span>
              <h3>{roleContent_.pendingTitle}</h3>
            </div>

            <ul className="ah__plist">
              {roleContent_.pending.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="ah__panel">
            <div className="ah__panel-hdr">
              <span className="ah__panel-num">02</span>
              <h3>{roleContent_.flowTitle}</h3>
            </div>

            <ol className="ah__steps">
              {roleContent_.flow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>

          <div className="ah__panel ah__panel--accent">
            <div className="ah__panel-hdr">
              <span className="ah__panel-num">03</span>
              <h3>Estado de acceso</h3>
            </div>

            <div className="ah__access">
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
          </div>
        </div>
      </div>

      <div className="ah__footer-band">
        <div className="ah__footer-shell">
          <Footer />
        </div>
      </div>
    </div>
  )
}