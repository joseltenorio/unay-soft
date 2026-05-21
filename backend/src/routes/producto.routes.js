// backend/src/routes/producto.routes.js
// Corregido: usa authenticateToken y authorizePermission (igual que user.routes.js)

const express = require("express")
const router = express.Router()

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const {
  listProductos,
  registerProducto,
  editProducto,
  changeProductoStatus,
  removeProducto,
  assignTags,
} = require("../controllers/producto.controller")

router.get("/", authenticateToken, authorizePermission("carta.ver"), listProductos)
router.post("/", authenticateToken, authorizePermission("carta.gestionar"), registerProducto)
router.put("/:id", authenticateToken, authorizePermission("carta.gestionar"), editProducto)
router.put("/:id/tags", authenticateToken, authorizePermission("carta.gestionar"), assignTags)
router.patch("/:id/status", authenticateToken, authorizePermission("carta.gestionar"), changeProductoStatus)
router.delete("/:id", authenticateToken, authorizePermission("carta.gestionar"), removeProducto)
module.exports = router