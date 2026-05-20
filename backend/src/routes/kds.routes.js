// backend/src/routes/kds.routes.js

const express = require("express")

const {
  changeKitchenItemStatus,
  changeKitchenOrderStatus,
  listKitchenOrders,
} = require("../controllers/kds.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/orders",
  authenticateToken,
  authorizePermission("kds.ver"),
  listKitchenOrders,
)

router.patch(
  "/orders/:id/status",
  authenticateToken,
  authorizePermission("kds.actualizar_estado"),
  changeKitchenOrderStatus,
)

router.patch(
  "/items/:id/status",
  authenticateToken,
  authorizePermission("kds.actualizar_estado"),
  changeKitchenItemStatus,
)

module.exports = router