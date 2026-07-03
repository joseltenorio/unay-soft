// backend/src/middlewares/rateLimit.middleware.js

const { ipKeyGenerator, rateLimit } = require("express-rate-limit")

const { authConfig } = require("../config/auth")

const loginRateLimiter = rateLimit({
  windowMs: authConfig.loginWindowMinutes * 60 * 1000,
  limit: authConfig.loginMaxAttempts,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Se superó el número de intentos permitidos. Intente nuevamente más tarde.",
  },
  keyGenerator: (req) => {
    const identifier = req.body?.identifier
      ? req.body.identifier.toString().trim().toLowerCase()
      : "unknown"

    return `${ipKeyGenerator(req.ip)}:${identifier}`
  },
})


const publicCartaRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Demasiadas solicitudes. Intenta de nuevo en un momento.",
  },
})

module.exports = {
  loginRateLimiter,
  publicCartaRateLimiter,
}