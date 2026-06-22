// src/pages/modules/CashierPage/tabs/CobrarTab.jsx

import { useState } from "react"
import "./CobrarTab.css"

// TODO: reemplazar con datos reales desde API / contexto / props
const ORDERS_MOCK = [
  {
    id: 1,
    mesa: "Mesa 1",
    total: 48.5,
    items: [
      { nombre: "Lomo Saltado",   qty: 1, precio: 28.5 },
      { nombre: "Chicha Morada",  qty: 2, precio: 5    },
      { nombre: "Pie de Limón",   qty: 1, precio: 10   },
    ],
  },
  {
    id: 2,
    mesa: "Mesa 5",
    total: 96,
    items: [
      { nombre: "Parrilla Familiar", qty: 1, precio: 78 },
      { nombre: "Inca Kola",         qty: 2, precio: 9  },
    ],
  },
  {
    id: 3,
    mesa: "Mesa 8",
    total: 32,
    items: [
      { nombre: "Hamburguesa Clásica", qty: 2, precio: 16 },
    ],
  },
  {
    id: 4,
    mesa: "Mesa 12",
    total: 114,
    items: [
      { nombre: "Ceviche Mixto", qty: 2, precio: 42 },
      { nombre: "Limonada",      qty: 2, precio: 8  },
      { nombre: "Tres Leches",   qty: 1, precio: 14 },
    ],
  },
]

export default function CobrarTab() {
  const [selectedOrder, setSelectedOrder] = useState(null)

  return (
    <div className="cobrar-tab">
      <OrderList
        orders={ORDERS_MOCK}
        selectedOrder={selectedOrder}
        onSelect={setSelectedOrder}
      />

      <PayPanel order={selectedOrder} />
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
              key={order.id}
              className={
                selectedOrder?.id === order.id
                  ? "cobrar-order-card cobrar-order-card--selected"
                  : "cobrar-order-card"
              }
              onClick={() => onSelect(order)}
            >
              <div className="cobrar-order-card__info">
                <strong>
                  {order.mesa} · {order.items.length} items
                </strong>
                <span>
                  {order.items.map((item) => item.nombre).join(", ")}
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

const PAYMENT_METHODS = ["efectivo", "tarjeta", "qr"]

function PayPanel({ order }) {
  const [method, setMethod] = useState("efectivo")
  const [received, setReceived] = useState("")

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
    // TODO: lógica de registro de cobro
    console.log("Registrar cobro", { order, method, received })
  }

  const canSubmit =
    method !== "efectivo" ||
    (received !== "" && parseFloat(received) >= order.total)

  return (
    <div className="cobrar-pay-panel">

      {/* Detalle */}
      <div className="cobrar-pay-panel__detail">
        <h3>Detalle de consumo</h3>

        {order.items.map((item, index) => (
          <div key={index} className="cobrar-pay-panel__line">
            <span>{item.qty}× {item.nombre}</span>
            <span>S/ {(item.precio * item.qty).toFixed(2)}</span>
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

        <div className="cobrar-pay-panel__methods">
          {PAYMENT_METHODS.map((pm) => (
            <button
              key={pm}
              type="button"
              className={
                method === pm
                  ? "cobrar-method-btn cobrar-method-btn--active"
                  : "cobrar-method-btn"
              }
              onClick={() => {
                setMethod(pm)
                setReceived("")
              }}
            >
              {pm === "qr"
                ? "QR"
                : pm.charAt(0).toUpperCase() + pm.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Efectivo: monto recibido y vuelto */}
      {method === "efectivo" ? (
        <div className="cobrar-pay-panel__received">
          <label htmlFor="cashier-received">Monto recibido</label>

          <input
            id="cashier-received"
            type="number"
            min="0"
            step="0.10"
            value={received}
            placeholder="S/ 0.00"
            onChange={(e) => setReceived(e.target.value)}
          />

          {change !== null && (
            <div className="cobrar-pay-panel__change">
              <span>Vuelto</span>
              <strong>S/ {change.toFixed(2)}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="cobrar-pay-panel__info">
          <p>
            El pago se registrará mediante{" "}
            <strong>{method === "qr" ? "QR" : "Tarjeta"}</strong>.
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