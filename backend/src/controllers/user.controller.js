// backend/src/controllers/user.controller.js

const {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} = require("../services/user.service")

async function listUsers(req, res) {
  try {
    const users = await getUsers(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Usuarios obtenidos correctamente.",
      total: users.length,
      users,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios.",
      error: error.message,
    })
  }
}

async function registerUser(req, res) {
  try {
    const createdUser = await createUser(
      req.user.id_establecimiento,
      req.body,
    )

    return res.status(201).json({
      message: "Usuario creado correctamente.",
      user: createdUser,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al crear usuario.",
    })
  }
}

async function editUser(req, res) {
  try {
    const { id } = req.params

    const updatedUser = await updateUser(
      req.user.id_establecimiento,
      id,
      req.body,
    )

    return res.status(200).json({
      message: "Usuario actualizado correctamente.",
      user: updatedUser,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar usuario.",
    })
  }
}

async function changeUserStatus(req, res) {
  try {
    const { id } = req.params
    const { estado } = req.body

    const updatedUser = await updateUserStatus(
      req.user.id_establecimiento,
      req.user.id_usuario,
      id,
      estado,
    )

    return res.status(200).json({
      message: estado
        ? "Usuario activado correctamente."
        : "Usuario desactivado correctamente.",
      user: updatedUser,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar estado del usuario.",
    })
  }
}

module.exports = {
  listUsers,
  registerUser,
  editUser,
  changeUserStatus,
}