// frontend/src/services/asistenteService.js

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

export async function consultarAsistente(publicIdentifier, mensaje, historial = []) {
  if (!publicIdentifier) {
    throw new Error("El establecimiento es requerido.")
  }

  if (!mensaje || !mensaje.trim()) {
    throw new Error("Escribe una consulta antes de enviarla.")
  }

  const response = await fetch(`${API_URL}/asistente/consulta`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_identifier: publicIdentifier,
      mensaje: mensaje.trim(),
      historial,
    }),
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      responseData?.message || "No se pudo procesar la consulta del asistente.",
    )
  }

  return responseData
}