// src/pages/modules/CashierPage/AperturaGate.jsx

import { useEffect, useState } from "react"
import "./AperturaGate.css"

import { getCajasDisponibles, abrirCaja } from "../../../services/cashierService"
import useToast from "../../../components/common/Toast/useToast"

// ── AperturaGate ──────────────────────────────────────────────────
// Pantalla que bloquea el acceso al módulo de Caja hasta que el
// cajero abre un turno (apertura_caja). Al confirmar, dispara
// onAperturaExitosa con los datos reales de la apertura creada.

export default function AperturaGate({ onAperturaExitosa }) {
  const { showToast } = useToast()

  const [cajas, setCajas] = useState([])
  const [isLoadingCajas, setIsLoadingCajas] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [idCaja, setIdCaja] = useState("")
  const [montoInicial, setMontoInicial] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCajas() {
      try {
        const data = await getCajasDisponibles()

        if (!isMounted) return

        setCajas(data)

        if (data.length > 0) {
          setIdCaja(data[0].id_caja)
        }

        setLoadError("")
      } catch (err) {
        if (!isMounted) return

        setLoadError(err.message || "No se pudieron cargar las cajas disponibles.")
      } finally {
        if (isMounted) {
          setIsLoadingCajas(false)
        }
      }
    }

    loadCajas()

    return () => {
      isMounted = false
    }
  }, [])

  const canSubmit =
    idCaja !== "" &&
    montoInicial !== "" &&
    !Number.isNaN(parseFloat(montoInicial)) &&
    parseFloat(montoInicial) >= 0 &&
    !isSubmitting

  async function handleSubmit(e) {
    e.preventDefault()

    if (!canSubmit) {
      setError("Selecciona una caja e ingresa un monto inicial válido.")
      return
    }

    setError("")

    try {
      setIsSubmitting(true)

      const apertura = await abrirCaja({
        id_caja: idCaja,
        monto_inicial: parseFloat(montoInicial),
        observaciones: observaciones.trim() || null,
      })

      showToast({
        type: "success",
        title: "Caja abierta",
        message: `Turno abierto en ${apertura.caja_nombre}.`,
      })

      onAperturaExitosa(apertura)
    } catch (err) {
      const message = err.message || "No se pudo abrir el turno de caja."

      setError(message)

      showToast({
        type: "error",
        title: "No se pudo abrir la caja",
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingCajas) {
    return (
      <div className="apertura-gate">
        <div className="apertura-gate__card">
          <p>Cargando cajas disponibles...</p>
        </div>
      </div>
    )
  }

  if (loadError || cajas.length === 0) {
    return (
      <div className="apertura-gate">
        <div className="apertura-gate__card">
          <p className="apertura-gate__error">
            {loadError || "No hay cajas disponibles para este establecimiento."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="apertura-gate">
      <form className="apertura-gate__card" onSubmit={handleSubmit}>
        <div className="apertura-gate__heading">
          <p className="apertura-gate__eyebrow">Caja y pagos</p>
          <h1>Apertura de caja</h1>
          <p>Registra el monto inicial para comenzar tu turno.</p>
        </div>

        <div className="apertura-gate__field">
          <label htmlFor="apertura-caja">Caja</label>
          <select
            id="apertura-caja"
            value={idCaja}
            onChange={(e) => setIdCaja(e.target.value)}
          >
            {cajas.map((caja) => (
              <option key={caja.id_caja} value={caja.id_caja}>
                {caja.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="apertura-gate__field">
          <label htmlFor="apertura-monto">Monto inicial</label>
          <input
            id="apertura-monto"
            type="number"
            min="0"
            step="0.10"
            placeholder="S/ 0.00"
            value={montoInicial}
            onChange={(e) => setMontoInicial(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault()
              }
            }}
          />
        </div>

        <div className="apertura-gate__field">
          <label htmlFor="apertura-observaciones">Observaciones (opcional)</label>
          <textarea
            id="apertura-observaciones"
            rows={3}
            placeholder="Ej. Turno de mañana, caja revisada."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {error && <p className="apertura-gate__error">{error}</p>}

        <button type="submit" className="apertura-gate__submit" disabled={!canSubmit}>
          {isSubmitting ? "Abriendo..." : "Abrir caja"}
        </button>
      </form>
    </div>
  )
}