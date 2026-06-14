// frontend/src/services/salonService.js

import { apiPrivateRequest } from "./api"

export async function getZonas() {
  const data = await apiPrivateRequest("/salon/zonas")
  return data.zonas
}

export async function createZona(payload) {
  const data = await apiPrivateRequest("/salon/zonas", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return data.zona
}

export async function updateZona(id, payload) {
  const data = await apiPrivateRequest(`/salon/zonas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return data.zona
}

export async function toggleZonaStatus(id, estado) {
  const data = await apiPrivateRequest(`/salon/zonas/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })
  return data.zona
}

export async function deleteZona(id) {
  const data = await apiPrivateRequest(`/salon/zonas/${id}`, {
    method: "DELETE",
  })
  return data.zona
}


export async function getMesas() {
  const data = await apiPrivateRequest("/salon/mesas")
  return data.mesas
}

export async function createMesa(payload) {
  const data = await apiPrivateRequest("/salon/mesas", {
    method: "POST",
    body: JSON.stringify(payload),
  })
  return data.mesa
}

export async function updateMesa(id, payload) {
  const data = await apiPrivateRequest(`/salon/mesas/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
  return data.mesa
}

export async function toggleMesaStatus(id, estado) {
  const data = await apiPrivateRequest(`/salon/mesas/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ estado }),
  })
  return data.mesa
}

export async function updateMesaDisponibilidad(id, disponibilidad) {
  const data = await apiPrivateRequest(`/salon/mesas/${id}/disponibilidad`, {
    method: "PATCH",
    body: JSON.stringify({ disponibilidad }),
  })
  return data.mesa
}

export async function deleteMesa(id) {
  const data = await apiPrivateRequest(`/salon/mesas/${id}`, {
    method: "DELETE",
  })
  return data.mesa
}