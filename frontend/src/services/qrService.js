// src/services/qrService.js

const BASE_URL = "http://localhost:3000/api/public"

function getToken() {
  const storage = localStorage.getItem("umari_token") ? localStorage : sessionStorage
  return storage.getItem("umari_token")
}

export async function getQR() {
  const res = await fetch(`${BASE_URL}/qr`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "No se pudo obtener el QR.")
  }
  const data = await res.json()
  return data.qr // { id_codigo_qr, url_destino, imagen_qr }
}