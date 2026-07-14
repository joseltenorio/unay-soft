// backend/src/routes/cashier.routes.js

const express = require("express")

const {
  listCajasDisponibles,
  getAperturaActiva,
  openCaja,
  listMetodosPago,
  listCuentasPorCobrar,
  registrarPagoHandler,
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
  "/cuentas-por-cobrar",
  authenticateToken,
  authorizePermission("cashier.ver"),
  listCuentasPorCobrar,
)

router.post(
  "/pagos",
  authenticateToken,
  authorizePermission("cashier.registrar_pago"),
  registrarPagoHandler,
)

router.get(
  "/apertura/:id_apertura/resumen",
  authenticateToken,
  authorizePermission("cashier.ver"),
  getResumen,
)

router.get(
  "/apertura/:id_apertura/pagos",
  authenticateToken,
  authorizePermission("cashier.ver"),
  listHistorialPagos,
)

router.post(
  "/apertura/:id_apertura/cierre",
  authenticateToken,
  authorizePermission("cashier.cerrar_caja"),
  closeCaja,
)

router.get(
  "/metodos-pago",
  authenticateToken,
  authorizePermission("cashier.ver"),
  listMetodosPago,
)

module.exports = router