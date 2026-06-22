// backend/src/services/audit.service.js

const { pool } = require("../config/database")

const AUTH_AUDIT_EVENTS = {
  LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
  LOGIN_FAILED: "AUTH_LOGIN_FAILED",
  REFRESH_SUCCESS: "AUTH_REFRESH_SUCCESS",
  REFRESH_FAILED: "AUTH_REFRESH_FAILED",
  LOGOUT: "AUTH_LOGOUT",
  SESSION_REVOKED: "AUTH_SESSION_REVOKED",
  SESSION_IDLE_TIMEOUT: "AUTH_SESSION_IDLE_TIMEOUT",
}

const AUTH_AUDIT_TABLES = {
  AUTH: "auth",
  USER_SESSION: "sesion_usuario",
}

function normalizeJsonPayload(payload) {
  if (payload === undefined || payload === null) {
    return null
  }

  return JSON.stringify(payload)
}

function buildSafeErrorMetadata(error) {
  return {
    status_code: error.statusCode || 500,
    reason:
      error.statusCode && error.message
        ? error.message
        : "Error interno durante el flujo de autenticación.",
  }
}

async function registerAuditEvent({
  id_usuario = null,
  id_establecimiento = null,
  tabla_afectada = AUTH_AUDIT_TABLES.AUTH,
  registro_id = null,
  accion,
  datos_anteriores = null,
  datos_nuevos = null,
  ip_origen = null,
  user_agent = null,
}) {
  if (!accion) {
    const error = new Error("La acción de auditoría es obligatoria.")
    error.statusCode = 400
    throw error
  }

  const query = `
    insert into auditoria (
      id_usuario,
      id_establecimiento,
      tabla_afectada,
      registro_id,
      accion,
      datos_anteriores,
      datos_nuevos,
      ip_origen,
      user_agent,
      created_at
    )
    values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8, $9, now())
    returning
      id_auditoria,
      id_usuario,
      id_establecimiento,
      tabla_afectada,
      registro_id,
      accion,
      created_at;
  `

  const values = [
    id_usuario,
    id_establecimiento,
    tabla_afectada,
    registro_id,
    accion,
    normalizeJsonPayload(datos_anteriores),
    normalizeJsonPayload(datos_nuevos),
    ip_origen,
    user_agent,
  ]

  const { rows } = await pool.query(query, values)

  return rows[0]
}

async function safeRegisterAuditEvent(payload) {
  try {
    return await registerAuditEvent(payload)
  } catch (error) {
    console.error("Audit event registration failed:", error.message)
    return null
  }
}

module.exports = {
  AUTH_AUDIT_EVENTS,
  AUTH_AUDIT_TABLES,
  buildSafeErrorMetadata,
  registerAuditEvent,
  safeRegisterAuditEvent,
}