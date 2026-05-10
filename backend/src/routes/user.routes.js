// backend/src/routes/user.routes.js

const express = require("express")

const {
  listUsers,
  registerUser,
  editUser,
} = require("../controllers/user.controller")

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")

const router = express.Router()

router.get(
  "/",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  listUsers,
)

router.post(
  "/",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  registerUser,
)

router.put(
  "/:id",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  editUser,
)

module.exports = router