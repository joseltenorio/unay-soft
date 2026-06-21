// backend/src/controllers/auth.controller.js

const {
  loginUser,
  logoutUserSession,
  refreshUserSession,
} = require("../services/auth.service")
const { getRequestMetadata } = require("../services/session.service")
const { getUserPermissions } = require("../services/permission.service")

function parseRememberValue(value) {
  return value === true || value === "true"
}

async function login(req, res) {
  try {
    const { identifier, password, remember } = req.body

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Debe ingresar usuario/correo y contraseña.",
      })
    }

    const metadata = getRequestMetadata(req)

    const result = await loginUser(identifier, password, {
      remember: parseRememberValue(remember),
      ...metadata,
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
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor.",
    })
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body

    const result = await refreshUserSession(refreshToken)

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
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al renovar la sesión.",
    })
  }
}

async function logout(req, res) {
  try {
    const result = await logoutUserSession({
      id_sesion: req.user.id_sesion,
      id_usuario: req.user.id_usuario,
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