const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { testConnection } = require("./config/database")
const authRoutes = require("./routes/auth.routes")

const app = express()

const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.json({
    message: "Umari OS API is running",
    status: "OK",
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend activo",
    status: "OK",
    timestamp: new Date().toISOString(),
  })
})

app.use("/api/auth", authRoutes)

async function startServer() {
  await testConnection()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

startServer()