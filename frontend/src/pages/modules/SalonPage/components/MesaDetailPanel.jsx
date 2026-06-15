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

export default function MesaDetailPanel({ mesa, zona, onEdit, onChangeDispo, onToggleStatus, onDelete, onClose }) {
  const [dispOpen, setDispOpen] = useState(false)
  const disp = DISP[mesa.disponibilidad] || DISP.LIBRE
  const hasActiveOrders = (mesa.active_order_count || 0) > 0

  return (
    <div className="salon-detail">
      <div className="salon-detail__header">
        <h3 className="salon-detail__title">{mesa.nombre || mesa.numero}</h3>
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
          <div className="salon-detail__row">
            <span>Órdenes activas</span>
            <strong>{mesa.active_order_count}</strong>
          </div>
        )}
      </div>

      <button className="salon-detail__btn-edit" onClick={onEdit}>
        <IconEdit /> Editar mesa
      </button>

      {hasActiveOrders ? (
        <div style={{ marginTop: 16, padding: "12px 14px", background: "#fef2f2", borderRadius: 8, border: "1px solid #fecaca" }}>
          <p style={{ fontSize: 13, color: "#dc2626", margin: 0, fontWeight: 500 }}>
            Esta mesa tiene {mesa.active_order_count} orden(es) activa(s).
          </p>
          <p style={{ fontSize: 12, color: "#ef4444", margin: "4px 0 0" }}>
            Ciérralas desde caja para cambiar el estado o eliminar la mesa.
          </p>
        </div>
      ) : (
        <>
          <div className="salon-detail__dispo-wrap">
            <button
              className="salon-detail__btn-dispo"
              onClick={() => setDispOpen(o => !o)}
            >
              Cambiar estado
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