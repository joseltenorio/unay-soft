
import { apiPrivateRequest } from "./api"

// ─── Categorías ───────────────────────────────────────────────────────────────

export async function getCategorias() {
  const data = await apiPrivateRequest("/categorias")
  return data.categorias
}

export async function createCategoria(payload) {
  const data = await apiPrivateRequest("/categorias", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return data.categoria
}

export async function updateCategoria(id, payload) {
  const data = await apiPrivateRequest(`/categorias/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return data.categoria
}

export async function toggleCategoriaStatus(id, estado) {
  const data = await apiPrivateRequest(`/categorias/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })
  return data.categoria
}


export async function deleteCategoria(id) {
  const data = await apiPrivateRequest(`/categorias/${id}`, {
    method: "DELETE",
  })
  return data.categoria
}

// ─── Productos ────────────────────────────────────────────────────────────────

export async function getProductos() {
  const data = await apiPrivateRequest("/productos")
  return data.productos
}

export async function createProducto(payload) {
  const data = await apiPrivateRequest("/productos", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return data.producto
}

export async function updateProducto(id, payload) {
  const data = await apiPrivateRequest(`/productos/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return data.producto
}

export async function toggleProductoStatus(id, estado) {
  const data = await apiPrivateRequest(`/productos/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })
  return data.producto
}

export async function deleteProducto(id) {
  const data = await apiPrivateRequest(`/productos/${id}`, {
    method: "DELETE",
  })
  return data.producto
}

export async function getEtiquetas() {
  const data = await apiPrivateRequest("/etiquetas")
  return data.etiquetas
}

export async function asignarEtiquetas(id, tag_ids) {
  const data = await apiPrivateRequest(`/productos/${id}/tags`, {
    method: "PUT",
    body: JSON.stringify({ tag_ids }),
  })
  return data.etiquetas
}