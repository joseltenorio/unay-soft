// src/pages/modules/CashierPage/CashierPage.jsx

import { useState } from "react"
import "./CashierPage.css"

const TABS = [
  { id: "cobrar", label: "Cobrar" },
  { id: "historial", label: "Historial" },
  { id: "cierre", label: "Cierre" },
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

            <p>
              Turno activo · Cajero: Nombre
            </p>
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
              selectedOrder={selectedOrder}
              onSelect={setSelectedOrder}
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

function CashierOrderList({ selectedOrder, onSelect }) {
  const orders = []

  return (
    <div className="cashier-orders">
      <div className="cashier-orders__header">
        <h2>Órdenes pendientes</h2>
        <p>Listas para cobrar</p>
      </div>

      {orders.length === 0 ? (
        <div className="cashier-orders__empty">
          <p>No hay órdenes pendientes de cobro</p>
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