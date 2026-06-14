import { useState } from "react"

const IconX = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

export default function ConfirmModal({ mensaje, onConfirm, onClose }) {
  return (
    <div className="salon-modal-overlay" onClick={onClose}>
      <div className="salon-modal salon-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="salon-modal__header">
          <h2 className="salon-modal__title">Confirmar acción</h2>
          <button className="salon-modal__close" onClick={onClose}><IconX /></button>
        </div>
        <div className="salon-modal__form">
          <p style={{ color: "#374151", lineHeight: 1.6 }}>{mensaje}</p>
          <div className="salon-modal__actions">
            <button className="salon-modal__btn-cancel" onClick={onClose}>Cancelar</button>
            <button className="salon-modal__btn-danger" onClick={onConfirm}>Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

