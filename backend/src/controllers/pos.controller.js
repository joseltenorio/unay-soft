// backend/src/controllers/pos.controller.js

const {
  createPosOrder,
  getPosMenu,
  getPosTables,
  cancelOrderItem,
  enviarOrdenACaja,
} = require("../services/pos.service")

async function listPosTables(req, res) {
  try {
    const tables = await getPosTables(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Mesas de POS obtenidas correctamente.",
      total: tables.length,
      tables,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener mesas de POS.",
    })
  }
}

async function listPosMenu(req, res) {
  try {
    const menu = await getPosMenu(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Menú de POS obtenido correctamente.",
      total: menu.products.length,
      categories: menu.categories,
      products: menu.products,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener menú de POS.",
    })
  }
}

async function registerPosOrder(req, res) {
  try {
    const { id_mesa, observaciones, items } = req.body

    if (!id_mesa) {
      return res.status(400).json({
        message: "Debe seleccionar una mesa para registrar la comanda.",
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

async function cancelPosOrderItem(req, res) {
  try {
    const { id_item_orden } = req.params
    const { cantidad } = req.body

    if (!id_item_orden) {
      return res.status(400).json({
        message: "Debe indicar el ítem de la comanda a cancelar.",
      })
    }

    const result = await cancelOrderItem({
      idItemOrden: id_item_orden,
      idEstablecimiento: req.user.id_establecimiento,
      cantidadACancelar: cantidad,
    })

    return res.status(200).json({
      message: "Producto cancelado correctamente.",
      result,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al cancelar el producto de la comanda.",
    })
  }
}

async function sendOrderToCashier(req, res) {
  try {
    const { id_mesa } = req.body

    if (!id_mesa) {
      return res.status(400).json({
        message: "Debe indicar la mesa a enviar a caja.",
      })
    }

    const result = await enviarOrdenACaja({
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      idMesa: id_mesa,
    })

    return res.status(200).json({
      message: "Pedido enviado a caja correctamente.",
      result,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al enviar el pedido a caja.",
    })
  }
}

module.exports = {
  listPosTables,
  listPosMenu,
  registerPosOrder,
  cancelPosOrderItem,
  sendOrderToCashier,
}