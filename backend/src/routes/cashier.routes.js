// backend/src/routes/cashier.routes.js

const express = require("express")

const {
  listCajasDisponibles,
  getAperturaActiva,
  openCaja,
  getResumen,
  closeCaja,
} = require("../controllers/cashier.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/cajas",
  authenticateToken,
  authorizePermission("cashier.ver"),
  listCajasDisponibles,
)

router.get(
  "/apertura/activa",
  authenticateToken,
  authorizePermission("cashier.ver"),
  getAperturaActiva,
)

router.post(
  "/apertura",
  authenticateToken,
  authorizePermission("cashier.abrir_caja"),
  openCaja,
)

router.get(
  "/apertura/:id_apertura/resumen",
  authenticateToken,
  authorizePermission("cashier.ver"),
  getResumen,
)

router.post(
  "/apertura/:id_apertura/cierre",
  authenticateToken,
  authorizePermission("cashier.cerrar_caja"),
  closeCaja,
)

module.exports = router