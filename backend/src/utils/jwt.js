// backend/src/utils/jwt.js

const jwt = require("jsonwebtoken")
const { authConfig, assertAuthConfig } = require("../config/auth")

function generateAccessToken(payload) {
  assertAuthConfig()

  return jwt.sign(payload, authConfig.jwtSecret, {
    expiresIn: authConfig.accessTokenExpiresIn,
  })
}

function verifyToken(token) {
  assertAuthConfig()

  return jwt.verify(token, authConfig.jwtSecret)
}

// Compatibilidad temporal con el flujo actual.
// Despues, auth.service migrará a generateAccessToken.
function generateToken(payload) {
  return generateAccessToken(payload)
}

module.exports = {
  generateAccessToken,
  generateToken,
  verifyToken,
}