// backend/src/routes/kds.routes.js

const express = require("express")

const { listKitchenOrders } = require("../controllers/kds.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/orders",
  authenticateToken,
  authorizePermission("kds.ver"),
  listKitchenOrders,
)

module.exports = router