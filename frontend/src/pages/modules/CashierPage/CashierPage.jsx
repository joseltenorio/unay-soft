// src/pages/modules/CashierPage/CashierPage.jsx

import { useEffect, useState } from "react"
import "./CashierPage.css"

import AperturaGate from "./AperturaGate"
import CobrarTab from "./tabs/CobrarTab"
import HistorialTab from "./tabs/HistorialTab"
import CierreTab from "./tabs/CierreTab"

import { getAperturaActiva } from "../../../services/cashierService"
import { getCurrentUser } from "../../../services/authService"

const TABS = [
  { id: "cobrar", label: "Cobrar" },
  { id: "historial", label: "Historial" },
  { id: "cierre", label: "Cierre" },
]

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState("cobrar")
  const [apertura, setApertura] = useState(null)
  const [isCheckingApertura, setIsCheckingApertura] = useState(true)

  const currentUser = getCurrentUser()
  const cajeroName =
    [currentUser?.nombres, currentUser?.apellidos].filter(Boolean).join(" ").trim() ||
    currentUser?.username ||
    "—"

  // Al montar, verifica si el usuario ya tiene un turno ABIERTA en curso
  // (por ejemplo si recargó la página) para no forzarlo a abrir otro.
  useEffect(() => {
    let isMounted = true

    async function checkAperturaActiva() {
      try {
        const aperturaActiva = await getAperturaActiva()

        if (isMounted && aperturaActiva) {
          setApertura(aperturaActiva)
        }
      } catch (error) {
        // Si falla la verificación, simplemente se muestra el gate normal.
      } finally {
        if (isMounted) {
          setIsCheckingApertura(false)
        }
      }
    }

    checkAperturaActiva()

    return () => {
      isMounted = false
    }
  }, [])

  // Se llama cuando CierreTab confirma el cierre del turno.
  // Vuelve apertura a null → CashierPage muestra el AperturaGate otra vez.
  function handleCierreExitoso() {
    setApertura(null)
    setActiveTab("cobrar")
  }

  if (isCheckingApertura) {
    return (
      <div className="cashier-page">
        <div className="cashier-page__shell">
          <p>Verificando turno de caja...</p>
        </div>
      </div>
    )
  }

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
              Turno activo · {apertura.caja_nombre} · Cajero: {cajeroName}
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

        {activeTab === "cobrar" && <CobrarTab apertura={apertura} />}
        {activeTab === "historial" && <HistorialTab apertura={apertura} />}
        {activeTab === "cierre" && (
          <CierreTab apertura={apertura} onCierreExitoso={handleCierreExitoso} />
        )}

      </div>
    </div>
  )
}