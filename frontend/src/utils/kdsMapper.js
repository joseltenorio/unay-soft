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
  const elapsedMinutes = getElapsedMinutes(
    order.enviada_cocina_at || order.abierta_at || order.created_at,
  )
  const createdBy = mapUser(order.created_by || order.usuario)
  const responsibleWaiter = mapUser(order.table_service?.responsible_user)
  const tableService = mapTableService(order.table_service)

  return {
    id: formatOrderNumber(order.numero_orden),
    rawId: order.id_orden,
    rawOrderNumber: order.numero_orden,
    table: formatTable(order.mesa),
    waiter: formatUserDisplayName(order.usuario),
    createdBy,
    createdByName: formatUserDisplayName(createdBy),
    responsibleWaiter,
    responsibleWaiterName: formatUserDisplayName(responsibleWaiter),
    isSupportOrder: isDifferentUser(createdBy, responsibleWaiter),
    tableService,
    elapsedMinutes,
    elapsedLabel: formatElapsedTime(elapsedMinutes),
    status: mapOrderStatusToUi(order.estado),
    rawStatus: order.estado,
    notes: normalizeOrderNotes(order.observaciones),
    orderNotes: normalizeNotes(order.observaciones),
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
  if (orderStatus === "new") {
    return null
  }

  if (orderStatus === "done") {
    return null
  }

  if (itemDone) {
    return "EN_PREPARACION"
  }

  return "LISTO"
}

export function canToggleKitchenItem({ orderStatus }) {
  return orderStatus === "process"
}

export function formatElapsedTime(minutes) {
  const safeMinutes = Number(minutes || 0)

  if (safeMinutes <= 0) {
    return "0m"
  }

  if (safeMinutes < 60) {
    return `${safeMinutes}m`
  }

  const hours = Math.floor(safeMinutes / 60)

  if (hours < 24) {
    const remainingMinutes = safeMinutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return "+24h"
}

function mapItemStatusToDone(status) {
  return ITEM_STATUS_TO_UI_DONE[status] || false
}

function formatOrderNumber(numeroOrden) {
  if (!numeroOrden) {
    return "#---"
  }

  const value = String(numeroOrden).trim()

  const lastNumericBlock = value.match(/(\d+)$/)

  if (lastNumericBlock) {
    return `#${lastNumericBlock[1]}`
  }

  if (value.startsWith("#")) {
    return value
  }

  return `#${value}`
}

function formatTable(mesa) {
  if (!mesa) {
    return "SM"
  }

  if (mesa.numero) {
    return `M${mesa.numero}`
  }

  if (mesa.nombre) {
    const normalizedName = String(mesa.nombre).trim().toLowerCase()

    if (normalizedName.includes("sin mesa")) {
      return "SM"
    }

    const numericBlock = normalizedName.match(/(\d+)/)

    if (numericBlock) {
      return `M${numericBlock[1]}`
    }

    return mesa.nombre
  }

  return "SM"
}

function mapUser(user) {
  if (!user) {
    return null
  }

  return {
    id_usuario: user.id_usuario || user.id || null,
    nombres: user.nombres || "",
    apellidos: user.apellidos || "",
    username: user.username || "",
  }
}

function mapTableService(tableService) {
  if (!tableService) {
    return {
      responsibleUser: null,
      responsibleOrder: null,
      activeOrderCount: 0,
      activeTotal: 0,
      firstOrderAt: null,
      lastOrderAt: null,
    }
  }

  return {
    responsibleUser: mapUser(tableService.responsible_user),
    responsibleOrder: tableService.responsible_order || null,
    activeOrderCount: Number(tableService.active_order_count || 0),
    activeTotal: Number(tableService.active_total || 0),
    firstOrderAt: tableService.first_order_at || null,
    lastOrderAt: tableService.last_order_at || null,
  }
}

function isDifferentUser(firstUser, secondUser) {
  if (!firstUser?.id_usuario || !secondUser?.id_usuario) {
    return false
  }

  return firstUser.id_usuario !== secondUser.id_usuario
}

function formatUserDisplayName(user) {
  if (!user) {
    return "Sin asignar"
  }

  const fullName = [user.nombres, user.apellidos]
    .filter(Boolean)
    .join(" ")
    .trim()

  return fullName || user.username || "Sin asignar"
}

function normalizeOrderNotes(notes) {
  return String(notes || "").trim()
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
