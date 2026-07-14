// src/pages/modules/CashierPage/CashierPage.jsx

import { useState } from "react"
import "./CashierPage.css"

import AperturaGate from "./AperturaGate"
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

  // Apertura de caja activa del turno actual.
  // null = no hay turno abierto todavía → se bloquea el módulo.
  const [apertura, setApertura] = useState(null)

  // Si no hay apertura activa, muestra el gate y bloquea todo lo demás
  if (!apertura) {
    return <AperturaGate onAperturaExitosa={setApertura} />
  }

  return (
    <div className="cashier-page">
      <div className="cashier-page__shell">

        <div className="cashier-page__header">
          <div className="cashier-page__heading">
            <p className="cashier-page__eyebrow">Caja y pagos</p>
            <h1>Gestión de Caja</h1>
            <p>
              Turno activo · {apertura.caja_nombre} · Cajero: Nombre
            </p>
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

        {activeTab === "cobrar"    && <CobrarTab apertura={apertura} />}
        {activeTab === "historial" && <HistorialTab apertura={apertura} />}
        {activeTab === "cierre"    && <CierreTab apertura={apertura} />}

      </div>
    </div>
  )
}