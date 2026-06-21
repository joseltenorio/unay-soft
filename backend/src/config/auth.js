// backend/src/config/auth.js

require("dotenv").config()

function readIntegerEnv(name, defaultValue) {
  const rawValue = process.env[name]

  if (!rawValue) {
    return defaultValue
  }

  const parsedValue = Number.parseInt(rawValue, 10)

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return defaultValue
  }

  return parsedValue
}

const authConfig = {
  jwtSecret: process.env.JWT_SECRET,
  accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",

  refreshTokenExpiresInDays: readIntegerEnv("JWT_REFRESH_EXPIRES_IN_DAYS", 1),
  rememberRefreshTokenExpiresInDays: readIntegerEnv(
    "JWT_REMEMBER_REFRESH_EXPIRES_IN_DAYS",
    7,
  ),

  loginWindowMinutes: readIntegerEnv("AUTH_LOGIN_WINDOW_MINUTES", 15),
  loginMaxAttempts: readIntegerEnv("AUTH_LOGIN_MAX_ATTEMPTS", 5),

  idleTimeoutMinutes: readIntegerEnv("AUTH_IDLE_TIMEOUT_MINUTES", 30),
  cashierIdleTimeoutMinutes: readIntegerEnv(
    "AUTH_CASHIER_IDLE_TIMEOUT_MINUTES",
    15,
  ),
  kdsIdleTimeoutMinutes: readIntegerEnv("AUTH_KDS_IDLE_TIMEOUT_MINUTES", 60),

  sessionMode: process.env.AUTH_SESSION_MODE || "single_establishment",
  refreshTokenBytes: readIntegerEnv("AUTH_REFRESH_TOKEN_BYTES", 64),
}

function assertAuthConfig() {
  if (!authConfig.jwtSecret) {
    throw new Error("JWT_SECRET no está configurado.")
  }

  if (authConfig.jwtSecret === "change_this_secret_key") {
    console.warn(
      "Advertencia: JWT_SECRET usa el valor por defecto. Cámbialo en producción.",
    )
  }
}

module.exports = {
  authConfig,
  assertAuthConfig,
}