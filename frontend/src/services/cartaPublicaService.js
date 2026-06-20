// src/services/cartaPublicaService.js

const BASE_URL = "http://localhost:3000/api/public"

export async function getCartaPublica(slug) {
  const res = await fetch(`${BASE_URL}/carta/${slug}`)

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || "No se pudo cargar la carta.")
  }

  return res.json()
  // devuelve { establecimiento: {...}, categorias: [...] }
}