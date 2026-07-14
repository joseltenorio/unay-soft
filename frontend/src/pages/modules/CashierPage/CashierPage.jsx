// src/pages/modules/CashierPage/CashierPage.jsx

import { useCallback, useEffect, useState } from "react"
import "./CashierPage.css"

import AperturaGate from "./AperturaGate"
import CobrarTab from "./tabs/CobrarTab"
import HistorialTab from "./tabs/HistorialTab"
import CierreTab from "./tabs/CierreTab"

import { getAperturaActiva, getResumenTurno } from "../../../services/cashierService"
import { getCurrentUser } from "../../../services/authService"

const TABS = [
  { id: "cobrar", label: "Cobrar" },
  { id: "historial", label: "Historial" },
  { id: "cierre", label: "Cierre" },
]

function formatCurrency(amount) {
  return `S/ ${Number(amount || 0).toFixed(2)}`
}

export default function CashierPage() {
  const [activeTab, setActiveTab] = useState("cobrar")
  const [apertura, setApertura] = useState(null)
  const [isCheckingApertura, setIsCheckingApertura] = useState(true)

  const [resumen, setResumen] = useState(null)

  const currentUser = getCurrentUser()
  const cajeroName =
    [currentUser?.nombres, currentUser?.apellidos].filter(Boolean).join(" ").trim() ||
    currentUser?.username ||
    "—"

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

  const loadResumen = useCallback(async () => {
    if (!apertura?.id_apertura) {
      return
    }

    try {
      const data = await getResumenTurno(apertura.id_apertura)
      setResumen(data)
    } catch (error) {
      // Silencioso: el header de resumen no debe bloquear el uso del módulo.
    }
  }, [apertura?.id_apertura])

  useEffect(() => {
    loadResumen()
  }, [loadResumen])

  function handleCierreExitoso() {
    setApertura(null)
    setResumen(null)
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

  const totalVentas = resumen?.total_ventas_turno || 0

  const totalEfectivoTurno =
    resumen?.desglose_por_metodo?.find((item) => item.metodo_pago === "EFECTIVO")
      ?.total || 0

  const totalTransacciones =
    resumen?.desglose_por_metodo?.reduce((sum, item) => sum + item.cantidad, 0) || 0

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
            <div>
              <span>Ventas del día</span>
              <strong>{formatCurrency(totalVentas)}</strong>
            </div>
            <div>
              <span>Efectivo</span>
              <strong>{formatCurrency(totalEfectivoTurno)}</strong>
            </div>
            <div>
              <span>Transacciones</span>
              <strong>{totalTransacciones}</strong>
            </div>
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
          <CobrarTab apertura={apertura} onCobroRegistrado={loadResumen} />
        )}
        {activeTab === "historial" && <HistorialTab apertura={apertura} />}
        {activeTab === "cierre" && (
          <CierreTab apertura={apertura} onCierreExitoso={handleCierreExitoso} />
        )}

      </div>
    </div>
  )
}