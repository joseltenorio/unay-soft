// backend/src/controllers/public.controller.js
const { getCartaPublica} = require("../services/public.service")

// HU18 — CA1: sin login, endpoint público
async function cartaPublica(req, res) {
  try {
    const { id_establecimiento } = req.params

    if (!id_establecimiento) {
      return res.status(400).json({ message: "id_establecimiento es requerido." })
    }

    const data = await getCartaPublica(id_establecimiento)
    return res.status(200).json(data)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener la carta.",
    })
  }
}

module.exports = { cartaPublica}