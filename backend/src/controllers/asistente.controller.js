// backend/src/controllers/asistente.controller.js

const { consultarAsistente } = require("../services/asistente.service")

async function consulta(req, res) {
  try {
    const { public_identifier, mensaje, historial } = req.body

    if (!public_identifier) {
      return res.status(400).json({
        message: "El establecimiento es requerido.",
      })
    }

    const data = await consultarAsistente({
      publicIdentifier: public_identifier,
      mensaje,
      historial,
    })

    return res.status(200).json(data)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al procesar la consulta del asistente.",
    })
  }
}

module.exports = {
  consulta,
}