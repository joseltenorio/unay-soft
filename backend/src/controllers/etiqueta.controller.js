// backend/src/controllers/etiqueta.controller.js

const { getEtiquetas } = require("../services/etiqueta.service")

async function listEtiquetas(req, res) {
  try {
    const etiquetas = await getEtiquetas()
    return res.status(200).json({
      message: "Etiquetas obtenidas correctamente.",
      etiquetas,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener etiquetas.",
      error: error.message,
    })
  }
}

module.exports = { listEtiquetas }