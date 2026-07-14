// backend/src/routes/pos.routes.js

const express = require("express")

const {
  listPosMenu,
  listPosTables,
  registerPosOrder,
  cancelPosOrderItem,
} = require("../controllers/pos.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/tables",
  authenticateToken,
  authorizePermission("pos.ver"),
  listPosTables,
)

router.get(
  "/menu",
  authenticateToken,
  authorizePermission("pos.ver"),
  listPosMenu,
)

router.post(
  "/orders",
  authenticateToken,
  authorizePermission("pos.actualizar_orden"),
  registerPosOrder,
)

router.delete(
  "/orders/items/:id_item_orden",
  authenticateToken,
  authorizePermission("pos.actualizar_orden"),
  cancelPosOrderItem,
)

router.post(
  "/orders/send-to-cashier",
  authenticateToken,
  authorizePermission("pos.actualizar_orden"),
  sendOrderToCashier,
)

module.exports = router