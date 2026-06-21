// backend/src/routes/auth.routes.js

const express = require("express")

const {
  login,
  me,
  refresh,
} = require("../controllers/auth.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.post("/login", login)

router.post("/refresh", refresh)

router.get("/me", authenticateToken, me)

router.get(
  "/admin-check",
  authenticateToken,
  authorizePermission("security.ver"),
  (req, res) => {
    res.status(200).json({
      message: "Acceso permitido al recurso protegido por permiso.",
      requiredPermission: "security.ver",
      user: req.user,
    })
  },
)

module.exports = router