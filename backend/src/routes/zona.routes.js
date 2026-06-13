// backend/src/routes/zona.routes.js

const express = require("express")
const router = express.Router()

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const {
  listZonas,
  registerZona,
  editZona,
  changeZonaStatus,
  removeZona,
} = require("../controllers/zona.controller")

router.get(   "/zonas",             authenticateToken, authorizePermission("salon.ver"),       listZonas)
router.post(  "/zonas",             authenticateToken, authorizePermission("salon.gestionar"), registerZona)
router.put(   "/zonas/:id",         authenticateToken, authorizePermission("salon.gestionar"), editZona)
router.patch( "/zonas/:id/status",  authenticateToken, authorizePermission("salon.gestionar"), changeZonaStatus)
router.delete("/zonas/:id",         authenticateToken, authorizePermission("salon.gestionar"), removeZona)

module.exports = router