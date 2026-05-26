// backend/src/routes/pos.routes.js

const express = require("express")

const { registerPosOrder } = require("../controllers/pos.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.post(
  "/orders",
  authenticateToken,
  authorizePermission("pos.actualizar_orden"),
  registerPosOrder,
)

module.exports = router