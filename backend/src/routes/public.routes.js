// backend/src/routes/public.routes.js

const express = require("express")

const { cartaPublica, generarQR } = require("../controllers/public.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get("/carta/:public_identifier", cartaPublica)

router.get(
  "/qr",
  authenticateToken,
  authorizePermission("carta.ver"),
  generarQR,
)

module.exports = router
