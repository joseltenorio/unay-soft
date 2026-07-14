// frontend/src/services/cashierService.js

import { apiPrivateRequest } from "./api"

export async function getCajasDisponibles() {
  const data = await apiPrivateRequest("/cashier/cajas")

  return data.cajas || []
}

export async function getAperturaActiva() {
  const data = await apiPrivateRequest("/cashier/apertura/activa")

  return data.apertura || null
}

export async function abrirCaja({ id_caja, monto_inicial, observaciones }) {
  const data = await apiPrivateRequest("/cashier/apertura", {
    method: "POST",
    body: JSON.stringify({ id_caja, monto_inicial, observaciones }),
  })

  return data.apertura
}

export async function getMetodosPago() {
  const data = await apiPrivateRequest("/cashier/metodos-pago")

  return data.metodos || []
}

export async function getCuentasPorCobrar() {
  const data = await apiPrivateRequest("/cashier/cuentas-por-cobrar")

  return data.cuentas || []
}

export async function registrarPago({
  id_apertura,
  id_ordenes,
  id_metodo_pago,
  tipo_comprobante,
  referencia,
  datos_factura,
}) {
  const data = await apiPrivateRequest("/cashier/pagos", {
    method: "POST",
    body: JSON.stringify({
      id_apertura,
      id_ordenes,
      id_metodo_pago,
      tipo_comprobante,
      referencia,
      datos_factura,
    }),
  })

  return data.resultado
}

export async function getResumenTurno(idApertura) {
  const data = await apiPrivateRequest(`/cashier/apertura/${idApertura}/resumen`)

  return data.resumen
}

export async function cerrarCaja(idApertura, { total_declarado, observaciones }) {
  const data = await apiPrivateRequest(`/cashier/apertura/${idApertura}/cierre`, {
    method: "POST",
    body: JSON.stringify({ total_declarado, observaciones }),
  })

  return data.cierre
}