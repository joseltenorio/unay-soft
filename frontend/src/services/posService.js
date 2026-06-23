// frontend/src/services/posService.js

import { apiPrivateRequest } from "./api"

function buildUserFullName(user) {
  if (!user) {
    return ""
  }

  return [user.nombres, user.apellidos].filter(Boolean).join(" ").trim()
}

function normalizeTable(table) {
  const activeOrderCount = Number(table.active_order_count || 0)
  const tableService = table.table_service || {}
  const responsibleUser = tableService.responsible_user || null
  const responsibleName = buildUserFullName(responsibleUser)

  return {
    ...table,

    id: table.id_mesa || table.id,
    number: table.numero || table.number,
    floor: table.zona_nombre || table.floor || "Sin zona",

    occupied: Boolean(table.occupied),
    waiter: activeOrderCount > 0
      ? responsibleName || "Cuenta abierta"
      : null,
    time: activeOrderCount > 0 ? `${activeOrderCount} orden(es)` : null,

    active_order_count: activeOrderCount,
    active_total: Number(table.active_total || 0),
    active_orders: table.active_orders || [],
    first_order_at: table.first_order_at || tableService.first_order_at || null,
    last_order_at: table.last_order_at || tableService.last_order_at || null,
    table_service: {
      ...tableService,
      responsible_user: responsibleUser,
      responsible_user_name: responsibleName,
      active_order_count: Number(
        tableService.active_order_count || activeOrderCount,
      ),
      active_total: Number(tableService.active_total || table.active_total || 0),
    },
  }
}

function normalizeProduct(product) {
  return {
    ...product,

    id: product.id_producto || product.id,
    name: product.nombre || product.name,
    category: product.categoria_nombre || product.category || "Sin categoría",
    price: Number(product.precio_base || product.price || 0),

    emoji: "🍽️",
  }
}

function normalizeCategory(category) {
  if (typeof category === "string") {
    return category
  }

  return category.nombre || category.name || "Sin categoría"
}

export async function getPosTables() {
  const data = await apiPrivateRequest("/pos/tables")

  return (data.tables || []).map(normalizeTable)
}

export async function getPosMenu() {
  const data = await apiPrivateRequest("/pos/menu")

  const rawCategories = data.categories || []
  const normalizedCategories = rawCategories.map(normalizeCategory)

  const categories = normalizedCategories.includes("Todos")
    ? normalizedCategories
    : ["Todos", ...normalizedCategories]

  return {
    categories,
    products: (data.products || []).map(normalizeProduct),
  }
}

export async function createPosOrder(payload) {
  const data = await apiPrivateRequest("/pos/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return data.order
}