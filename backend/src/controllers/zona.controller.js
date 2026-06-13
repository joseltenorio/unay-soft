// backend/src/controllers/zona.controller.js

const {
  getZonas,
  createZona,
  updateZona,
  updateZonaStatus,
  deleteZona,
} = require("../services/zona.service")

async function listZonas(req, res) {
  try {
    const zonas = await getZonas(req.user.id_establecimiento)
    return res.status(200).json({
      message: "Zonas obtenidas correctamente.",
      total: zonas.length,
      zonas,
    })
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener zonas.", error: error.message })
  }
}

async function registerZona(req, res) {
  try {
    const { nombre, descripcion, capacidad, estado } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre de la zona es obligatorio." })
    }
    if (capacidad !== undefined && capacidad !== null && (isNaN(Number(capacidad)) || Number(capacidad) < 0)) {
      return res.status(400).json({ message: "La capacidad debe ser un número mayor o igual a 0." })
    }

    const zona = await createZona(req.user.id_establecimiento, { nombre, descripcion, capacidad, estado })
    return res.status(201).json({ message: "Zona creada correctamente.", zona })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al crear la zona." })
  }
}

async function editZona(req, res) {
  try {
    const { id } = req.params
    const { nombre, descripcion, capacidad, estado } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre de la zona es obligatorio." })
    }
    if (capacidad !== undefined && capacidad !== null && (isNaN(Number(capacidad)) || Number(capacidad) < 0)) {
      return res.status(400).json({ message: "La capacidad debe ser un número mayor o igual a 0." })
    }

    const zona = await updateZona(req.user.id_establecimiento, id, { nombre, descripcion, capacidad, estado })
    return res.status(200).json({ message: "Zona actualizada correctamente.", zona })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al actualizar la zona." })
  }
}

async function changeZonaStatus(req, res) {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (typeof estado !== "boolean") {
      return res.status(400).json({ message: "El estado debe ser true o false." })
    }

    const zona = await updateZonaStatus(req.user.id_establecimiento, id, estado)
    return res.status(200).json({
      message: `Zona ${estado ? "activada" : "desactivada"} correctamente.`,
      zona,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al cambiar el estado de la zona." })
  }
}

async function removeZona(req, res) {
  try {
    const { id } = req.params
    const zona = await deleteZona(req.user.id_establecimiento, id)
    return res.status(200).json({ message: "Zona eliminada correctamente.", zona })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al eliminar la zona." })
  }
}

module.exports = {
  listZonas,
  registerZona,
  editZona,
  changeZonaStatus,
  removeZona,
}