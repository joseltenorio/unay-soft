// backend/src/routes/sunat.routes.js

const express = require("express")
const { getRuc } = require("../controllers/sunat.controller")
const { authenticateToken } = require("../middlewares/auth.middleware")

const router = express.Router()

// GET /api/sunat/:ruc
router.get("/:ruc", authenticateToken, getRuc)

module.exports = router