// backend/src/routes/producto.routes.js

const express = require("express")
const multer = require("multer")
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
  changeProductoDisponibilidad,
  uploadProductoImagen,
} = require("../controllers/producto.controller")

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP."))
    }
  },
})

router.get("/", authenticateToken, authorizePermission("carta.ver"), listProductos)
router.post("/", authenticateToken, authorizePermission("carta.gestionar"), registerProducto)
router.put("/:id", authenticateToken, authorizePermission("carta.gestionar"), editProducto)
router.put("/:id/tags", authenticateToken, authorizePermission("carta.gestionar"), assignTags)
router.patch("/:id/status", authenticateToken, authorizePermission("carta.gestionar"), changeProductoStatus)
router.delete("/:id", authenticateToken, authorizePermission("carta.gestionar"), removeProducto)
router.patch("/:id/disponibilidad", authenticateToken, authorizePermission("carta.gestionar"), changeProductoDisponibilidad)
router.post("/:id/imagen", authenticateToken, authorizePermission("carta.gestionar"), upload.single("imagen"), uploadProductoImagen)

module.exports = router