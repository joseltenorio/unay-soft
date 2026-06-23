// backend/src/routes/user.routes.js

const express = require("express")

const {
  listUsers,
  registerUser,
  editUser,
  changeUserStatus,
} = require("../controllers/user.controller")

const { authenticateToken } = require("../middlewares/auth.middleware")
const { authorizePermission } = require("../middlewares/permission.middleware")
const {
  validateBody,
  validateParams,
} = require("../middlewares/validate.middleware")
const {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamSchema,
} = require("../validators/user.validator")

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
  validateBody(createUserSchema),
  registerUser,
)

router.put(
  "/:id",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  editUser,
)

router.patch(
  "/:id/status",
  authenticateToken,
  authorizePermission("security.gestionar_usuarios"),
  validateParams(userIdParamSchema),
  validateBody(updateUserStatusSchema),
  changeUserStatus,
)

module.exports = router