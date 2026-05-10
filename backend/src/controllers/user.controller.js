// backend/src/controllers/user.controller.js

const {
  createUser,
  getUsers,
  updateUser,
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
    const {
      nombres,
      apellidos,
      email,
      username,
      password,
      celular,
      id_rol,
      estado,
    } = req.body

    if (!nombres || !apellidos || !email || !username || !password || !id_rol) {
      return res.status(400).json({
        message:
          "Debe ingresar nombres, apellidos, correo, usuario, contraseña y rol.",
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener al menos 6 caracteres.",
      })
    }

    const createdUser = await createUser(req.user.id_establecimiento, {
      nombres,
      apellidos,
      email,
      username,
      password,
      celular,
      id_rol,
      estado,
    })

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

    const {
      nombres,
      apellidos,
      email,
      username,
      celular,
      id_rol,
      estado,
    } = req.body

    if (!nombres || !apellidos || !email || !username || !id_rol) {
      return res.status(400).json({
        message: "Debe ingresar nombres, apellidos, correo, usuario y rol.",
      })
    }

    const updatedUser = await updateUser(req.user.id_establecimiento, id, {
      nombres,
      apellidos,
      email,
      username,
      celular,
      id_rol,
      estado,
    })

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

module.exports = {
  listUsers,
  registerUser,
  editUser,
}