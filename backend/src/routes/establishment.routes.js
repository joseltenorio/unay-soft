// backend/src/routes/establishment.routes.js

const express = require("express")
const multer = require("multer")

const {
  getEstablishment,
  editEstablishment,
  uploadEstablishmentLogo,
  getMetodosPago,
  createMetodoPagoController,
  toggleMetodoPagoController,
} = require("../controllers/establishment.controller")

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

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

router.get(
  "/",
  authenticateToken,
  authorizePermission("establishment.ver"),
  getEstablishment,
)

router.put(
  "/",
  authenticateToken,
  authorizePermission("establishment.editar"),
  editEstablishment,
)


router.post(
  "/logo",
  authenticateToken,
  authorizePermission("establishment.editar"),
  upload.single("logo"),
  uploadEstablishmentLogo,
)

router.get(
  "/metodos-pago",
  authenticateToken,
  authorizePermission("establishment.ver"),
  getMetodosPago,
)

router.post(
  "/metodos-pago",
  authenticateToken,
  authorizePermission("establishment.editar"),
  createMetodoPagoController,
)

router.patch(
  "/metodos-pago/:idMetodoPago",
  authenticateToken,
  authorizePermission("establishment.editar"),
  toggleMetodoPagoController,
)

module.exports = router