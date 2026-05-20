// backend/src/controllers/kds.controller.js

const { getKitchenOrders } = require("../services/kds.service")

async function listKitchenOrders(req, res) {
  try {
    const orders = await getKitchenOrders(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Comandas de cocina obtenidas correctamente.",
      total: orders.length,
      orders,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener comandas de cocina.",
    })
  }
}

module.exports = {
  listKitchenOrders,
}