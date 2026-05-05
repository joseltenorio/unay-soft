// backend/src/server.js

const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { testConnection } = require("./config/database")
const authRoutes = require("./routes/auth.routes")

const app = express()

const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Ruta base
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Umari OS API is running",
    status: "OK",
  })
})

// Health check para probar en Postman
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Backend activo",
    status: "OK",
    timestamp: new Date().toISOString(),
  })
})

// Rutas de autenticación
app.use("/api/auth", authRoutes)

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada.",
    path: req.originalUrl,
  })
})

// Levantar servidor
async function startServer() {
  try {
    await testConnection()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Error starting server:", error.message)
    process.exit(1)
  }
}

startServer()