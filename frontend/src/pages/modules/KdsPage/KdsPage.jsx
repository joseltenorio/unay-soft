// frontend/src/pages/modules/KdsPage/KdsPage.jsx

import { useMemo, useState } from "react"
import {
  Bell,
  Check,
  Clock3,
  Filter,
  Menu,
  PhoneCall,
  Search,
  UtensilsCrossed,
} from "lucide-react"

import logoUmari from "../../../assets/icons/logo-umari-dark.svg"

import "./KdsPage.css"

const TIME_THRESHOLDS = {
  fresh: 5,   
  normal: 10, 
  warn: 15,   
}

const MOCK_ORDERS = [
  {
    id: "#009",
    table: "M4",
    waiter: "Luis",
    elapsedMinutes: 4,
    status: "new",
    items: [
      { id: 1, name: "Ceviche clásico", quantity: 2, notes: ["Sin ají", "Sin cebolla"], done: false },
      { id: 2, name: "Chicha morada",   quantity: 1, notes: ["Sin hielo"],             done: false },
      { id: 3, name: "Arroz con mariscos", quantity: 1, notes: ["Extra limón"],        done: false },
    ],
  },
  {
    id: "#008",
    table: "M1",
    waiter: "Andrea",
    elapsedMinutes: 2,
    status: "new",
    items: [
      { id: 4, name: "Leche de tigre", quantity: 1, notes: ["Picante normal"], done: false },
      { id: 5, name: "Jalea mixta",    quantity: 1, notes: ["Sin yuyo"],       done: false },
    ],
  },
  {
    id: "#006",
    table: "M8",
    waiter: "Carlos",
    elapsedMinutes: 8,
    status: "process",
    items: [
      { id: 6, name: "Tiradito de pescado", quantity: 3, notes: ["Salsa aparte"], done: true  },
      { id: 7, name: "Causa acevichada",    quantity: 1, notes: ["Sin palta"],    done: false },
      { id: 8, name: "Maracuyá frozen",     quantity: 2, notes: [],               done: false },
    ],
  },
  {
    id: "#004",
    table: "M23",
    waiter: "Sofía",
    elapsedMinutes: 11,
    status: "process",
    items: [
      { id: 9,  name: "Parihuela",           quantity: 2, notes: ["Bien caliente"],     done: true  },
      { id: 10, name: "Chaufa de mariscos",  quantity: 1, notes: ["Sin langostino"],    done: false },
    ],
  },
  {
    id: "#003",
    table: "M2",
    waiter: "Luis",
    elapsedMinutes: 7,
    status: "done",
    items: [
      { id: 11, name: "Ceviche mixto", quantity: 1, notes: ["Sin cancha"], done: true },
      { id: 12, name: "Inca Kola",     quantity: 2, notes: [],             done: true },
    ],
  },
  {
    id: "#001",
    table: "M12",
    waiter: "Andrea",
    elapsedMinutes: 17,
    status: "process",
    items: [
      { id: 13, name: "Sudado de mero",      quantity: 1, notes: ["Bien caliente"],  done: false },
      { id: 14, name: "Arroz blanco",         quantity: 2, notes: [],                done: true  },
      { id: 15, name: "Limonada frozen",      quantity: 2, notes: ["Extra menta"],   done: false },
    ],
  },
]

const STATUS_FILTERS = [
  { id: "all",     label: "Todos"      },
  { id: "new",     label: "Nuevos"     },
  { id: "process", label: "En proceso" },
  { id: "done",    label: "Listos"     },
]

function getTimeUrgencyClass(minutes) {
  if (minutes <= TIME_THRESHOLDS.fresh)  return "time--fresh"
  if (minutes <= TIME_THRESHOLDS.normal) return "time--normal"
  if (minutes <= TIME_THRESHOLDS.warn)   return "time--warn"
  return "time--critical"
}

function formatElapsed(minutes) {
  const m = String(Math.floor(minutes)).padStart(2, "0")
  return `${m}:00`
}

function getStatusLabel(status) {
  return { new: "Nuevo", process: "En proceso", done: "Listo" }[status] ?? "Pendiente"
}

function getPrimaryAction(status) {
  return { new: "Iniciar", process: "Finalizar", done: "Entregado" }[status] ?? "Actualizar"
}

function getFilterCount(orders, filterId) {
  if (filterId === "all") return orders.length
  return orders.filter((o) => o.status === filterId).length
}

export default function KdsPage() {
  const [activeFilter, setActiveFilter]   = useState("all")
  const [orders, setOrders]               = useState(MOCK_ORDERS)

  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return orders
    return orders.filter((o) => o.status === activeFilter)
  }, [activeFilter, orders])

  function handleAdvanceStatus(orderId) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const next = { new: "process", process: "done", done: "done" }[order.status]
        return { ...order, status: next }
      })
    )
  }

  function handleToggleItem(orderId, itemId) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        return {
          ...order,
          items: order.items.map((item) =>
            item.id === itemId ? { ...item, done: !item.done } : item
          ),
        }
      })
    )
  }

  return (
    <div className="kds-page">

      <header className="kds-topbar">
        <div className="kds-topbar__brand">
          <button
            className="kds-menu-button"
            type="button"
            aria-label="Abrir navegación"
            title="Abrir navegación"
          >
            <Menu size={21} />
          </button>

          <img
            src={logoUmari}
            alt=""
            className="kds-brand-logo"
            aria-hidden="true"
          />

          <div className="kds-title-block">
            <p>Umarí OS</p>
            <h1>Monitor de Cocina</h1>
          </div>
        </div>

        <div className="kds-topbar__tools">
          <label className="kds-search">
            <Search size={19} />
            <input type="search" placeholder="Buscar comanda, mesa o plato…" />
          </label>

          <button
            className="kds-notification-button"
            type="button"
            aria-label="Ver notificaciones"
          >
            <Bell size={19} />
          </button>

          <span className="kds-topbar__divider" aria-hidden="true" />

          <div className="kds-user-summary" aria-label="Usuario actual">
            <div className="kds-user-avatar" aria-hidden="true">
              CA
            </div>

            <div>
              <strong>Chef Agus</strong>
              <span>Cocina</span>
            </div>
          </div>
        </div>
      </header>

      <main className="kds-shell">

        <section className="kds-board-toolbar">
          <div className="kds-filter-tabs" role="tablist" aria-label="Filtros de comandas">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                role="tab"
                aria-selected={activeFilter === filter.id}
                className={
                  activeFilter === filter.id
                    ? "kds-filter-tab kds-filter-tab--active"
                    : "kds-filter-tab"
                }
                type="button"
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
                <span className="kds-filter-tab__count">
                  {getFilterCount(orders, filter.id)}
                </span>
              </button>
            ))}
          </div>

          <button className="kds-secondary-button" type="button">
            <Filter size={16} />
            Filtrar
          </button>
        </section>

        <section className="kds-board" aria-label="Tablero de comandas">
          {filteredOrders.length === 0 ? (
            <div className="kds-board-empty">
              <UtensilsCrossed size={28} />
              <p>Sin comandas en esta categoría</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAdvance={handleAdvanceStatus}
                onToggleItem={handleToggleItem}
              />
            ))
          )}
        </section>
      </main>
    </div>
  )
}

function OrderCard({ order, onAdvance, onToggleItem }) {
  const timeClass = getTimeUrgencyClass(order.elapsedMinutes)
  const doneCount = order.items.filter((i) => i.done).length
  const totalItems = order.items.length
  const progressPct = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0

  return (
    <article
      className={`kds-order-card kds-order-card--${order.status}`}
      aria-label={`Comanda ${order.id}, mesa ${order.table}`}
    >
      <header className="kds-order-card__header">
        <div className="kds-order-card__header-left">
          <strong className="kds-order-card__id">{order.id}</strong>

          <span className={`kds-order-card__time ${timeClass}`}>
            <Clock3 size={12} strokeWidth={2.5} />
            {formatElapsed(order.elapsedMinutes)}
          </span>
        </div>

        <div className="kds-order-card__header-right">
          <span className="kds-order-card__table">{order.table}</span>
          <small className="kds-order-card__status-badge">
            {getStatusLabel(order.status)}
          </small>
        </div>
      </header>

      {order.status === "process" && (
        <div className="kds-order-card__progress-bar" aria-hidden="true">
          <div
            className="kds-order-card__progress-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      )}

      <div className="kds-order-card__body">
        {order.items.map((item) => (
          <div className="kds-order-item" key={item.id}>
            <button
              className={
                item.done
                  ? "kds-check-button kds-check-button--done"
                  : "kds-check-button"
              }
              type="button"
              aria-label={`Marcar ${item.name} como ${item.done ? "pendiente" : "listo"}`}
              onClick={() => onToggleItem(order.id, item.id)}
            >
              {item.done && <Check size={12} strokeWidth={3} />}
            </button>

            <div className="kds-order-item__main">
              <div className="kds-order-item__info">
                <strong className={item.done ? "is-done" : ""}>
                  {item.name}
                </strong>

                {item.notes.length > 0 && (
                  <ul className="kds-order-item__notes">
                    {item.notes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
              </div>

              <span className="kds-order-item__qty">{item.quantity}×</span>
            </div>
          </div>
        ))}
      </div>

      <footer className="kds-order-card__footer">
        <button
          className="kds-waiter-button"
          type="button"
          aria-label={`Llamar mesero de la comanda ${order.id}`}
        >
          <PhoneCall size={15} strokeWidth={2.2} />
          Llamar mesero
        </button>

        <button
          className={`kds-action-button kds-action-button--${order.status}`}
          type="button"
          onClick={() => onAdvance(order.id)}
          disabled={order.status === "done"}
        >
          {getPrimaryAction(order.status)}
        </button>
      </footer>
    </article>
  )
}