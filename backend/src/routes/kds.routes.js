// backend/src/routes/kds.routes.js

const express = require("express")

const {
  attendKitchenServiceCall,
  changeKitchenItemStatus,
  changeKitchenOrderStatus,
  createKitchenServiceCall,
  deliverKitchenOrder,
  listKitchenOrders,
  listKitchenServiceCalls,
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

router.post(
  "/orders/:id/service-calls",
  authenticateToken,
  authorizePermission("kds.notificar_servicio"),
  createKitchenServiceCall,
)

router.get(
  "/service-calls",
  authenticateToken,
  authorizePermission("pos.ver_avisos_cocina"),
  listKitchenServiceCalls,
)

router.patch(
  "/service-calls/:id/attend",
  authenticateToken,
  authorizePermission("pos.atender_avisos_cocina"),
  attendKitchenServiceCall,
)

router.patch(
  "/orders/:id/delivered",
  authenticateToken,
  authorizePermission("pos.confirmar_entrega"),
  deliverKitchenOrder,
)

module.exports = router