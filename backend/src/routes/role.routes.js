// backend/src/routes/role.routes.js

const express = require("express")

const { listRoles } = require("../controllers/role.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  listRoles,
)

module.exports = router