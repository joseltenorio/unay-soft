// backend/src/server.js

const express = require("express")
const cors = require("cors")
require("dotenv").config()

const { testConnection } = require("./config/database")
const authRoutes = require("./routes/auth.routes")
const userRoutes  = require("./routes/user.routes")
const roleRoutes = require("./routes/role.routes")
const establishmentRoutes = require("./routes/establishment.routes")
const kdsRoutes = require("./routes/kds.routes")
const categoriaRoutes = require("./routes/categoria.routes")   
const productoRoutes = require("./routes/producto.routes")    
const etiquetaRoutes = require("./routes/etiqueta.routes")
const posRoutes = require("./routes/pos.routes")
const cashierRoutes = require("./routes/cashier.routes")
const zonaRoutes = require("./routes/zona.routes")
const mesaRoutes = require("./routes/mesa.routes")
const publicRoutes = require("./routes/public.routes")
const sunatRoutes = require("./routes/sunat.routes")

const app = express()
const PORT = process.env.PORT || 3000

app.set("trust proxy", 1)

app.use(cors())
app.use(express.json({ limit: "1mb" }))

app.get("/", (req, res) =>
  res.status(200).json({ message: "Umari OS API is running", status: "OK" })
)

app.get("/api/health", (req, res) =>
  res.status(200).json({ message: "Backend activo", status: "OK", timestamp: new Date().toISOString() })
)

// Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/establishment", establishmentRoutes)
app.use("/api/kds", kdsRoutes)
app.use("/api/categorias", categoriaRoutes)   
app.use("/api/productos", productoRoutes)    
app.use("/api/etiquetas", etiquetaRoutes)
app.use("/api/pos", posRoutes)
app.use("/api/cashier", cashierRoutes)
app.use("/api/salon/zonas", zonaRoutes)
app.use("/api/salon/mesas", mesaRoutes)
app.use("/api/public", publicRoutes)
app.use("/api/sunat", sunatRoutes)

app.use((req, res) =>
  res.status(404).json({ message: "Ruta no encontrada.", path: req.originalUrl })
)

async function startServer() {
  try {
    await testConnection()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (error) {
    console.error("Error starting server:", error.message)
    process.exit(1)
  }
}

startServer()