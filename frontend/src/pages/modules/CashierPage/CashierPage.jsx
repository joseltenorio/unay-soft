// src/pages/modules/CashierPage/CashierPage.jsx

import { useState } from "react"
import "./CashierPage.css"

const TABS = [
  { id: "cobrar", label: "Cobrar" },
  { id: "historial", label: "Historial" },
  { id: "cierre", label: "Cierre" },
]

const orders = [
  {
    id: 1,
    mesa: "Mesa 1",
    total: 48.5,
    items: [
      {
        nombre: "Lomo Saltado",
        qty: 1,
        precio: 28.5,
      },
      {
        nombre: "Chicha Morada",
        qty: 2,
        precio: 5,
      },
      {
        nombre: "Pie de Limón",
        qty: 1,
        precio: 10,
      },
    ],
  },
  {
    id: 2,
    mesa: "Mesa 5",
    total: 96,
    items: [
      {
        nombre: "Parrilla Familiar",
        qty: 1,
        precio: 78,
      },
      {
        nombre: "Inca Kola",
        qty: 2,
        precio: 9,
      },
    ],
  },
  {
    id: 3,
    mesa: "Mesa 8",
    total: 32,
    items: [
      {
        nombre: "Hamburguesa Clásica",
        qty: 2,
        precio: 16,
      },
    ],
  },
  {
    id: 4,
    mesa: "Mesa 12",
    total: 114,
    items: [
      {
        nombre: "Ceviche Mixto",
        qty: 2,
        precio: 42,
      },
      {
        nombre: "Limonada",
        qty: 2,
        precio: 8,
      },
      {
        nombre: "Tres Leches",
        qty: 1,
        precio: 14,
      },
    ],
  },
]

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState("cobrar")
  const [selectedOrder, setSelectedOrder] = useState(null)
       
  return (
    <div className="cashier-page">
      <div className="cashier-page__shell">

        <div className="cashier-page__header">
          <div className="cashier-page__heading">
            <p className="cashier-page__eyebrow">Caja y pagos</p>
            <h1>Gestión de Caja</h1>
            <p>Turno activo · Cajero: Nombre</p>
          </div>

          <div className="cashier-page__summary">
            <div><span>Ventas del día</span><strong>S/ 0.00</strong></div>
            <div><span>Efectivo</span><strong>S/ 0.00</strong></div>
            <div><span>Diferencia</span><strong>S/ 0.00</strong></div>
            <div><span>Transacciones</span><strong>0</strong></div>
          </div>
        </div>

        <div className="cashier-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={
                activeTab === tab.id
                  ? "cashier-tabs__button cashier-tabs__button--active"
                  : "cashier-tabs__button"
              }
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "cobrar" && (
          <div className="cashier-cobrar">
            <CashierOrderList
              orders={orders}
              selectedOrder={selectedOrder}
              onSelect={setSelectedOrder}
            />

            <CashierPayPanel
              order={selectedOrder}
            />
          </div>
        )}

        {activeTab === "historial" && (
          <div className="cashier-tab-panel">
            <p>Historial en construcción</p>
          </div>
        )}

        {activeTab === "cierre" && (
          <div className="cashier-tab-panel">
            <p>Cierre de caja en construcción</p>
          </div>
        )}
      </div>
    </div>
  )
}

function CashierOrderList({ orders,selectedOrder, onSelect }) {

  return (
    <div className="cashier-orders">
      <div className="cashier-orders__header">
        <h2>Órdenes pendientes</h2>
        <p>Listas para cobrar</p>
      </div>

      {orders.length === 0 ? (
        <div className="cashier-orders__empty">
          <p>No hay órdenes pendientes de cobro 💵</p>
        </div>
      ) : (
        <ul className="cashier-orders__list">
          {orders.map((order) => (
            <li
              key={order.id}
              className={
                selectedOrder?.id === order.id
                  ? "cashier-order-card cashier-order-card--selected"
                  : "cashier-order-card"
              }
              onClick={() => onSelect(order)}
            >
              <div className="cashier-order-card__info">
                <strong>
                  {order.mesa} · {order.items.length} items
                </strong>

                <span>
                  {order.items.map((item) => item.nombre).join(", ")}
                </span>
              </div>

              <div className="cashier-order-card__total">
                S/ {order.total.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CashierPayPanel({ order }) {
  const [method, setMethod] = useState("efectivo")
  const [received, setReceived] = useState("")

  const change = received
    ? Math.max(0, parseFloat(received) - (order?.total ?? 0))
    : null
  
  if (!order) {
    return (
      <div className="cashier-pay-panel cashier-pay-panel--empty">
        <p>Selecciona una orden para cobrar</p>
      </div>
    )
  }

  return (
    <div className="cashier-pay-panel">
      <div className="cashier-pay-panel__detail">
        <h3>Detalle de consumo</h3>

        {order.items.map((item, index) => (
          <div
            key={index}
            className="cashier-pay-panel__line"
          >
            <span>
              {item.qty}× {item.nombre}
            </span>

            <span>
              S/ {(item.precio * item.qty).toFixed(2)}
            </span>
          </div>
        ))}

        <div className="cashier-pay-panel__total">
          <strong>Total</strong>
          <strong>S/ {order.total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="cashier-pay-panel__payment-section">
        <h3>Método de pago</h3>

        <div className="cashier-pay-panel__methods">
          {["efectivo", "tarjeta", "qr"].map((paymentMethod) => (
            <button
              key={paymentMethod}
              type="button"
              className={
                method === paymentMethod
                  ? "cashier-method-btn cashier-method-btn--active"
                  : "cashier-method-btn"
              }
              onClick={() => setMethod(paymentMethod)}
            >
              {paymentMethod === "qr"
                ? "QR"
                : paymentMethod.charAt(0).toUpperCase() +
                  paymentMethod.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {method === "efectivo" ? (
        <div className="cashier-pay-panel__received">
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
            onChange={(event) =>
              setReceived(event.target.value)
            }
          />

          {change !== null && (
            <div className="cashier-pay-panel__change">
              <span>Vuelto</span>

              <strong>
                S/ {change.toFixed(2)}
              </strong>
            </div>
          )}
        </div>
      ) : (
        <div className="cashier-pay-panel__info">
          <p>
            El pago se registrará mediante{" "}
            <strong>
              {method === "qr" ? "QR" : "Tarjeta"}
            </strong>.
          </p>
        </div>
      )}

      <button
        type="button"
        className="cashier-pay-panel__submit"
      >
        Registrar cobro
      </button>
    </div>
  )
}