// backend/src/routes/auth.routes.js

const express = require("express")

const { login } = require("../controllers/auth.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")

const router = express.Router()

router.post("/login", login)

router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    message: "Usuario autenticado correctamente.",
    user: req.user,
  })
})

module.exports = router