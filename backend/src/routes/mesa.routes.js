// backend/src/routes/salon.routes.js

const express = require("express")
const router = express.Router()

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const {
  listMesas,
  registerMesa,
  editMesa,
  changeMesaDisponibilidad,
  changeMesaStatus,
  removeMesa,
} = require("../controllers/mesa.controller")

router.get(   "/mesas",                      authenticateToken, authorizePermission("salon.ver"),       listMesas)
router.post(  "/mesas",                      authenticateToken, authorizePermission("salon.gestionar"), registerMesa)
router.put(   "/mesas/:id",                  authenticateToken, authorizePermission("salon.gestionar"), editMesa)
router.patch( "/mesas/:id/disponibilidad",   authenticateToken, authorizePermission("salon.gestionar"), changeMesaDisponibilidad)
router.patch( "/mesas/:id/status",           authenticateToken, authorizePermission("salon.gestionar"), changeMesaStatus)
router.delete("/mesas/:id",                  authenticateToken, authorizePermission("salon.gestionar"), removeMesa)

module.exports = router