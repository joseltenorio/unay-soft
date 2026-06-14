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

router.get("/", authenticateToken, authorizePermission("salon.ver"), listZonas)

router.post(
  "/",
  authenticateToken,
  authorizePermission("salon.gestionar"),
  registerZona,
)

router.put(
  "/:id",
  authenticateToken,
  authorizePermission("salon.gestionar"),
  editZona,
)

router.patch(
  "/:id/status",
  authenticateToken,
  authorizePermission("salon.gestionar"),
  changeZonaStatus,
)

router.delete(
  "/:id",
  authenticateToken,
  authorizePermission("salon.gestionar"),
  removeZona,
)

module.exports = router