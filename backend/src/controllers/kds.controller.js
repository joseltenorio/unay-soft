// backend/src/controllers/kds.controller.js

const {
  attendServiceNotification,
  createServiceNotification,
  getKitchenOrders,
  getServiceNotifications,
  markOrderAsDelivered,
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

async function createKitchenServiceCall(req, res) {
  try {
    const { id } = req.params
    const { type, motivo, mensaje } = req.body

    if (!type) {
      return res.status(400).json({
        message: "El tipo de aviso de servicio es obligatorio.",
      })
    }

    const notification = await createServiceNotification({
      idOrden: id,
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      type,
      motivo,
      mensaje,
    })

    return res.status(201).json({
      message: "Aviso de servicio creado correctamente.",
      notification,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al crear aviso de servicio.",
    })
  }
}

async function listKitchenServiceCalls(req, res) {
  try {
    const { status = "PENDIENTE" } = req.query

    const notifications = await getServiceNotifications({
      idEstablecimiento: req.user.id_establecimiento,
      status,
    })

    return res.status(200).json({
      message: "Avisos de cocina obtenidos correctamente.",
      total: notifications.length,
      notifications,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener avisos de cocina.",
    })
  }
}

async function attendKitchenServiceCall(req, res) {
  try {
    const { id } = req.params

    const notification = await attendServiceNotification({
      idNotificacion: id,
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
    })

    return res.status(200).json({
      message: "Aviso de cocina atendido correctamente.",
      notification,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al atender aviso de cocina.",
    })
  }
}

async function deliverKitchenOrder(req, res) {
  try {
    const { id } = req.params

    const order = await markOrderAsDelivered({
      idOrden: id,
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
    })

    return res.status(200).json({
      message: "Entrega de comanda confirmada correctamente.",
      order,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al confirmar entrega de comanda.",
    })
  }
}

module.exports = {
  listKitchenOrders,
  changeKitchenOrderStatus,
  changeKitchenItemStatus,
  createKitchenServiceCall,
  listKitchenServiceCalls,
  attendKitchenServiceCall,
  deliverKitchenOrder,
}