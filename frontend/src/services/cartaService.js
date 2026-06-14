// frontend/src/services/cartaService.js

import { apiPrivateRequest } from "./api"

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

export async function toggleProductoDisponibilidad(id, disponibilidad) {
  const data = await apiPrivateRequest(`/productos/${id}/disponibilidad`, {
    method: "PATCH",
    body: JSON.stringify({ disponibilidad }),
  })
  return data.producto
}

export async function uploadImagenProducto(id, file) {
  const formData = new FormData()
  formData.append("imagen", file)

  const token =
    localStorage.getItem("umari_token") || sessionStorage.getItem("umari_token")

  const response = await fetch(`${import.meta.env.VITE_API_URL}/productos/${id}/imagen`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || "Error al subir imagen")
  return data.producto
}