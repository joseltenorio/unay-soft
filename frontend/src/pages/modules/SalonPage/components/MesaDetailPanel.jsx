// src/pages/modules/SalonPage/components/MesaDetailPanel.jsx

import { useState } from "react"

const IconEdit = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)
const IconTrash = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

const DISP = {
  LIBRE:        { label: "Disponible",        color: "#16a34a", bg: "#dcfce7", dot: "#16a34a" },
  OCUPADA:      { label: "Ocupada",           color: "#dc2626", bg: "#fee2e2", dot: "#dc2626" },
  RESERVADA:    { label: "Reservada",         color: "#d97706", bg: "#fef3c7", dot: "#d97706" },
  MANTENIMIENTO:{ label: "Fuera de servicio", color: "#6b7280", bg: "#f3f4f6", dot: "#9ca3af" },
}

const DISP_OPTIONS = Object.keys(DISP)

function formatCurrency(value) {
  return `S/ ${Number(value || 0).toFixed(2)}`
}

function formatDateTime(value) {
  if (!value) {
    return "Sin registro"
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function getUserDisplayName(user) {
  if (!user) {
    return "Sin responsable"
  }

  return [user.nombres, user.apellidos].filter(Boolean).join(" ").trim() ||
    user.username ||
    "Sin responsable"
}

export default function MesaDetailPanel({ mesa, zona, onEdit, onChangeDispo, onDelete, onClose }) {
  const esBarra = zona?.nombre?.toLowerCase().includes("barra")
  const label = esBarra ? "Asiento" : "Mesa"
  const [dispOpen, setDispOpen] = useState(false)
  const disp = DISP[mesa.disponibilidad] || DISP.LIBRE
  const activeOrderCount = Number(mesa.active_order_count || 0)
  const hasActiveOrders = activeOrderCount > 0
  const tableService = mesa.table_service || {}
  const responsibleName = getUserDisplayName(tableService.responsible_user)
  const activeTotal = Number(mesa.active_total || tableService.active_total || 0)
  const lastOrderAt = mesa.last_order_at || tableService.last_order_at

  return (
    <div className="salon-detail">
      <div className="salon-detail__header">
          <h3 className="salon-detail__title">{mesa.nombre || `${label} ${mesa.numero}`}</h3>
        <button className="salon-modal__close" onClick={onClose}><IconX /></button>
      </div>

      <div className="salon-detail__rows">
        <div className="salon-detail__row">
          <span>Número</span>
          <strong>{mesa.numero}</strong>
        </div>
        <div className="salon-detail__row">
          <span>Capacidad</span>
          <strong>{mesa.capacidad} personas</strong>
        </div>
        <div className="salon-detail__row">
          <span>Zona</span>
          <strong>{zona?.nombre || "Sin zona"}</strong>
        </div>
        <div className="salon-detail__row">
          <span>Estado</span>
          <strong>
            <span className="salon-detail__badge" style={{ background: disp.bg, color: disp.color }}>
              {disp.label}
            </span>
          </strong>
        </div>

        {hasActiveOrders && (
          <>
            <div className="salon-detail__row">
              <span>Responsable</span>
              <strong>{responsibleName}</strong>
            </div>
            <div className="salon-detail__row">
              <span>Comandas activas</span>
              <strong>{activeOrderCount}</strong>
            </div>
            <div className="salon-detail__row">
              <span>Total activo</span>
              <strong>{formatCurrency(activeTotal)}</strong>
            </div>
            <div className="salon-detail__row">
              <span>Última atención</span>
              <strong>{formatDateTime(lastOrderAt)}</strong>
            </div>
          </>
        )}
      </div>

      {hasActiveOrders && (
        <section className="salon-detail__account">
          <div>
            <span>Cuenta abierta</span>
            <strong>{formatCurrency(activeTotal)}</strong>
          </div>

          <p>
            Esta mesa tiene comanda(s) activa(s). La mesa se
            libera desde caja cuando se cierre la cuenta.
          </p>
        </section>
      )}

      <div className="salon-detail__section-label">Acciones</div>

      <button className="salon-detail__btn-edit" onClick={onEdit}>
        <IconEdit /> Editar {label.toLowerCase()}
      </button>

      {hasActiveOrders ? (
        <div className="salon-detail__locked">
          <p>
            No se puede cambiar disponibilidad, ni eliminar con cuenta activa.
          </p>
        </div>
      ) : (
        <>
          <div className="salon-detail__dispo-wrap">
            <button
              className="salon-detail__btn-dispo"
              onClick={() => setDispOpen(o => !o)}
            >
              Cambiar disponibilidad
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {dispOpen && (
              <div className="salon-detail__dispo-menu">
                {DISP_OPTIONS.map(key => (
                  <button
                    key={key}
                    className={`salon-detail__dispo-opt ${mesa.disponibilidad === key ? "salon-detail__dispo-opt--active" : ""}`}
                    onClick={() => { onChangeDispo(key); setDispOpen(false) }}
                  >
                    <span className="salon-detail__dot" style={{ background: DISP[key].dot }} />
                    {DISP[key].label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="salon-detail__secondary">
            <button className="salon-detail__danger" onClick={onDelete}>
              <IconTrash /> Eliminar
            </button>
          </div>
        </>
      )}
    </div>
  )
}
