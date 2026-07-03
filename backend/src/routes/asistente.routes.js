// backend/src/routes/asistente.routes.js

const express = require("express")

const { consulta } = require("../controllers/asistente.controller")

const router = express.Router()

router.post("/consulta", consulta)

module.exports = router