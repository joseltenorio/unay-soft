// backend/src/routes/etiqueta.routes.js

const express = require("express")
const { listEtiquetas } = require("../controllers/etiqueta.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/",
  authenticateToken,
  authorizePermission("carta.ver"),
  listEtiquetas
)

module.exports = router