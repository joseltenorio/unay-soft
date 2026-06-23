// frontend/src/services/publicCartaService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export async function getPublicCarta(publicIdentifier) {
  if (!publicIdentifier) {
    throw new Error("El establecimiento es requerido.")
  }

  const response = await fetch(
    `${API_URL}/public/carta/${encodeURIComponent(publicIdentifier)}`,
  )

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      responseData?.message || "No se pudo cargar la carta pública.",
    )
  }

  return responseData
}
