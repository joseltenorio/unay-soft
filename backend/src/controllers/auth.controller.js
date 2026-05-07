// backend/src/controllers/auth.controller.js

const { loginUser } = require("../services/auth.service")
const { getUserPermissions } = require("../services/permission.service")

async function login(req, res) {
  try {
    const { identifier, password } = req.body

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Debe ingresar usuario/correo y contraseña.",
      })
    }

    const result = await loginUser(identifier, password)

    return res.status(200).json({
      message: "Login exitoso.",
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error interno del servidor.",
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
  me,
}