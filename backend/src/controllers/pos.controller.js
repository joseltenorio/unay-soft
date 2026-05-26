// backend/src/controllers/pos.controller.js

const { createPosOrder } = require("../services/pos.service")

async function registerPosOrder(req, res) {
  try {
    const { id_mesa, observaciones, items } = req.body || {}

    if (!id_mesa) {
      return res.status(400).json({
        message: "Debe seleccionar una mesa para registrar la comanda.",
      })
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Debe enviar al menos un producto en la comanda.",
      })
    }

    const order = await createPosOrder({
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      idMesa: id_mesa,
      observaciones,
      items,
    })

    return res.status(201).json({
      message: "Comanda enviada a cocina correctamente.",
      order,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al registrar la comanda.",
    })
  }
}

module.exports = {
  registerPosOrder,
}