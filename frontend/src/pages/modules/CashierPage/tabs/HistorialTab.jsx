// src/pages/modules/CashierPage/tabs/HistorialTab.jsx

import { useState, useMemo } from "react"
import "./HistorialTab.css"

// ── Mocks────────────────────────────────
const HISTORIAL_MOCK = [
  {
    id_pago:      "pag-001",
    id_orden:     "ord-001",
    numero_orden: "ORD-0001",
    mesa_nombre:  "Mesa 1",
    metodo_pago:  "YAPE",
    tipo_doc:     "BOLETA",
    monto:        48.50,
    created_at:   "2026-07-05T18:00:00Z",
    detalle: [
      { nombre: "Lomo Saltado",  cantidad: 1, precio_unitario: 28.50 },
      { nombre: "Chicha Morada", cantidad: 2, precio_unitario: 5.00  },
      { nombre: "Pie de Limón",  cantidad: 1, precio_unitario: 10.00 },
    ],
    subtotal: 41.10,
    igv:       7.40,
    total:    48.50,
    ruc:          null,
    razon_social: null,
  },
  {
    id_pago:      "pag-002",
    id_orden:     "ord-002",
    numero_orden: "ORD-0002",
    mesa_nombre:  "Mesa 5",
    metodo_pago:  "EFECTIVO",
    tipo_doc:     "FACTURA",
    monto:        96.00,
    created_at:   "2026-07-05T17:30:00Z",
    detalle: [
      { nombre: "Parrilla Familiar", cantidad: 1, precio_unitario: 78.00 },
      { nombre: "Inca Kola",         cantidad: 2, precio_unitario: 9.00  },
    ],
    subtotal: 81.36,
    igv:      14.64,
    total:    96.00,
    ruc:          "20601224745",
    razon_social: "UMARI RESTAURANT S.A.C.",
  },
  {
    id_pago:      "pag-003",
    id_orden:     "ord-003",
    numero_orden: "ORD-0003",
    mesa_nombre:  "Mesa 8",
    metodo_pago:  "TARJETA",
    tipo_doc:     "BOLETA",
    monto:        32.00,
    created_at:   "2026-07-05T16:45:00Z",
    detalle: [
      { nombre: "Hamburguesa Clásica", cantidad: 2, precio_unitario: 16.00 },
    ],
    subtotal: 27.12,
    igv:       4.88,
    total:    32.00,
    ruc:          null,
    razon_social: null,
  },
  {
    id_pago:      "pag-004",
    id_orden:     "ord-004",
    numero_orden: "ORD-0004",
    mesa_nombre:  "Mesa 12",
    metodo_pago:  "PLIN",
    tipo_doc:     "BOLETA",
    monto:       114.00,
    created_at:   "2026-07-05T15:20:00Z",
    detalle: [
      { nombre: "Ceviche Mixto", cantidad: 2, precio_unitario: 42.00 },
      { nombre: "Limonada",      cantidad: 2, precio_unitario: 8.00  },
      { nombre: "Tres Leches",   cantidad: 1, precio_unitario: 14.00 },
    ],
    subtotal:  96.61,
    igv:       17.39,
    total:    114.00,
    ruc:          null,
    razon_social: null,
  },
]

const METODOS_PAGO  = ["TODOS", "EFECTIVO", "TARJETA", "YAPE", "PLIN", "TRANSFERENCIA"]
const TIPOS_DOC     = ["TODOS", "BOLETA", "FACTURA"]
const IGV_RATE      = 0.18

// ── Helpers ───────────────────────────────────────────────────────

function formatHour(isoString) {
  return new Intl.DateTimeFormat("es-PE", {
    hour:   "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(isoString))
}

function formatCurrency(amount) {
  return `S/ ${Number(amount).toFixed(2)}`
}

// ── HistorialTab ──────────────────────────────────────────────────

export default function HistorialTab({ apertura }) {
  const [selectedPago, setSelectedPago] = useState(null)
  const [filtroMetodo, setFiltroMetodo] = useState("TODOS")
  const [filtroDoc,    setFiltroDoc]    = useState("TODOS")

  const pagosFiltrados = useMemo(() => {
    return HISTORIAL_MOCK.filter((pago) => {
      const matchMetodo = filtroMetodo === "TODOS" || pago.metodo_pago === filtroMetodo
      const matchDoc    = filtroDoc    === "TODOS" || pago.tipo_doc    === filtroDoc
      return matchMetodo && matchDoc
    })
  }, [filtroMetodo, filtroDoc])

  // Totales del día según filtros aplicados
  const totalDia = useMemo(() => {
    return pagosFiltrados.reduce((sum, pago) => sum + pago.total, 0)
  }, [pagosFiltrados])

  return (
    <div className="historial-tab">
      <PagoList
        pagos={pagosFiltrados}
        selectedPago={selectedPago}
        filtroMetodo={filtroMetodo}
        filtroDoc={filtroDoc}
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
  selectedPago,
  filtroMetodo,
  filtroDoc,
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

      {/* Filtros */}
      <div className="historial-list__filters">
        <div className="historial-list__filter-group">
          <label>Método</label>
          <select
            value={filtroMetodo}
            onChange={(e) => onFiltroMetodo(e.target.value)}
          >
            {METODOS_PAGO.map((m) => (
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
              <option key={d} value={d}>
                {d === "TODOS" ? "Todos los comprobantes" : d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista */}
      {pagos.length === 0 ? (
        <div className="historial-list__empty">
          <p>No hay cobros con los filtros aplicados 🧾</p>
        </div>
      ) : (
        <ul className="historial-list__items">
          {pagos.map((pago) => (
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
                <strong>{pago.numero_orden} · {pago.mesa_nombre}</strong>
                <span>{pago.metodo_pago} · {pago.tipo_doc}</span>
              </div>

              <div className="historial-card__right">
                <strong>{formatCurrency(pago.total)}</strong>
                <span>{formatHour(pago.created_at)}</span>
              </div>
            </li>
          ))}
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

  const subtotal = pago.subtotal
  const igv      = parseFloat((subtotal * IGV_RATE).toFixed(2))
  const total    = parseFloat((subtotal + igv).toFixed(2))

  return (
    <div className="historial-detalle">
      <div className="historial-detalle__header">
        <div>
          <p className="historial-detalle__eyebrow">Detalle del cobro</p>
          <h3>{pago.numero_orden} · {pago.mesa_nombre}</h3>
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

      {/* Info del pago */}
      <div className="historial-detalle__info">
        <div className="historial-detalle__info-row">
          <span>Comprobante</span>
          <strong>{pago.tipo_doc}</strong>
        </div>

        <div className="historial-detalle__info-row">
          <span>Método</span>
          <strong>{pago.metodo_pago}</strong>
        </div>

        <div className="historial-detalle__info-row">
          <span>Hora</span>
          <strong>{formatHour(pago.created_at)}</strong>
        </div>

        {/* Solo si es factura */}
        {pago.tipo_doc === "FACTURA" && (
          <>
            <div className="historial-detalle__info-row">
              <span>RUC</span>
              <strong>{pago.ruc}</strong>
            </div>
            <div className="historial-detalle__info-row">
              <span>Razón social</span>
              <strong>{pago.razon_social}</strong>
            </div>
          </>
        )}
      </div>

      {/* Detalle de consumo */}
      <div className="historial-detalle__consumo">
        <h4>Detalle de consumo</h4>

        {pago.detalle.map((item, index) => (
          <div key={index} className="historial-detalle__line">
            <span>{item.cantidad}× {item.nombre}</span>
            <span>{formatCurrency(item.precio_unitario * item.cantidad)}</span>
          </div>
        ))}

        <div className="historial-detalle__subtotals">
          <div className="historial-detalle__line historial-detalle__line--muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="historial-detalle__line historial-detalle__line--muted">
            <span>IGV ({IGV_RATE * 100}%)</span>
            <span>{formatCurrency(igv)}</span>
          </div>
        </div>

        <div className="historial-detalle__total">
          <strong>Total</strong>
          <strong>{formatCurrency(total)}</strong>
        </div>
      </div>
    </div>
  )
}