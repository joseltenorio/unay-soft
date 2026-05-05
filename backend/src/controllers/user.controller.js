// backend/src/controllers/user.controller.js

const { getUsers } = require("../services/user.service")

async function listUsers(req, res) {
  try {
    const users = await getUsers()

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

module.exports = {
  listUsers,
}