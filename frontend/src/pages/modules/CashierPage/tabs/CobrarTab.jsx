// src/pages/modules/CashierPage/tabs/CobrarTab.jsx

import { useState, useEffect } from "react"
import "./CobrarTab.css"
import useToast from "../../../../components/common/Toast/useToast"


// ORDERS LOCALES
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
      {
        nombre: "Lomo Saltado",
        cantidad: 1,
        precio_unitario: 28.50,
      },
      {
        nombre: "Chicha Morada",
        cantidad: 2,
        precio_unitario: 5.00,
      },
      {
        nombre: "Pie de Limón",
        cantidad: 1,
        precio_unitario: 10.00,
      },
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
      {
        nombre: "Parrilla Familiar",
        cantidad: 1,
        precio_unitario: 78.00,
      },
      {
        nombre: "Inca Kola",
        cantidad: 2,
        precio_unitario: 9.00,
      },
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
      {
        nombre: "Hamburguesa Clásica",
        cantidad: 2,
        precio_unitario: 16.00,
      },
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
      {
        nombre: "Ceviche Mixto",
        cantidad: 2,
        precio_unitario: 42.00,
      },
      {
        nombre: "Limonada",
        cantidad: 2,
        precio_unitario: 8.00,
      },
      {
        nombre: "Tres Leches",
        cantidad: 1,
        precio_unitario: 14.00,
      },
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
      {
        nombre: "Arroz Chaufa Especial",
        cantidad: 2,
        precio_unitario: 22.00,
      },
      {
        nombre: "Maracuyá Frozen",
        cantidad: 1,
        precio_unitario: 10.00,
      },
      {
        nombre: "Brownie",
        cantidad: 1,
        precio_unitario: 15.00,
      },
    ],
  },
]

// PAGOS LOCALES
const PAYMENTS_MOCK = [
  {
    id_pago: "pag-001",
    id_orden: "ord-000",
    id_usuario: "user-001",

    metodo_pago: "YAPE",
    monto: 48.5,

    referencia: "YAPE-123456",

    estado: "CONFIRMADO",

    created_at: "2026-06-22T18:00:00Z",
    updated_at: "2026-06-22T18:00:00Z",
  },
]

export default function CobrarTab() {
  const { showToast } = useToast()

  const [selectedOrder, setSelectedOrder] = useState(null)
  const pendingOrders = ORDERS_MOCK.filter(
    (order) => order.estado === "ENVIADA_A_CAJA"
  )

  return (
    <div className="cobrar-tab">
      <OrderList
        orders={pendingOrders}
        selectedOrder={selectedOrder}
        onSelect={setSelectedOrder}
      />

      <PayPanel
        order={selectedOrder}
        clearOrder={() => setSelectedOrder(null)}
        showToast={showToast}
      />
    </div>
  )
}

/* ── Order List ──────────────────────────────────────────────────── */

function OrderList({ orders, selectedOrder, onSelect }) {
  return (
    <div className="cobrar-orders">
      <div className="cobrar-orders__header">
        <h2>Órdenes pendientes</h2>
        <p>Listas para cobrar</p>
      </div>

      {orders.length === 0 ? (
        <div className="cobrar-orders__empty">
          <p>No hay órdenes pendientes de cobro 💵</p>
        </div>
      ) : (
        <ul className="cobrar-orders__list">
          {orders.map((order) => (
            <li
              key={order.id_orden}
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

                <span>
                  {order.detalle
                    .map((item) => item.nombre)
                    .join(", ")}
                </span>
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

/* ── Pay Panel ───────────────────────────────────────────────────── */

const PAYMENT_METHODS = [
  "EFECTIVO",
  "TARJETA",
  "YAPE",
  "PLIN",
  "TRANSFERENCIA",
]

function PayPanel({ order, clearOrder, showToast }) {
  const [method, setMethod] = useState("EFECTIVO")
  const [received, setReceived] = useState("")

   useEffect(() => {
    setReceived("")
    setMethod("EFECTIVO")
  }, [order])

  const change = received
    ? Math.max(0, parseFloat(received) - (order?.total ?? 0))
    : null

  if (!order) {
    return (
      <div className="cobrar-pay-panel cobrar-pay-panel--empty">
        <p>Selecciona una orden para cobrar</p>
      </div>
    )
  }

  const handleSubmit = () => {
    if (
      method === "EFECTIVO" &&
      (received === "" || parseFloat(received) < order.total)
    ) {
      showToast({
        type: "warning",
        title: "Monto insuficiente",
        message: "El monto recibido es menor al total de la cuenta.",
      })
      return
    }

    console.log("=== HANDLE SUBMIT ===")
    console.log(order)
    
    const paymentData = {
      id_pago: crypto.randomUUID(),
      id_orden: order.id_orden,
      id_usuario: "usuario-mock",
      metodo_pago: method,
      monto: order.total,
      referencia: null,
      estado: "CONFIRMADO",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Pago registrado:")
    console.log(paymentData)

    PAYMENTS_MOCK.push(paymentData)

    //Cambio de estado a pagado
    order.estado = "PAGADA"

    showToast({
      type: "success",
      title: "Cobro registrado",
      message: `La orden ${order.numero_orden} fue cobrada correctamente.`,
    })

    clearOrder()
  }
 
  const canSubmit =
    method !== "EFECTIVO" ||
    (received !== "" && parseFloat(received) >= order.total)

  return (
    <div className="cobrar-pay-panel">

      {/* Detalle */}

      <div className="cobrar-pay-panel__detail">
        <h3>Detalle de consumo</h3>

        {order.detalle.map((item, index) => (
          <div
            key={index}
            className="cobrar-pay-panel__line"
          >
            <span>
              {item.cantidad}× {item.nombre}
            </span>

            <span>
              S/{" "}
              {(
                item.precio_unitario *
                item.cantidad
              ).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="cobrar-pay-panel__total">
          <strong>Total</strong>
          <strong>S/ {order.total.toFixed(2)}</strong>
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
            setReceived("")
          }}
        >
          {PAYMENT_METHODS.map((pm) => (
            <option key={pm} value={pm}>
              {pm}
            </option>
          ))}
        </select>
      </div>

      {/* Efectivo */}

      {method === "EFECTIVO" ? (
        <div className="cobrar-pay-panel__received">
          <label htmlFor="cashier-received">
            Monto recibido
          </label>

          <input
            id="cashier-received"
            type="number"
            min="0"
            step="0.10"
            value={received}
            placeholder="S/ 0.00"
            onChange={(e) =>
              setReceived(e.target.value)
            }
          />

          {change !== null && (
            <div className="cobrar-pay-panel__change">
              <span>Vuelto</span>
              <strong>
                S/ {change.toFixed(2)}
              </strong>
            </div>
          )}
        </div>
      ) : (
        <div className="cobrar-pay-panel__info">
          <p>
            El pago se registrará mediante{" "}
            <strong>{method}</strong>.
          </p>
        </div>
      )}

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