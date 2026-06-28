// src/pages/modules/CartaPage/components/QRModal.jsx

import { useEffect, useState } from "react"

import { getQR } from "../../../../services/qrService"

export default function QRModal({ onClose }) {
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadQR() {
      try {
        const generatedQr = await getQR()

        if (isMounted) {
          setQr(generatedQr)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "No se pudo generar el QR.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadQR()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleDescargar() {
    if (!qr?.imagen_qr) return

    try {
      const response = await fetch(qr.imagen_qr)
      const blob = await response.blob()
      const urlBlob = window.URL.createObjectURL(blob)
      const link = document.createElement("a")

      link.href = urlBlob
      link.download = `qr-carta-${qr.tenant_slug || "umari"}.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(urlBlob)
    } catch {
      const link = document.createElement("a")

      link.href = qr.imagen_qr
      link.target = "_blank"
      link.download = `qr-carta-${qr.tenant_slug || "umari"}.png`
      link.click()
    }
  }

  function handleCopiarLink() {
    if (!qr?.url_destino) return

    navigator.clipboard
      .writeText(qr.url_destino)
      .then(() => {
        setCopiado(true)
        setTimeout(() => setCopiado(false), 2000)
      })
      .catch(() => alert("No se pudo copiar el enlace automáticamente."))
  }

  return (
    <div
      className="modal-overlay"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="modal" style={{ textAlign: "center", maxWidth: 380 ,position: "relative"}}>
        <h2>QR de tu carta digital</h2>

        {loading && <p style={{ color: "#6b7280" }}>Generando código QR...</p>}

        {error && <p style={{ color: "#dc2626", fontSize: 14 }}>{error}</p>}

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

            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                wordBreak: "break-all",
                marginBottom: 16,
              }}
            >
              {qr.url_destino}
            </p>

            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                className="carta__btn carta__btn--secondary"
                type="button"
                onClick={handleCopiarLink}
                style={
                  copiado ? { backgroundColor: "#e2e8f0", color: "#0f172a" } : {}
                }
              >
                {copiado ? "¡Copiado! ✓" : "Copiar link"}
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
        aria-label="Cerrar"
        title="Cerrar"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          fontSize: 24,
          color: "#6b7280",
          cursor: "pointer",
          padding: 0,
          }}
          >
            ✕
            </button>
      </div>
    </div>
  )
}
