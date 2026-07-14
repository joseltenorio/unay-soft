// src/pages/modules/CashierPage/tabs/CierreTab.jsx

import { useState, useEffect, useCallback } from "react"
import "./CierreTab.css"
import useToast from "../../../../components/common/Toast/useToast"
import { getResumenTurno, cerrarCaja } from "../../../../services/cashierService"

// ── Helpers ───────────────────────────────────────────────────────

function formatCurrency(amount) {
  return `S/ ${Number(amount).toFixed(2)}`
}

// ── CierreTab ─────────────────────────────────────────────────────

export default function CierreTab({ apertura, onCierreExitoso }) {
  const { showToast } = useToast()

  const [resumen, setResumen] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [totalDeclarado, setTotalDeclarado] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadResumen = useCallback(async () => {
    if (!apertura?.id_apertura) {
      return
    }

    try {
      setIsLoading(true)

      const data = await getResumenTurno(apertura.id_apertura)

      setResumen(data)
      setLoadError("")
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el resumen del turno.")
    } finally {
      setIsLoading(false)
    }
  }, [apertura?.id_apertura])

  useEffect(() => {
    loadResumen()
  }, [loadResumen])

  const totalEfectivoSistema = Number(resumen?.total_efectivo_sistema || 0)
  const totalVentasTurno = Number(resumen?.total_ventas_turno || 0)
  const desglosePorMetodo = resumen?.desglose_por_metodo || []

  const diferencia = totalDeclarado !== ""
    ? parseFloat((parseFloat(totalDeclarado) - totalEfectivoSistema).toFixed(2))
    : null

  const canSubmit =
    totalDeclarado !== "" &&
    !Number.isNaN(parseFloat(totalDeclarado)) &&
    !isSubmitting &&
    Boolean(resumen)

  async function handleSubmit() {
    if (!canSubmit) {
      showToast({
        type: "warning",
        title: "Falta el conteo",
        message: "Ingresa el monto total contado en caja para poder cerrar.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const cierre = await cerrarCaja(apertura.id_apertura, {
        total_declarado: parseFloat(totalDeclarado),
        observaciones: observaciones.trim() || null,
      })

      showToast({
        type: cierre.diferencia === 0 ? "success" : "warning",
        title: "Turno cerrado",
        message:
          Number(cierre.diferencia) === 0
            ? "El conteo cuadra exactamente con el sistema."
            : `Hay una diferencia de ${formatCurrency(Math.abs(Number(cierre.diferencia)))}.`,
      })

      onCierreExitoso?.(cierre)
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo cerrar el turno",
        message: error.message || "Intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="cierre-tab">
        <p>Cargando resumen del turno...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="cierre-tab">
        <p>{loadError}</p>
      </div>
    )
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
          {desglosePorMetodo.length === 0 ? (
            <p>Sin pagos registrados en este turno.</p>
          ) : (
            desglosePorMetodo.map((item) => (
              <div key={item.metodo_pago} className="cierre-tab__desglose-line">
                <span>{item.metodo_pago}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
            ))
          )}
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
          {isSubmitting ? "Cerrando..." : "Cerrar turno"}
        </button>
      </div>
    </div>
  )
}