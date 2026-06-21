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
          <div className="cashier-tab-panel">
            <p>Pantalla de cobro en construcción</p>
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