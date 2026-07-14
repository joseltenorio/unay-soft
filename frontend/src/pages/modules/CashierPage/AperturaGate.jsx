// src/pages/modules/CashierPage/AperturaGate.jsx

import { useState } from "react"
import "./AperturaGate.css"

// ── Mocks ─────────────────────────────────────────────────────────

// Cajas disponibles del establecimiento — vendrá del backend (tabla `caja`)
const CAJAS_MOCK = [
  { id_caja: "caja-01", nombre: "Caja Principal" },
  { id_caja: "caja-02", nombre: "Caja Barra" },
]

// ── AperturaGate ──────────────────────────────────────────────────
// Pantalla que bloquea el acceso al módulo de Caja hasta que el
// cajero abre un turno (apertura_caja). Al confirmar, dispara
// onAperturaExitosa con los datos de la apertura creada.

export default function AperturaGate({ onAperturaExitosa }) {
  // Caja seleccionada para abrir turno
  const [idCaja, setIdCaja] = useState(CAJAS_MOCK[0]?.id_caja || "")

  // Monto inicial declarado por el cajero
  const [montoInicial, setMontoInicial] = useState("")

  // Observaciones opcionales de apertura
  const [observaciones, setObservaciones] = useState("")

  // Mensaje de error de validación
  const [error, setError] = useState("")

  // Habilita el botón solo si hay caja seleccionada y monto válido
  const canSubmit =
    idCaja !== "" &&
    montoInicial !== "" &&
    !Number.isNaN(parseFloat(montoInicial)) &&
    parseFloat(montoInicial) >= 0

  function handleSubmit(e) {
    e.preventDefault()

    if (!canSubmit) {
      setError("Selecciona una caja e ingresa un monto inicial válido.")
      return
    }

    setError("")

    // Construye el objeto de apertura — luego esto vendrá del backend
    // (insert en apertura_caja, retorna id_apertura real)
    const aperturaData = {
      id_apertura: crypto.randomUUID(),
      id_caja: idCaja,
      caja_nombre: CAJAS_MOCK.find((c) => c.id_caja === idCaja)?.nombre || "",
      id_usuario: "usuario-mock",
      monto_inicial: parseFloat(montoInicial),
      observaciones: observaciones.trim() || null,
      hora_apertura: new Date().toISOString(),
      estado: "ABIERTA",
    }

    onAperturaExitosa(aperturaData)
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
            {CAJAS_MOCK.map((caja) => (
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
          Abrir caja
        </button>
      </form>
    </div>
  )
}