// backend/src/controllers/sunat.controller.js

const { consultarRuc } = require("../services/sunat.service")

async function getRuc(req, res) {
  try {
    // El RUC viene en la URL: /api/sunat/20...3
    const { ruc } = req.params

    // Validación básica antes de llamar al servicio
    if (!ruc || ruc.length !== 11 || !/^\d+$/.test(ruc)) {
      return res.status(422).json({
        message: "El RUC debe tener exactamente 11 dígitos.",
      })
    }

    const data = await consultarRuc(ruc)

    // Para emitir factura el RUC debe estar activo y habido
    if (data.estado !== "ACTIVO") {
      return res.status(422).json({
        message: `El RUC no está activo en SUNAT (estado: ${data.estado}).`,
      })
    }

    if (data.condicion !== "HABIDO") {
      return res.status(422).json({
        message: `El RUC no tiene condición HABIDO en SUNAT (condición: ${data.condicion}).`,
      })
    }

    return res.status(200).json({
      message: "RUC consultado correctamente.",
      data,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al consultar el RUC.",
    })
  }
}

module.exports = { getRuc }