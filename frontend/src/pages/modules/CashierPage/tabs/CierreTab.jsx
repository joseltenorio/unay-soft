// src/pages/modules/CashierPage/tabs/CierreTab.jsx

import { useState, useMemo } from "react"
import "./CierreTab.css"
import useToast from "../../../../components/common/Toast/useToast"

// ── Mocks ─────────────────────────────────────────────────────────

// Pagos del turno actual — luego será un fetch filtrado por id_apertura.
// Reutilizamos montos parecidos a los de HistorialTab para que el
// total_sistema tenga sentido visualmente.
const PAGOS_TURNO_MOCK = [
  { metodo_pago: "EFECTIVO",     monto: 96.00  },
  { metodo_pago: "YAPE",         monto: 48.50  },
  { metodo_pago: "TARJETA",      monto: 32.00  },
  { metodo_pago: "EFECTIVO",     monto: 114.00 },
  { metodo_pago: "PLIN",         monto: 69.00  },
]

// ── Helpers ───────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `S/ ${Number(amount).toFixed(2)}`
}

// ── CierreTab ─────────────────────────────────────────────────────

// Recibe la apertura activa (id_apertura, monto_inicial, caja_nombre)
// y un callback para notificar al padre que el turno se cerró,
// así CashierPage puede volver a mostrar el AperturaGate.
export default function CierreTab({ apertura, onCierreExitoso }) {
  const { showToast } = useToast()

  // Monto que el cajero cuenta físicamente en caja
  const [totalDeclarado, setTotalDeclarado] = useState("")

  // Observaciones opcionales del cierre
  const [observaciones, setObservaciones] = useState("")

  // Total esperado en efectivo según el sistema:
  // monto inicial de apertura + pagos en efectivo del turno.
  // (Tarjeta/Yape/Plin/Transferencia no se cuentan en efectivo físico,
  // pero sí forman parte del total de ventas del turno.)
  const totalEfectivoSistema = useMemo(() => {
    const montoInicial = Number(apertura?.monto_inicial || 0)
    const efectivoTurno = PAGOS_TURNO_MOCK
      .filter((pago) => pago.metodo_pago === "EFECTIVO")
      .reduce((sum, pago) => sum + pago.monto, 0)

    return montoInicial + efectivoTurno
  }, [apertura])

  // Total de ventas del turno (todos los métodos), solo informativo
  const totalVentasTurno = useMemo(() => {
    return PAGOS_TURNO_MOCK.reduce((sum, pago) => sum + pago.monto, 0)
  }, [])

  // Desglose por método de pago
  const desglosePorMetodo = useMemo(() => {
    const grupos = {}

    PAGOS_TURNO_MOCK.forEach((pago) => {
      grupos[pago.metodo_pago] = (grupos[pago.metodo_pago] || 0) + pago.monto
    })

    return Object.entries(grupos)
  }, [])

  // Diferencia entre lo declarado y lo que el sistema espera en efectivo
  const diferencia = totalDeclarado !== ""
    ? parseFloat((parseFloat(totalDeclarado) - totalEfectivoSistema).toFixed(2))
    : null

  const canSubmit = totalDeclarado !== "" && !Number.isNaN(parseFloat(totalDeclarado))

  function handleSubmit() {
    if (!canSubmit) {
      showToast({
        type: "warning",
        title: "Falta el conteo",
        message: "Ingresa el monto total contado en caja para poder cerrar.",
      })
      return
    }

    // Construye el objeto de cierre — luego será un insert real en
    // cierre_caja + update de apertura_caja.estado = 'CERRADA'
    const cierreData = {
      id_cierre_caja:   crypto.randomUUID(),
      id_apertura:      apertura?.id_apertura ?? null,
      id_usuario:       "usuario-mock",
      total_sistema:    totalEfectivoSistema,
      total_declarado:  parseFloat(totalDeclarado),
      diferencia,
      hora_cierre:      new Date().toISOString(),
      observaciones:    observaciones.trim() || null,
    }

    showToast({
      type: diferencia === 0 ? "success" : "warning",
      title: "Turno cerrado",
      message:
        diferencia === 0
          ? "El conteo cuadra exactamente con el sistema."
          : `Hay una diferencia de ${formatCurrency(Math.abs(diferencia))}.`,
    })

    // Notifica al padre (CashierPage) que el turno terminó,
    // para que vuelva a mostrar el AperturaGate.
    onCierreExitoso?.(cierreData)
  }

  return (
    <div className="cierre-tab">
      <div className="cierre-tab__resumen">
        <div className="cierre-tab__resumen-header">
          <h2>Resumen del turno</h2>
          <p>{apertura?.caja_nombre || "Caja"}</p>
        </div>

        <div className="cierre-tab__totales">
          <div className="cierre-tab__total-card">
            <span>Monto inicial</span>
            <strong>{formatCurrency(apertura?.monto_inicial || 0)}</strong>
          </div>
          <div className="cierre-tab__total-card">
            <span>Ventas del turno</span>
            <strong>{formatCurrency(totalVentasTurno)}</strong>
          </div>
          <div className="cierre-tab__total-card cierre-tab__total-card--highlight">
            <span>Efectivo esperado</span>
            <strong>{formatCurrency(totalEfectivoSistema)}</strong>
          </div>
        </div>

        <div className="cierre-tab__desglose">
          <h3>Desglose por método</h3>
          {desglosePorMetodo.map(([metodo, monto]) => (
            <div key={metodo} className="cierre-tab__desglose-line">
              <span>{metodo}</span>
              <span>{formatCurrency(monto)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="cierre-tab__form">
        <h2>Cerrar caja</h2>
        <p>Cuenta el efectivo físico e ingresa el total.</p>

        <div className="cierre-tab__field">
          <label htmlFor="cierre-declarado">Total contado en caja</label>
          <input
            id="cierre-declarado"
            type="number"
            min="0"
            step="0.10"
            placeholder="S/ 0.00"
            value={totalDeclarado}
            onChange={(e) => setTotalDeclarado(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault()
              }
            }}
          />
        </div>

        {/* Diferencia — aparece solo si ya ingresó un monto */}
        {diferencia !== null && (
          <div
            className={
              diferencia === 0
                ? "cierre-tab__diferencia cierre-tab__diferencia--ok"
                : "cierre-tab__diferencia cierre-tab__diferencia--alerta"
            }
          >
            <span>{diferencia === 0 ? "Cuadre exacto" : diferencia > 0 ? "Sobrante" : "Faltante"}</span>
            <strong>{formatCurrency(Math.abs(diferencia))}</strong>
          </div>
        )}

        <div className="cierre-tab__field">
          <label htmlFor="cierre-observaciones">Observaciones (opcional)</label>
          <textarea
            id="cierre-observaciones"
            rows={3}
            placeholder="Ej. Faltante por vuelto mal dado en Mesa 5."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="cierre-tab__submit"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          Cerrar turno
        </button>
      </div>
    </div>
  )
}