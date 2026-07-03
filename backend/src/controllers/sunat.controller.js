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

    // RUC de persona natural empieza con 10 — no válido para factura
    if (ruc.startsWith("10")) {
      return res.status(422).json({
        message: "El RUC ingresado pertenece a una persona natural. Para emitir factura ingrese el RUC de una empresa.",
      })
    }

    const data = await consultarRuc(ruc)

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