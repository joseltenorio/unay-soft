// src/pages/modules/CashierPage/tabs/CobrarTab.jsx

import { useState, useEffect } from "react"
import "./CobrarTab.css"
import useToast from "../../../../components/common/Toast/useToast"
import { consultarRuc } from "../../../../services/sunatService"

// ── Mocks ─────────────────────────────────────────────────────────

// Órdenes de prueba hasta conectar el backend
const ORDERS_MOCK = [
  {
    id_orden: "ord-001",
    numero_orden: "ORD-0001",
    id_mesa: "mesa-01",
    mesa_nombre: "Mesa 1",
    estado: "ENVIADA_A_CAJA",
    tipo_servicio: "SALON",
    subtotal: 41.10,
    igv: 7.40,
    total: 48.50,
    detalle: [
      { nombre: "Lomo Saltado",   cantidad: 1, precio_unitario: 28.50 },
      { nombre: "Chicha Morada",  cantidad: 2, precio_unitario: 5.00  },
      { nombre: "Pie de Limón",   cantidad: 1, precio_unitario: 10.00 },
    ],
  },
  {
    id_orden: "ord-002",
    numero_orden: "ORD-0002",
    id_mesa: "mesa-05",
    mesa_nombre: "Mesa 5",
    estado: "ENVIADA_A_CAJA",
    tipo_servicio: "SALON",
    subtotal: 81.36,
    igv: 14.64,
    total: 96.00,
    detalle: [
      { nombre: "Parrilla Familiar", cantidad: 1, precio_unitario: 78.00 },
      { nombre: "Inca Kola",         cantidad: 2, precio_unitario: 9.00  },
    ],
  },
  {
    id_orden: "ord-003",
    numero_orden: "ORD-0003",
    id_mesa: "mesa-08",
    mesa_nombre: "Mesa 8",
    estado: "ENVIADA_A_CAJA",
    tipo_servicio: "SALON",
    subtotal: 27.12,
    igv: 4.88,
    total: 32.00,
    detalle: [
      { nombre: "Hamburguesa Clásica", cantidad: 2, precio_unitario: 16.00 },
    ],
  },
  {
    id_orden: "ord-004",
    numero_orden: "ORD-0004",
    id_mesa: "mesa-12",
    mesa_nombre: "Mesa 12",
    estado: "ENVIADA_A_CAJA",
    tipo_servicio: "SALON",
    subtotal: 96.61,
    igv: 17.39,
    total: 114.00,
    detalle: [
      { nombre: "Ceviche Mixto", cantidad: 2, precio_unitario: 42.00 },
      { nombre: "Limonada",      cantidad: 2, precio_unitario: 8.00  },
      { nombre: "Tres Leches",   cantidad: 1, precio_unitario: 14.00 },
    ],
  },
  {
    id_orden: "ord-005",
    numero_orden: "ORD-0005",
    id_mesa: "mesa-03",
    mesa_nombre: "Mesa 3",
    estado: "PAGADA",
    tipo_servicio: "SALON",
    subtotal: 58.47,
    igv: 10.53,
    total: 69.00,
    detalle: [
      { nombre: "Arroz Chaufa Especial", cantidad: 2, precio_unitario: 22.00 },
      { nombre: "Maracuyá Frozen",       cantidad: 1, precio_unitario: 10.00 },
      { nombre: "Brownie",               cantidad: 1, precio_unitario: 15.00 },
    ],
  },
]

// Pagos registrados en memoria hasta conectar el backend
const PAYMENTS_MOCK = [
  {
    id_pago:     "pag-001",
    id_orden:    "ord-000",
    id_usuario:  "user-001",
    id_apertura: "apertura-mock",
    metodo_pago: "YAPE",
    monto:       48.5,
    referencia:  "YAPE-123456",
    estado:      "CONFIRMADO",
    created_at:  "2026-06-22T18:00:00Z",
    updated_at:  "2026-06-22T18:00:00Z",
  },
]

// Tasa IGV — vendrá del backend en el futuro
const IGV_RATE = 0.18

// Métodos de pago disponibles
const PAYMENT_METHODS = ["EFECTIVO", "TARJETA", "YAPE", "PLIN", "TRANSFERENCIA"]

// ── CobrarTab ─────────────────────────────────────────────────────

// Recibe la apertura de caja activa (viene de CashierPage → AperturaGate).
// Se necesita id_apertura para poder registrar comprobante + pago.
export default function CobrarTab({ apertura }) {
  const { showToast } = useToast()

  // Orden seleccionada actualmente en la lista
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Solo muestra órdenes que están listas para cobrar
  const pendingOrders = ORDERS_MOCK.filter(
    (order) => order.estado === "ENVIADA_A_CAJA"
  )

  return (
    <div className="cobrar-tab">
      {/* Lista de órdenes a la izquierda */}
      <OrderList
        orders={pendingOrders}
        selectedOrder={selectedOrder}
        onSelect={setSelectedOrder}
      />

      {/* Panel de cobro a la derecha */}
      <PayPanel
        order={selectedOrder}
        apertura={apertura}
        clearOrder={() => setSelectedOrder(null)}
        showToast={showToast}
      />
    </div>
  )
}

// ── OrderList ─────────────────────────────────────────────────────

function OrderList({ orders, selectedOrder, onSelect }) {
  return (
    <div className="cobrar-orders">
      <div className="cobrar-orders__header">
        <h2>Órdenes pendientes</h2>
        <p>Listas para cobrar</p>
      </div>

      {/* Si no hay órdenes muestra mensaje vacío */}
      {orders.length === 0 ? (
        <div className="cobrar-orders__empty">
          <p>No hay órdenes pendientes de cobro 💵</p>
        </div>
      ) : (
        <ul className="cobrar-orders__list">
          {orders.map((order) => (
            <li
              key={order.id_orden}
              // Agrega clase --selected si es la orden activa
              className={
                selectedOrder?.id_orden === order.id_orden
                  ? "cobrar-order-card cobrar-order-card--selected"
                  : "cobrar-order-card"
              }
              onClick={() => onSelect(order)}
            >
              <div className="cobrar-order-card__info">
                <strong>
                  {order.mesa_nombre} · {order.detalle.length} items
                </strong>
                {/* Lista los nombres de los platos separados por coma */}
                <span>{order.detalle.map((item) => item.nombre).join(", ")}</span>
              </div>

              <div className="cobrar-order-card__total">
                S/ {order.total.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── PayPanel ──────────────────────────────────────────────────────

function PayPanel({ order, apertura, clearOrder, showToast }) {
  // Método de pago seleccionado
  const [method, setMethod] = useState("EFECTIVO")

  // Monto en efectivo ingresado por el cajero
  const [received, setReceived] = useState("")

  // Tipo de comprobante: BOLETA o FACTURA
  const [tipoDoc, setTipoDoc] = useState("BOLETA")

  // RUC ingresado (solo para FACTURA)
  const [ruc, setRuc] = useState("")

  // Razón social encontrada en SUNAT
  const [razonSocial, setRazonSocial] = useState("")

  // Mensaje de error si el RUC no existe
  const [rucError, setRucError] = useState("")

  // Indicador de carga mientras consulta SUNAT
  const [rucLoading, setRucLoading] = useState(false)

  // Resetea todos los campos cuando cambia la orden seleccionada
  useEffect(() => {
    setReceived("")
    setMethod("EFECTIVO")
    setTipoDoc("BOLETA")
    setRuc("")
    setRazonSocial("")
    setRucError("")
  }, [order])

  // Consulta SUNAT automáticamente cuando el RUC llega a 11 dígitos
  useEffect(() => {
    // Solo actúa si el tipo de doc es FACTURA
    if (tipoDoc !== "FACTURA") return

    // Si el RUC no tiene 11 dígitos aún, limpia resultados anteriores
    if (ruc.length !== 11) {
      setRazonSocial("")
      setRucError("")
      return
    }

    // Flag para evitar que una consulta anterior pise una nueva
    let cancelled = false

    async function buscarRuc() {
      setRucLoading(true)
      setRazonSocial("")
      setRucError("")

      try{
        const response = await consultarRuc(ruc)

        if (cancelled) return
        setRazonSocial(response.data.razonSocial)
      } catch(error){
        if(cancelled) return

        setRucError(error.message)
      } finally{
        if(!cancelled) 
          setRucLoading(false)
      }
    }
      buscarRuc()
      // Cleanup: marca como cancelada si el RUC cambia antes de que responda
      return () => {
        cancelled = true
      }
  }, [ruc, tipoDoc])

  // ── Cálculos ───────────────────────────────────────────────────

  // Subtotal sin IGV (viene del mock, luego del backend)
  const subtotal = order ? order.subtotal : 0

  // IGV calculado sobre el subtotal
  const igv = order ? parseFloat((subtotal * IGV_RATE).toFixed(2)) : 0

  // Total final que el cliente debe pagar
  const total = order ? parseFloat((subtotal + igv).toFixed(2)) : 0

  // Vuelto: diferencia entre lo recibido y el total (mínimo 0)
  const change = received
    ? Math.max(0, parseFloat(received) - total)
    : null

  // ── Validación para habilitar el botón ─────────────────────────

  const canSubmit =
    // Si es efectivo, debe haber ingresado un monto >= total
    (method !== "EFECTIVO" || (received !== "" && parseFloat(received) >= total)) &&
    // Si es factura, debe tener RUC completo y razón social encontrada
    (tipoDoc !== "FACTURA" || (ruc.length === 11 && razonSocial !== ""))

  // Si no hay orden seleccionada, muestra panel vacío
  if (!order) {
    return (
      <div className="cobrar-pay-panel cobrar-pay-panel--empty">
        <p>Selecciona una orden para cobrar</p>
      </div>
    )
  }

  // ── Handlers ───────────────────────────────────────────────────

  // Solo permite dígitos y máximo 11 caracteres en el campo RUC
  function handleRucChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setRuc(value)
  }

  function handleSubmit() {
    // Validación extra: monto insuficiente en efectivo
    if (
      method === "EFECTIVO" &&
      (received === "" || parseFloat(received) <= 0 || parseFloat(received) < total)
    ) {
      showToast({
        type: "warning",
        title: "Monto insuficiente",
        message: "El monto recibido es menor al total de la cuenta.",
      })
      return
    }

    // Construye el objeto de pago con todos los datos.
    // id_apertura viene de la apertura de caja activa del turno
    // (luego será el id_apertura real que devuelva el backend).
    const paymentData = {
      id_pago:      crypto.randomUUID(),
      id_orden:     order.id_orden,
      id_usuario:   "usuario-mock",
      id_apertura:  apertura?.id_apertura ?? null,
      tipo_doc:     tipoDoc,
      // RUC y razón social solo si es factura
      ruc:          tipoDoc === "FACTURA" ? ruc : null,
      razon_social: tipoDoc === "FACTURA" ? razonSocial : null,
      metodo_pago:  method,
      monto:        total,
      referencia:   null,
      estado:       "CONFIRMADO",
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    }

    // Guarda el pago en el mock local
    PAYMENTS_MOCK.push(paymentData)

    // Marca la orden como pagada en el mock
    order.estado = "PAGADA"

    showToast({
      type: "success",
      title: "Cobro registrado",
      message: `La orden ${order.numero_orden} fue cobrada correctamente.`,
    })

    // Limpia la orden seleccionada y vuelve al estado inicial
    clearOrder()
  }

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div className="cobrar-pay-panel">

      {/* Tipo de comprobante */}
      <div className="cobrar-pay-panel__payment-section">
        {/* Boleta / Factura */}
        <div className="cobrar-pay-panel__doc-toggle">
          <button
            type="button"
            className={
              tipoDoc === "BOLETA"
                ? "cobrar-pay-panel__doc-btn cobrar-pay-panel__doc-btn--active"
                : "cobrar-pay-panel__doc-btn"
            }
            onClick={() => {
              setTipoDoc("BOLETA")
              // Limpia datos de factura al volver a boleta
              setRuc("")
              setRazonSocial("")
              setRucError("")
            }}
          >
            Boleta
          </button>

          <button
            type="button"
            className={
              tipoDoc === "FACTURA"
                ? "cobrar-pay-panel__doc-btn cobrar-pay-panel__doc-btn--active"
                : "cobrar-pay-panel__doc-btn"
            }
            onClick={() => setTipoDoc("FACTURA")}
          >
            Factura
          </button>
        </div>

        {/* Campo RUC — solo visible si seleccionó Factura */}
        {tipoDoc === "FACTURA" && (
          <div className="cobrar-pay-panel__ruc">
            <label htmlFor="cashier-ruc">RUC</label>
            <input
              id="cashier-ruc"
              type="text"
              inputMode="numeric"
              maxLength={11}
              placeholder="Ej. 20601224745"
              value={ruc}
              onChange={handleRucChange}
            />

            {/* Indicador de carga mientras consulta */}
            {rucLoading && (
              <small className="cobrar-pay-panel__ruc-loading">
                Consultando SUNAT...
              </small>
            )}

            {/* Razón social encontrada — solo lectura, no editable */}
            {razonSocial && !rucLoading && (
              <small className="cobrar-pay-panel__ruc-found">
                {razonSocial}
              </small>
            )}

            {/* Error si el RUC no existe en SUNAT */}
            {rucError && !rucLoading && (
              <small className="cobrar-pay-panel__ruc-error">
                {rucError}
              </small>
            )}
          </div>
        )}
      </div>

      {/* Detalle de consumo */}
      <div className="cobrar-pay-panel__detail">
        <h3>Detalle de consumo</h3>

        {/* Una línea por cada ítem del pedido */}
        {order.detalle.map((item, index) => (
          <div key={index} className="cobrar-pay-panel__line">
            <span>{item.cantidad}× {item.nombre}</span>
            <span>S/ {(item.precio_unitario * item.cantidad).toFixed(2)}</span>
          </div>
        ))}

        {/* Subtotal e IGV antes del total */}
        <div className="cobrar-pay-panel__subtotals">
          <div className="cobrar-pay-panel__line cobrar-pay-panel__line--muted">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="cobrar-pay-panel__line cobrar-pay-panel__line--muted">
            {/* El porcentaje se calcula dinámicamente desde IGV_RATE */}
            <span>IGV ({IGV_RATE * 100}%)</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
        </div>

        {/* Total final destacado */}
        <div className="cobrar-pay-panel__total">
          <strong>Total</strong>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>
      </div>

      {/* Método de pago */}
      <div className="cobrar-pay-panel__payment-section">
        <h3>Método de pago</h3>

        <select
          className="cobrar-pay-panel__select"
          value={method}
          onChange={(e) => {
            setMethod(e.target.value)
            // Limpia el monto recibido al cambiar método
            setReceived("")
          }}
        >
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm} value={pm}>{pm}</option>
          ))}
        </select>
      </div>

      {/* Campo de monto — solo visible si el método es EFECTIVO */}
      {method === "EFECTIVO" ? (
        <div className="cobrar-pay-panel__received">
          <label htmlFor="cashier-received">Monto recibido</label>
          <input
            id="cashier-received"
            type="number"
            min="0.01"
            step="0.10"
            value={received}
            placeholder="S/ 0.00"
            onChange={(e) => setReceived(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "+" || e.key === "e" || e.key === "E") {
                e.preventDefault()
              }
            }}
          />

          {/* Vuelto — aparece solo si ya ingresó un monto */}
          {change !== null && (
            <div className="cobrar-pay-panel__change">
              <span>Vuelto</span>
              <strong>S/ {change.toFixed(2)}</strong>
            </div>
          )}
        </div>
      ) : (
        // Para otros métodos solo muestra un mensaje informativo
        <div className="cobrar-pay-panel__info">
          <p>El pago se registrará mediante <strong>{method}</strong>.</p>
        </div>
      )}

      {/* Botón principal — deshabilitado si canSubmit es false */}
      <button
        type="button"
        className="cobrar-pay-panel__submit"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        Registrar cobro
      </button>
    </div>
  )
}