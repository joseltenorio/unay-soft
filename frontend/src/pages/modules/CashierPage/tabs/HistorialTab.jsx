// src/pages/modules/CashierPage/tabs/HistorialTab.jsx

import { useState, useEffect, useMemo, useCallback } from "react"
import "./HistorialTab.css"

import { getHistorialPagos } from "../../../../services/cashierService"

const METODOS_PAGO_BASE = ["TODOS"]
const TIPOS_DOC = [
  { value: "TODOS", label: "Todos los comprobantes" },
  { value: "BOL", label: "Boleta" },
  { value: "FAC", label: "Factura" },
]

// ── Helpers ───────────────────────────────────────────────────────

function formatHour(isoString) {
  return new Intl.DateTimeFormat("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString))
}

function formatCurrency(amount) {
  return `S/ ${Number(amount).toFixed(2)}`
}

function getTipoDocLabel(codigo) {
  return codigo === "FAC" ? "Factura" : "Boleta"
}

// ── HistorialTab ──────────────────────────────────────────────────

export default function HistorialTab({ apertura }) {
  const [pagos, setPagos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [selectedPago, setSelectedPago] = useState(null)
  const [filtroMetodo, setFiltroMetodo] = useState("TODOS")
  const [filtroDoc, setFiltroDoc] = useState("TODOS")

  const loadHistorial = useCallback(async () => {
    if (!apertura?.id_apertura) {
      return
    }

    try {
      setIsLoading(true)

      const data = await getHistorialPagos(apertura.id_apertura)

      setPagos(data)
      setLoadError("")
    } catch (error) {
      setLoadError(error.message || "No se pudo cargar el historial de pagos.")
    } finally {
      setIsLoading(false)
    }
  }, [apertura?.id_apertura])

  useEffect(() => {
    loadHistorial()
  }, [loadHistorial])

  const metodosDisponibles = useMemo(() => {
    const unicos = [...new Set(pagos.map((pago) => pago.metodo_pago))]
    return [...METODOS_PAGO_BASE, ...unicos]
  }, [pagos])

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((pago) => {
      const matchMetodo = filtroMetodo === "TODOS" || pago.metodo_pago === filtroMetodo
      const matchDoc = filtroDoc === "TODOS" || pago.tipo_comprobante === filtroDoc
      return matchMetodo && matchDoc
    })
  }, [pagos, filtroMetodo, filtroDoc])

  const totalDia = useMemo(() => {
    return pagosFiltrados.reduce((sum, pago) => sum + pago.total, 0)
  }, [pagosFiltrados])

  return (
    <div className="historial-tab">
      <PagoList
        pagos={pagosFiltrados}
        isLoading={isLoading}
        loadError={loadError}
        selectedPago={selectedPago}
        filtroMetodo={filtroMetodo}
        filtroDoc={filtroDoc}
        metodosDisponibles={metodosDisponibles}
        totalDia={totalDia}
        apertura={apertura}
        onSelect={setSelectedPago}
        onFiltroMetodo={setFiltroMetodo}
        onFiltroDoc={setFiltroDoc}
      />

      <PagoDetalle
        pago={selectedPago}
        onClose={() => setSelectedPago(null)}
      />
    </div>
  )
}

// ── PagoList ──────────────────────────────────────────────────────

function PagoList({
  pagos,
  isLoading,
  loadError,
  selectedPago,
  filtroMetodo,
  filtroDoc,
  metodosDisponibles,
  totalDia,
  apertura,
  onSelect,
  onFiltroMetodo,
  onFiltroDoc,
}) {
  return (
    <div className="historial-list">
      <div className="historial-list__header">
        <div>
          <h2>Historial del día</h2>
          <p>
            {pagos.length} cobros · {formatCurrency(totalDia)}
            {apertura?.caja_nombre ? ` · ${apertura.caja_nombre}` : ""}
          </p>
        </div>
      </div>

      <div className="historial-list__filters">
        <div className="historial-list__filter-group">
          <label>Método</label>
          <select
            value={filtroMetodo}
            onChange={(e) => onFiltroMetodo(e.target.value)}
          >
            {metodosDisponibles.map((m) => (
              <option key={m} value={m}>
                {m === "TODOS" ? "Todos los métodos" : m}
              </option>
            ))}
          </select>
        </div>

        <div className="historial-list__filter-group">
          <label>Comprobante</label>
          <select
            value={filtroDoc}
            onChange={(e) => onFiltroDoc(e.target.value)}
          >
            {TIPOS_DOC.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="historial-list__empty">
          <p>Cargando historial...</p>
        </div>
      ) : loadError ? (
        <div className="historial-list__empty">
          <p>{loadError}</p>
        </div>
      ) : pagos.length === 0 ? (
        <div className="historial-list__empty">
          <p>No hay cobros con los filtros aplicados 🧾</p>
        </div>
      ) : (
        <ul className="historial-list__items">
          {pagos.map((pago) => {
            const mesaLabel =
              pago.mesa_nombre || (pago.mesa_numero ? `Mesa ${pago.mesa_numero}` : "Sin mesa")
            const ordenesLabel = pago.numeros_orden.join(", ")

            return (
              <li
                key={pago.id_pago}
                className={
                  selectedPago?.id_pago === pago.id_pago
                    ? "historial-card historial-card--selected"
                    : "historial-card"
                }
                onClick={() => onSelect(pago)}
              >
                <div className="historial-card__left">
                  <strong>{ordenesLabel} · {mesaLabel}</strong>
                  <span>{pago.metodo_pago} · {getTipoDocLabel(pago.tipo_comprobante)}</span>
                </div>

                <div className="historial-card__right">
                  <strong>{formatCurrency(pago.total)}</strong>
                  <span>{formatHour(pago.created_at)}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── PagoDetalle ───────────────────────────────────────────────────

function PagoDetalle({ pago, onClose }) {
  if (!pago) {
    return (
      <div className="historial-detalle historial-detalle--empty">
        <p>Selecciona un cobro para ver el detalle</p>
      </div>
    )
  }

  const mesaLabel =
    pago.mesa_nombre || (pago.mesa_numero ? `Mesa ${pago.mesa_numero}` : "Sin mesa")
  const ordenesLabel = pago.numeros_orden.join(", ")

  return (
    <div className="historial-detalle">
      <div className="historial-detalle__header">
        <div>
          <p className="historial-detalle__eyebrow">Detalle del cobro</p>
          <h3>{ordenesLabel} · {mesaLabel}</h3>
        </div>

        <button
          type="button"
          className="historial-detalle__close"
          onClick={onClose}
          aria-label="Cerrar detalle"
        >
          ×
        </button>
      </div>

      <div className="historial-detalle__info">
        <div className="historial-detalle__info-row">
          <span>Comprobante</span>
          <strong>{getTipoDocLabel(pago.tipo_comprobante)} {pago.comprobante}</strong>
        </div>

        <div className="historial-detalle__info-row">
          <span>Método</span>
          <strong>{pago.metodo_pago}</strong>
        </div>

        <div className="historial-detalle__info-row">
          <span>Hora</span>
          <strong>{formatHour(pago.created_at)}</strong>
        </div>

        {pago.referencia && (
          <div className="historial-detalle__info-row">
            <span>Referencia</span>
            <strong>{pago.referencia}</strong>
          </div>
        )}

        {pago.tipo_comprobante === "FAC" && (
          <>
            <div className="historial-detalle__info-row">
              <span>RUC</span>
              <strong>{pago.numero_documento}</strong>
            </div>
            <div className="historial-detalle__info-row">
              <span>Razón social</span>
              <strong>{pago.razon_social}</strong>
            </div>
          </>
        )}
      </div>

      <div className="historial-detalle__consumo">
        <h4>Detalle de consumo</h4>

        {pago.items.map((item) => (
          <div key={item.id_item_orden} className="historial-detalle__line">
            <span>{item.cantidad}× {item.producto_nombre}</span>
            <span>{formatCurrency(item.subtotal)}</span>
          </div>
        ))}

        <div className="historial-detalle__subtotals">
          <div className="historial-detalle__line historial-detalle__line--muted">
            <span>Subtotal</span>
            <span>{formatCurrency(pago.subtotal)}</span>
          </div>
          <div className="historial-detalle__line historial-detalle__line--muted">
            <span>IGV</span>
            <span>{formatCurrency(pago.igv)}</span>
          </div>
        </div>

        <div className="historial-detalle__total">
          <strong>Total</strong>
          <strong>{formatCurrency(pago.total)}</strong>
        </div>
      </div>
    </div>
  )
}