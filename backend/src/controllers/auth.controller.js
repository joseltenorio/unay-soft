// backend/src/controllers/auth.controller.js

const {
  loginUser,
  logoutUserSession,
  refreshUserSession,
} = require("../services/auth.service")
const {
  AUTH_AUDIT_EVENTS,
  AUTH_AUDIT_TABLES,
  buildSafeErrorMetadata,
  safeRegisterAuditEvent,
} = require("../services/audit.service")
const { getRequestMetadata } = require("../services/session.service")
const { getUserPermissions } = require("../services/permission.service")

async function login(req, res) {
  const metadata = getRequestMetadata(req)

  try {
    const { identifier, password, remember } = req.body

    const result = await loginUser(identifier, password, {
      remember,
      ...metadata,
    })

    await safeRegisterAuditEvent({
      id_usuario: result.user.id_usuario,
      id_establecimiento: result.user.id_establecimiento,
      tabla_afectada: AUTH_AUDIT_TABLES.USER_SESSION,
      registro_id: result.session?.id_sesion || null,
      accion: AUTH_AUDIT_EVENTS.LOGIN_SUCCESS,
      datos_nuevos: {
        remember: Boolean(remember),
        session_mode: "single_establishment",
        expira_at: result.session?.expira_at || null,
      },
      ip_origen: metadata.ip_origen,
      user_agent: metadata.user_agent,
    })

    return res.status(200).json({
      message: "Login exitoso.",
      token: result.token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      permissions: result.permissions,
      modules: result.modules,
      session: result.session,
    })
  } catch (error) {
    await safeRegisterAuditEvent({
      tabla_afectada: AUTH_AUDIT_TABLES.AUTH,
      accion: AUTH_AUDIT_EVENTS.LOGIN_FAILED,
      datos_nuevos: {
        identifier_present: Boolean(req.body?.identifier),
        ...buildSafeErrorMetadata(error),
      },
      ip_origen: metadata.ip_origen,
      user_agent: metadata.user_agent,
    })

    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor.",
    })
  }
}

async function refresh(req, res) {
  const metadata = getRequestMetadata(req)

  try {
    const { refreshToken } = req.body

    const result = await refreshUserSession(refreshToken)

    await safeRegisterAuditEvent({
      id_usuario: result.user.id_usuario,
      id_establecimiento: result.user.id_establecimiento,
      tabla_afectada: AUTH_AUDIT_TABLES.USER_SESSION,
      registro_id: result.session?.id_sesion || null,
      accion: AUTH_AUDIT_EVENTS.REFRESH_SUCCESS,
      datos_nuevos: {
        rotated: true,
        session_mode: "single_establishment",
        expira_at: result.session?.expira_at || null,
      },
      ip_origen: metadata.ip_origen,
      user_agent: metadata.user_agent,
    })

    return res.status(200).json({
      message: "Sesión renovada correctamente.",
      token: result.token,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
      permissions: result.permissions,
      modules: result.modules,
      session: result.session,
    })
  } catch (error) {
    await safeRegisterAuditEvent({
      tabla_afectada: AUTH_AUDIT_TABLES.USER_SESSION,
      accion: AUTH_AUDIT_EVENTS.REFRESH_FAILED,
      datos_nuevos: {
        refresh_token_present: Boolean(req.body?.refreshToken),
        ...buildSafeErrorMetadata(error),
      },
      ip_origen: metadata.ip_origen,
      user_agent: metadata.user_agent,
    })

    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al renovar la sesión.",
    })
  }
}

async function logout(req, res) {
  const metadata = getRequestMetadata(req)

  try {
    const result = await logoutUserSession({
      id_sesion: req.user.id_sesion,
      id_usuario: req.user.id_usuario,
    })

    await safeRegisterAuditEvent({
      id_usuario: req.user.id_usuario,
      id_establecimiento: req.user.id_establecimiento,
      tabla_afectada: AUTH_AUDIT_TABLES.USER_SESSION,
      registro_id: req.user.id_sesion,
      accion: AUTH_AUDIT_EVENTS.LOGOUT,
      datos_nuevos: {
        revoked: result.revoked,
        session_mode: req.user.session_mode || "single_establishment",
      },
      ip_origen: metadata.ip_origen,
      user_agent: metadata.user_agent,
    })

    return res.status(200).json({
      message: result.revoked
        ? "Sesión cerrada correctamente."
        : "La sesión ya se encontraba cerrada o no estaba activa.",
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al cerrar la sesión.",
    })
  }
}

async function me(req, res) {
  try {
    const access = await getUserPermissions(req.user.id_usuario)

    return res.status(200).json({
      message: "Usuario autenticado correctamente.",
      user: req.user,
      permissions: access.permissions,
      modules: access.modules,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener la sesión del usuario.",
      error: error.message,
    })
  }
}

module.exports = {
  login,
  logout,
  me,
  refresh,
}