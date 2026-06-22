// backend/src/middlewares/auth.middleware.js

const {
  getActiveSessionById,
  getRequestMetadata,
  isSessionIdleExpired,
  resolveIdleTimeoutMinutes,
  revokeUserSession,
  touchUserSession,
} = require("../services/session.service")
const {
  AUTH_AUDIT_EVENTS,
  AUTH_AUDIT_TABLES,
  safeRegisterAuditEvent,
} = require("../services/audit.service")
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

    const idleTimeoutMinutes = resolveIdleTimeoutMinutes(decoded)
    const idleExpired = isSessionIdleExpired(activeSession, idleTimeoutMinutes)

    if (idleExpired) {
      const metadata = getRequestMetadata(req)

      await revokeUserSession(decoded.id_sesion, decoded.id_usuario)

      await safeRegisterAuditEvent({
        id_usuario: decoded.id_usuario,
        id_establecimiento: decoded.id_establecimiento,
        tabla_afectada: AUTH_AUDIT_TABLES.USER_SESSION,
        registro_id: decoded.id_sesion,
        accion: AUTH_AUDIT_EVENTS.SESSION_IDLE_TIMEOUT,
        datos_nuevos: {
          last_seen_at: activeSession.last_seen_at,
          idle_timeout_minutes: idleTimeoutMinutes,
          session_mode: decoded.session_mode || "single_establishment",
        },
        ip_origen: metadata.ip_origen,
        user_agent: metadata.user_agent,
      })

      return res.status(401).json({
        message: "Sesión cerrada por inactividad.",
      })
    }

    const touchedSession = await touchUserSession(
      decoded.id_sesion,
      decoded.id_usuario,
    )

    if (!touchedSession) {
      return res.status(401).json({
        message: "Sesión inválida, expirada o cerrada.",
      })
    }

    req.user = decoded
    req.session = touchedSession

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