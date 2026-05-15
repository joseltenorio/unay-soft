// backend/src/routes/establishment.routes.js

const express = require("express")

const {
  getEstablishment,
  editEstablishment,
} = require("../controllers/establishment.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/",
  authenticateToken,
  authorizePermission("establishment.ver"),
  getEstablishment,
)

router.put(
  "/",
  authenticateToken,
  authorizePermission("establishment.editar"),
  editEstablishment,
)

module.exports = router