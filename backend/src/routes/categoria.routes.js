// backend/src/routes/categoria.routes.js

const express = require("express")
const router = express.Router()

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const {
  listCategorias,
  registerCategoria,
  editCategoria,
  changeCategoriaStatus,
  removeCategoria,
} = require("../controllers/categoria.controller")

router.get("/", authenticateToken, authorizePermission("carta.ver"), listCategorias)
router.post("/", authenticateToken, authorizePermission("carta.gestionar"), registerCategoria)
router.put("/:id", authenticateToken, authorizePermission("carta.gestionar"), editCategoria)
router.patch("/:id/status", authenticateToken, authorizePermission("carta.gestionar"), changeCategoriaStatus)
router.delete("/:id", authenticateToken, authorizePermission("carta.gestionar"), removeCategoria)

module.exports = router