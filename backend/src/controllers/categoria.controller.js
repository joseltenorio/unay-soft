// backend/src/controllers/categoria.controller.js

const {
  getCategorias,
  createCategoria,
  updateCategoria,
  updateCategoriaStatus,
  deleteCategoria,
} = require("../services/categoria.service")

async function listCategorias(req, res) {
  try {
    const categorias = await getCategorias(req.user.id_establecimiento)
    return res.status(200).json({
      message: "Categorías obtenidas correctamente.",
      total: categorias.length,
      categorias,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener categorías.",
      error: error.message,
    })
  }
}

async function registerCategoria(req, res) {
  try {
    const { nombre, descripcion, orden_display } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio." })
    }

    const nueva = await createCategoria(req.user.id_establecimiento, {
      nombre,
      descripcion,
      orden_display,
    })

    return res.status(201).json({
      message: "Categoría creada correctamente.",
      categoria: nueva,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al crear la categoría.",
    })
  }
}

async function editCategoria(req, res) {
  try {
    const { id } = req.params
    const { nombre, descripcion, orden_display, estado } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio." })
    }

    const actualizada = await updateCategoria(req.user.id_establecimiento, id, {
      nombre,
      descripcion,
      orden_display,
      estado,
    })

    return res.status(200).json({
      message: "Categoría actualizada correctamente.",
      categoria: actualizada,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar la categoría.",
    })
  }
}

async function removeCategoria(req, res) {
  try {
    const { id } = req.params
    const categoria = await deleteCategoria(req.user.id_establecimiento, id)
    return res.status(200).json({
      message: "Categoría eliminada correctamente.",
      categoria,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al eliminar categoría.",
    })
  }
}

async function changeCategoriaStatus(req, res) {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (typeof estado !== "boolean") {
      return res.status(400).json({ message: "El estado debe ser true o false." })
    }

    const actualizada = await updateCategoriaStatus(req.user.id_establecimiento, id, estado)

    return res.status(200).json({
      message: `Categoría ${estado ? "activada" : "desactivada"} correctamente.`,
      categoria: actualizada,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al cambiar el estado de la categoría.",
    })
  }
}

module.exports = {
  listCategorias,
  registerCategoria,
  editCategoria,
  changeCategoriaStatus,
  removeCategoria,
}