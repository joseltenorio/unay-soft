// frontend/src/services/posService.js

import { apiPrivateRequest } from "./api"

function normalizeTable(table) {
  const activeOrderCount = Number(table.active_order_count || 0)

  return {
    ...table,

    id: table.id_mesa || table.id,
    number: table.numero || table.number,
    floor: table.zona_nombre || table.floor || "Sin zona",

    occupied: Boolean(table.occupied),
    waiter: activeOrderCount > 0 ? "Cuenta abierta" : null,
    time: activeOrderCount > 0 ? `${activeOrderCount} orden(es)` : null,

    active_order_count: activeOrderCount,
    active_total: Number(table.active_total || 0),
    active_orders: table.active_orders || [],
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