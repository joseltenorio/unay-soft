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

router.get(   "/",                      authenticateToken, authorizePermission("salon.ver"),       listMesas)
router.post(  "/",                      authenticateToken, authorizePermission("salon.gestionar"), registerMesa)
router.put(   "/:id",                  authenticateToken, authorizePermission("salon.gestionar"), editMesa)
router.patch( "/:id/disponibilidad",   authenticateToken, authorizePermission("salon.gestionar"), changeMesaDisponibilidad)
router.patch( "/:id/status",           authenticateToken, authorizePermission("salon.gestionar"), changeMesaStatus)
router.delete("/:id",                  authenticateToken, authorizePermission("salon.gestionar"), removeMesa)

module.exports = router