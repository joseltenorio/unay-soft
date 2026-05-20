// frontend/src/services/kdsService.js

import { apiPrivateRequest } from "./api"

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