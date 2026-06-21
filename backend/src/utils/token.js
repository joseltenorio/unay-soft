// backend/src/utils/token.js

const crypto = require("crypto")
const { authConfig } = require("../config/auth")

function generateOpaqueToken() {
  return crypto.randomBytes(authConfig.refreshTokenBytes).toString("hex")
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex")
}

function getRefreshTokenExpirationDate({ remember = false } = {}) {
  const days = remember
    ? authConfig.rememberRefreshTokenExpiresInDays
    : authConfig.refreshTokenExpiresInDays

  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + days)

  return expirationDate
}

function getIdleTimeoutMinutesByRole(roleName = "") {
  const normalizedRole = roleName.trim().toLowerCase()

  if (normalizedRole.includes("cajero")) {
    return authConfig.cashierIdleTimeoutMinutes
  }

  if (
    normalizedRole.includes("cocina") ||
    normalizedRole.includes("kds")
  ) {
    return authConfig.kdsIdleTimeoutMinutes
  }

  return authConfig.idleTimeoutMinutes
}

module.exports = {
  generateOpaqueToken,
  hashToken,
  getRefreshTokenExpirationDate,
  getIdleTimeoutMinutesByRole,
}