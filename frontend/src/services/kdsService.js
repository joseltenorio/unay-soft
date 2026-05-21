// frontend/src/services/kdsService.js

import { apiPrivateRequest } from "./api"

export const SERVICE_NOTIFICATION_TYPES = {
  READY_ORDER: "PEDIDO_LISTO",
  KITCHEN_INCIDENT: "INCIDENCIA_COCINA",
}

export const SERVICE_NOTIFICATION_STATUS = {
  PENDING: "PENDIENTE",
  ATTENDED: "ATENDIDA",
  CANCELLED: "CANCELADA",
}

export async function getKitchenOrders() {
  const data = await apiPrivateRequest("/kds/orders")

  return data.orders
}

export async function updateKitchenOrderStatus(idOrden, status) {
  const data = await apiPrivateRequest(`/kds/orders/${idOrden}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })

  return data.order
}

export async function updateKitchenItemStatus(idItemOrden, status) {
  const data = await apiPrivateRequest(`/kds/items/${idItemOrden}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })

  return data.item
}

export async function createKitchenServiceCall(idOrden, serviceCallData) {
  const data = await apiPrivateRequest(`/kds/orders/${idOrden}/service-calls`, {
    method: "POST",
    body: JSON.stringify(serviceCallData),
  })

  return data.notification
}

export async function createReadyOrderServiceCall(idOrden) {
  return createKitchenServiceCall(idOrden, {
    type: SERVICE_NOTIFICATION_TYPES.READY_ORDER,
  })
}

export async function createKitchenIncidentServiceCall(
  idOrden,
  { motivo, mensaje } = {},
) {
  return createKitchenServiceCall(idOrden, {
    type: SERVICE_NOTIFICATION_TYPES.KITCHEN_INCIDENT,
    motivo,
    mensaje,
  })
}

export async function getKitchenServiceCalls(status = SERVICE_NOTIFICATION_STATUS.PENDING) {
  const queryParams = new URLSearchParams()

  if (status) {
    queryParams.set("status", status)
  }

  const endpoint = queryParams.toString()
    ? `/kds/service-calls?${queryParams.toString()}`
    : "/kds/service-calls"

  const data = await apiPrivateRequest(endpoint)

  return data.notifications
}

export async function attendKitchenServiceCall(idNotificacion) {
  const data = await apiPrivateRequest(`/kds/service-calls/${idNotificacion}/attend`, {
    method: "PATCH",
  })

  return data.notification
}

export async function confirmKitchenOrderDelivery(idOrden) {
  const data = await apiPrivateRequest(`/kds/orders/${idOrden}/delivered`, {
    method: "PATCH",
  })

  return data.order
}