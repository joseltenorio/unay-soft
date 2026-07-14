// src/pages/modules/CashierPage/tabs/CobrarTab.jsx

import { useState, useEffect, useCallback } from "react"
import "./CobrarTab.css"
import useToast from "../../../../components/common/Toast/useToast"
import { consultarRuc } from "../../../../services/sunatService"
import {
  getCuentasPorCobrar,
  getMetodosPago,
  registrarPago,
} from "../../../../services/cashierService"

const TIPO_COMPROBANTE_MAP = {
  BOLETA: "BOL",
  FACTURA: "FAC",
}

// ── CobrarTab ─────────────────────────────────────────────────────

export default function CobrarTab({ apertura }) {
  const { showToast } = useToast()

  const [cuentas, setCuentas] = useState([])
  const [metodosPago, setMetodosPago] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  const [selectedCuenta, setSelectedCuenta] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)

      const [cuentasData, metodosData] = await Promise.all([
        getCuentasPorCobrar(),
        getMetodosPago(),
      ])

      setCuentas(cuentasData)
      setMetodosPago(metodosData)
      setLoadError("")
    } catch (error) {
      setLoadError(error.message || "No se pudieron cargar las cuentas por cobrar.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  function handlePagoRegistrado(idMesaCobrada) {
    setSelectedCuenta(null)

    setCuentas((prev) => prev.filter((cuenta) => cuenta.id_mesa !== idMesaCobrada))

    // Refresca desde el backend por si hay más cuentas nuevas en paralelo.
    loadData()
  }

  return (
    <div className="cobrar-tab">
      <OrderList
        cuentas={cuentas}
        isLoading={isLoading}
        loadError={loadError}
        selectedCuenta={selectedCuenta}
        onSelect={setSelectedCuenta}
      />

      <PayPanel
        cuenta={selectedCuenta}
        apertura={apertura}
        metodosPago={metodosPago}
        clearCuenta={() => setSelectedCuenta(null)}
        onPagoRegistrado={handlePagoRegistrado}
        showToast={showToast}
      />
    </div>
  )
}

// ── OrderList ─────────────────────────────────────────────────────

function OrderList({ cuentas, isLoading, loadError, selectedCuenta, onSelect }) {
  return (
    <div className="cobrar-orders">
      <div className="cobrar-orders__header">
        <h2>Órdenes pendientes</h2>
        <p>Listas para cobrar</p>
      </div>

      {isLoading ? (
        <div className="cobrar-orders__empty">
          <p>Cargando cuentas...</p>
        </div>
      ) : loadError ? (
        <div className="cobrar-orders__empty">
          <p>{loadError}</p>
        </div>
      ) : cuentas.length === 0 ? (
        <div className="cobrar-orders__empty">
          <p>No hay órdenes pendientes de cobro 💵</p>
        </div>
      ) : (
        <ul className="cobrar-orders__list">
          {cuentas.map((cuenta) => {
            const itemCount = cuenta.ordenes.reduce(
              (sum, orden) => sum + (orden.items?.length || 0),
              0,
            )

            const itemNames = cuenta.ordenes
              .flatMap((orden) => orden.items || [])
              .map((item) => item.producto_nombre)
              .join(", ")

            const mesaLabel =
              cuenta.mesa_nombre || `Mesa ${cuenta.mesa_numero ?? "—"}`

            return (
              <li
                key={cuenta.id_mesa || cuenta.id_ordenes.join("-")}
                className={
                  selectedCuenta?.id_mesa === cuenta.id_mesa
                    ? "cobrar-order-card cobrar-order-card--selected"
                    : "cobrar-order-card"
                }
                onClick={() => onSelect(cuenta)}
              >
                <div className="cobrar-order-card__info">
                  <strong>
                    {mesaLabel} · {itemCount} items
                  </strong>
                  <span>{itemNames}</span>
                </div>

                <div className="cobrar-order-card__total">
                  S/ {cuenta.total.toFixed(2)}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

// ── PayPanel ──────────────────────────────────────────────────────

function PayPanel({ cuenta, apertura, metodosPago, clearCuenta, onPagoRegistrado, showToast }) {
  const [idMetodoPago, setIdMetodoPago] = useState("")
  const [received, setReceived] = useState("")
  const [referencia, setReferencia] = useState("")

  const [tipoDoc, setTipoDoc] = useState("BOLETA")
  const [ruc, setRuc] = useState("")
  const [razonSocial, setRazonSocial] = useState("")
  const [rucError, setRucError] = useState("")
  const [rucLoading, setRucLoading] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetea todos los campos cuando cambia la cuenta seleccionada
  useEffect(() => {
    setReceived("")
    setReferencia("")
    setTipoDoc("BOLETA")
    setRuc("")
    setRazonSocial("")
    setRucError("")

    if (metodosPago.length > 0) {
      setIdMetodoPago(metodosPago[0].id_metodo_pago)
    }
  }, [cuenta, metodosPago])

  // Consulta SUNAT automáticamente cuando el RUC llega a 11 dígitos
  useEffect(() => {
    if (tipoDoc !== "FACTURA") return

    if (ruc.length !== 11) {
      setRazonSocial("")
      setRucError("")
      return
    }

    let cancelled = false

    async function buscarRuc() {
      setRucLoading(true)
      setRazonSocial("")
      setRucError("")

      try {
        const response = await consultarRuc(ruc)

        if (cancelled) return
        setRazonSocial(response.data.razonSocial)
      } catch (error) {
        if (cancelled) return
        setRucError(error.message)
      } finally {
        if (!cancelled) setRucLoading(false)
      }
    }

    buscarRuc()

    return () => {
      cancelled = true
    }
  }, [ruc, tipoDoc])

  const selectedMetodo = metodosPago.find(
    (metodo) => metodo.id_metodo_pago === idMetodoPago,
  )
  const isEfectivo = selectedMetodo?.nombre === "EFECTIVO"

  const subtotal = cuenta ? cuenta.subtotal : 0
  const igv = cuenta ? cuenta.igv : 0
  const total = cuenta ? cuenta.total : 0

  const change = received
    ? Math.max(0, parseFloat(received) - total)
    : null

  const detalle = cuenta
    ? cuenta.ordenes.flatMap((orden) => orden.items || [])
    : []

  const canSubmit =
    Boolean(idMetodoPago) &&
    !isSubmitting &&
    (!isEfectivo || (received !== "" && parseFloat(received) >= total)) &&
    (tipoDoc !== "FACTURA" || (ruc.length === 11 && razonSocial !== ""))

  if (!cuenta) {
    return (
      <div className="cobrar-pay-panel cobrar-pay-panel--empty">
        <p>Selecciona una orden para cobrar</p>
      </div>
    )
  }

  function handleRucChange(e) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setRuc(value)
  }

  async function handleSubmit() {
    if (isEfectivo && (received === "" || parseFloat(received) < total)) {
      showToast({
        type: "warning",
        title: "Monto insuficiente",
        message: "El monto recibido es menor al total de la cuenta.",
      })
      return
    }

    try {
      setIsSubmitting(true)

      await registrarPago({
        id_apertura: apertura?.id_apertura,
        id_ordenes: cuenta.id_ordenes,
        id_metodo_pago: idMetodoPago,
        tipo_comprobante: TIPO_COMPROBANTE_MAP[tipoDoc],
        referencia: referencia.trim() || null,
        datos_factura:
          tipoDoc === "FACTURA"
            ? {
                numero_documento: ruc,
                razon_social: razonSocial,
                direccion_fiscal: null,
              }
            : null,
      })

      showToast({
        type: "success",
        title: "Cobro registrado",
        message: `La cuenta de ${cuenta.mesa_nombre || "la mesa"} fue cobrada correctamente.`,
      })

      onPagoRegistrado(cuenta.id_mesa)
    } catch (error) {
      showToast({
        type: "error",
        title: "No se pudo registrar el cobro",
        message: error.message || "Verifica los datos e intenta nuevamente.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cobrar-pay-panel">

      <div className="cobrar-pay-panel__payment-section">
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

            {rucLoading && (
              <small className="cobrar-pay-panel__ruc-loading">
                Consultando SUNAT...
              </small>
            )}

            {razonSocial && !rucLoading && (
              <small className="cobrar-pay-panel__ruc-found">
                {razonSocial}
              </small>
            )}

            {rucError && !rucLoading && (
              <small className="cobrar-pay-panel__ruc-error">
                {rucError}
              </small>
            )}
          </div>
        )}
      </div>

      <div className="cobrar-pay-panel__detail">
        <h3>Detalle de consumo</h3>

        {detalle.map((item) => (
          <div key={item.id_item_orden} className="cobrar-pay-panel__line">
            <span>{item.cantidad}× {item.producto_nombre}</span>
            <span>S/ {Number(item.subtotal).toFixed(2)}</span>
          </div>
        ))}

        <div className="cobrar-pay-panel__subtotals">
          <div className="cobrar-pay-panel__line cobrar-pay-panel__line--muted">
            <span>Subtotal</span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="cobrar-pay-panel__line cobrar-pay-panel__line--muted">
            <span>IGV</span>
            <span>S/ {igv.toFixed(2)}</span>
          </div>
        </div>

        <div className="cobrar-pay-panel__total">
          <strong>Total</strong>
          <strong>S/ {total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="cobrar-pay-panel__payment-section">
        <h3>Método de pago</h3>

        <select
          className="cobrar-pay-panel__select"
          value={idMetodoPago}
          onChange={(e) => {
            setIdMetodoPago(e.target.value)
            setReceived("")
            setReferencia("")
          }}
        >
          {metodosPago.map((metodo) => (
            <option key={metodo.id_metodo_pago} value={metodo.id_metodo_pago}>
              {metodo.nombre}
            </option>
          ))}
        </select>
      </div>

      {isEfectivo ? (
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
            El pago se registrará mediante <strong>{selectedMetodo?.nombre}</strong>.
          </p>

          <div className="cobrar-pay-panel__referencia">
            <label htmlFor="cashier-referencia">Referencia (opcional)</label>
            <input
              id="cashier-referencia"
              type="text"
              placeholder="Ej. N° de operación"
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className="cobrar-pay-panel__submit"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {isSubmitting ? "Registrando..." : "Registrar cobro"}
      </button>
    </div>
  )
}