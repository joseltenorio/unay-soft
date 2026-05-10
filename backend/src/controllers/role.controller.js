// backend/src/controllers/role.controller.js

const { getRoles } = require("../services/role.service")

async function listRoles(req, res) {
  try {
    const roles = await getRoles(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Roles obtenidos correctamente.",
      total: roles.length,
      roles,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener roles.",
      error: error.message,
    })
  }
}

module.exports = {
  listRoles,
}