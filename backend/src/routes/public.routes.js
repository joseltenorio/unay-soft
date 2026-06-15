// backend/src/routes/public.routes.js
const express = require("express")
const router = express.Router()

const { authenticateToken }   = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")
const { cartaPublica, generarQR } = require("../controllers/public.controller")

// HU18 — SIN autenticación (CA1: acceso sin login, CA7: acceso desde QR)
router.get("/carta/:id_establecimiento", cartaPublica)

module.exports = router