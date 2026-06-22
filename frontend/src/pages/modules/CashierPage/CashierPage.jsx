// src/pages/modules/CashierPage/CashierPage.jsx

import { useState } from "react"
import "./CashierPage.css"

import CobrarTab from "./tabs/CobrarTab"
import HistorialTab from "./tabs/HistorialTab"
import CierreTab from "./tabs/CierreTab"

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

        {activeTab === "cobrar"    && <CobrarTab />}
        {activeTab === "historial" && <HistorialTab />}
        {activeTab === "cierre"    && <CierreTab />}

      </div>
    </div>
  )
}