export default function ConfirmModal({ mensaje, onConfirm, onClose }) {
  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
        <div className="pm__header">
          <div className="pm__header-left">
            <div className="pm__icon-wrap" style={{ background: "#fee2e2", color: "#dc2626" }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </div>
            <div>
              <h2 className="pm__title" style={{ fontSize: "1.1rem" }}>Confirmar Eliminación</h2>
              <p className="pm__subtitle" style={{ whiteSpace: "pre-line" }}>{mensaje}</p>
            </div>
          </div>
          <button className="pm__close" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="pm__actions" style={{ padding: "16px 28px 24px" }}>
          <button className="pm__btn-cancel" onClick={onClose}>Cancelar</button>
          <button
            className="pm__btn-save"
            style={{ background: "#dc2626" }}
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}