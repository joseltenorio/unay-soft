// frontend/src/utils/kdsMapper.js

const ORDER_STATUS_TO_UI = {
  ABIERTA: "new",
  EN_PREPARACION: "process",
  LISTA: "done",
}

const UI_STATUS_TO_ORDER = {
  new: "ABIERTA",
  process: "EN_PREPARACION",
  done: "LISTA",
}

const ITEM_STATUS_TO_UI_DONE = {
  PENDIENTE: false,
  EN_PREPARACION: false,
  LISTO: true,
}

export function mapKitchenOrdersToBoard(kitchenOrders = []) {
  return kitchenOrders.map(mapKitchenOrderToBoard)
}

export function mapKitchenOrderToBoard(order) {
  return {
    id: formatOrderNumber(order.numero_orden),
    rawId: order.id_orden,
    table: formatTable(order.mesa),
    waiter: formatWaiter(order.usuario),
    elapsedMinutes: getElapsedMinutes(
      order.enviada_cocina_at || order.abierta_at || order.created_at,
    ),
    status: mapOrderStatusToUi(order.estado),
    rawStatus: order.estado,
    notes: order.observaciones || "",
    openedAt: order.abierta_at,
    sentToKitchenAt: order.enviada_cocina_at,
    preparationStartedAt: order.preparacion_inicio_at,
    readyAt: order.lista_at,
    items: mapKitchenItemsToBoard(order.items),
  }
}

export function mapKitchenItemsToBoard(items = []) {
  return items.map((item) => ({
    id: item.id_item_orden,
    rawId: item.id_item_orden,
    productId: item.id_producto,
    name: item.producto_nombre,
    description: item.producto_descripcion,
    quantity: Number(item.cantidad || 0),
    notes: normalizeNotes(item.notas_cocina),
    done: mapItemStatusToDone(item.estado_cocina),
    rawStatus: item.estado_cocina,
    preparationStartedAt: item.preparacion_inicio_at,
    readyAt: item.listo_at,
  }))
}

export function mapOrderStatusToUi(status) {
  return ORDER_STATUS_TO_UI[status] || "new"
}

export function mapUiStatusToOrder(status) {
  return UI_STATUS_TO_ORDER[status] || "ABIERTA"
}

export function getNextOrderStatus(currentUiStatus) {
  if (currentUiStatus === "new") {
    return "EN_PREPARACION"
  }

  if (currentUiStatus === "process") {
    return "LISTA"
  }

  return null
}

export function getNextItemStatus({ orderStatus, itemDone }) {
  if (itemDone) {
    return null
  }

  if (orderStatus === "new") {
    return null
  }

  return "LISTO"
}

export function canToggleKitchenItem({ orderStatus, itemDone }) {
  if (itemDone) {
    return false
  }

  return orderStatus !== "new"
}

function mapItemStatusToDone(status) {
  return ITEM_STATUS_TO_UI_DONE[status] || false
}

function formatOrderNumber(numeroOrden) {
  if (!numeroOrden) {
    return "#---"
  }

  if (String(numeroOrden).startsWith("#")) {
    return numeroOrden
  }

  return `#${numeroOrden}`
}

function formatTable(mesa) {
  if (!mesa) {
    return "Sin mesa"
  }

  if (mesa.nombre) {
    return mesa.nombre
  }

  if (mesa.numero) {
    return `M${mesa.numero}`
  }

  return "Sin mesa"
}

function formatWaiter(usuario) {
  if (!usuario) {
    return "Sin asignar"
  }

  const fullName = [usuario.nombres, usuario.apellidos]
    .filter(Boolean)
    .join(" ")
    .trim()

  return fullName || usuario.username || "Sin asignar"
}

function normalizeNotes(notes) {
  if (!notes) {
    return []
  }

  if (Array.isArray(notes)) {
    return notes.filter(Boolean)
  }

  return String(notes)
    .split(/\n|;/)
    .map((note) => note.trim())
    .filter(Boolean)
}

function getElapsedMinutes(dateValue) {
  if (!dateValue) {
    return 0
  }

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 0
  }

  const diffInMs = Date.now() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / 60000)

  return Math.max(diffInMinutes, 0)
}