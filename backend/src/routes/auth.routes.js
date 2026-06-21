// backend/src/routes/auth.routes.js

const express = require("express")

const {
  login,
  logout,
  me,
  refresh,
} = require("../controllers/auth.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")
const { loginRateLimiter } = require("../middlewares/rateLimit.middleware")
const { validateBody } = require("../middlewares/validate.middleware")
const {
  loginSchema,
  refreshSchema,
} = require("../validators/auth.validator")

const router = express.Router()

router.post("/login", loginRateLimiter, validateBody(loginSchema), login)

router.post("/refresh", validateBody(refreshSchema), refresh)

router.post("/logout", authenticateToken, logout)

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