// backend/src/routes/demo.routes.js

const express = require("express")

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/cashier-area",
  authenticateToken,
  authorizePermission("cashier.ver"),
  (req, res) => {
    res.status(200).json({
      message: "Acceso permitido al módulo de caja.",
      requiredPermission: "cashier.ver",
      user: req.user,
    })
  },
)

router.get(
  "/waiter-area",
  authenticateToken,
  authorizePermission("pos.actualizar_orden"),
  (req, res) => {
    res.status(200).json({
      message: "Acceso permitido al módulo de pedidos / POS.",
      requiredPermission: "pos.actualizar_orden",
      user: req.user,
    })
  },
)

module.exports = router