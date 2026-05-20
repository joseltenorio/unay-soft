// backend/src/controllers/kds.controller.js

const {
  getKitchenOrders,
  updateKitchenItemStatus,
  updateKitchenOrderStatus,
} = require("../services/kds.service")

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

async function changeKitchenOrderStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        message: "El estado de la comanda es obligatorio.",
      })
    }

    const order = await updateKitchenOrderStatus({
      idOrden: id,
      idEstablecimiento: req.user.id_establecimiento,
      nextStatus: status,
    })

    return res.status(200).json({
      message: "Estado de comanda actualizado correctamente.",
      order,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar estado de comanda.",
    })
  }
}

async function changeKitchenItemStatus(req, res) {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        message: "El estado del ítem es obligatorio.",
      })
    }

    const item = await updateKitchenItemStatus({
      idItemOrden: id,
      idEstablecimiento: req.user.id_establecimiento,
      nextStatus: status,
    })

    return res.status(200).json({
      message: "Estado de ítem actualizado correctamente.",
      item,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar estado de ítem.",
    })
  }
}

module.exports = {
  listKitchenOrders,
  changeKitchenOrderStatus,
  changeKitchenItemStatus,
}