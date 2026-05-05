// backend/src/middlewares/auth.middleware.js

const { verifyToken } = require("../utils/jwt")

function authenticateToken(req, res, next) {
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

    req.user = decoded

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