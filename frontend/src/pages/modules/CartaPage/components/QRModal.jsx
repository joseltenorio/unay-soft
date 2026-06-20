// src/pages/modules/CartaPage/components/QRModal.jsx

import { useEffect, useState } from "react"
import { getQR } from "../../../../services/qrService"

export default function QRModal({ onClose }) {
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getQR()
      .then(setQr)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  function handleDescargar() {
    if (!qr?.imagen_qr) return
    const link = document.createElement("a")
    link.href = qr.imagen_qr
    link.download = "qr-carta-umari.png"
    link.click()
  }

  function handleCopiarLink() {
    if (!qr?.url_destino) return
    navigator.clipboard.writeText(qr.url_destino)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ textAlign: "center", maxWidth: 380 }}>
        <h2>QR de tu carta digital</h2>

        {loading && <p style={{ color: "#6b7280" }}>Generando código QR...</p>}

        {error && (
          <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>
        )}

        {qr && !loading && (
          <>
            <img
              src={qr.imagen_qr}
              alt="QR de la carta"
              style={{
                width: 220,
                height: 220,
                margin: "0 auto 16px",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 12,
              }}
            />

            <p style={{ fontSize: 13, color: "#6b7280", wordBreak: "break-all", marginBottom: 16 }}>
              {qr.url_destino}
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="carta__btn carta__btn--secondary"
                type="button"
                onClick={handleCopiarLink}
              >
                Copiar link
              </button>
              <button
                className="carta__btn carta__btn--primary"
                type="button"
                onClick={handleDescargar}
              >
                Descargar QR
              </button>
            </div>
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 20,
            background: "none",
            border: "none",
            color: "#6b7280",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}