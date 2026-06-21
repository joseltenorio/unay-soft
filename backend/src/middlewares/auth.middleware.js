// backend/src/middlewares/auth.middleware.js

const { getActiveSessionById } = require("../services/session.service")
const { verifyToken } = require("../utils/jwt")

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: "Token de autenticación no enviado.",
      })
    }

    const [scheme, token] = authHeader.split(" ")

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({
        message: "Formato de token inválido. Use Bearer token.",
      })
    }

    const decoded = verifyToken(token)

    if (!decoded.id_sesion) {
      return res.status(401).json({
        message: "Token sin sesión asociada.",
      })
    }

    const activeSession = await getActiveSessionById(
      decoded.id_sesion,
      decoded.id_usuario,
    )

    if (!activeSession) {
      return res.status(401).json({
        message: "Sesión inválida, expirada o cerrada.",
      })
    }

    req.user = decoded
    req.session = activeSession

    next()
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido o expirado.",
    })
  }
}

module.exports = {
  authenticateToken,
}