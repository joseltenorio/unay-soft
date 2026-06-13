// backend/src/controllers/mesa.controller.js

const {
  getMesas,
  createMesa,
  updateMesa,
  updateMesaDisponibilidad,
  updateMesaStatus,
  deleteMesa,
} = require("../services/mesa.service")

async function listMesas(req, res) {
  try {
    const mesas = await getMesas(req.user.id_establecimiento)
    return res.status(200).json({
      message: "Mesas obtenidas correctamente.",
      total: mesas.length,
      mesas,
    })
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener mesas.", error: error.message })
  }
}

async function registerMesa(req, res) {
  try {
    const { numero, nombre, capacidad, id_zona, disponibilidad, estado } = req.body

    if (numero === undefined || numero === null || numero === "") {
      return res.status(400).json({ message: "El número de mesa es obligatorio." })
    }
    if (isNaN(Number(numero)) || Number(numero) <= 0) {
      return res.status(400).json({ message: "El número de mesa debe ser un entero positivo." })
    }
    if (capacidad !== undefined && (isNaN(Number(capacidad)) || Number(capacidad) <= 0)) {
      return res.status(400).json({ message: "La capacidad debe ser un número mayor a 0." })
    }

    const mesa = await createMesa(req.user.id_establecimiento, { numero, nombre, capacidad, id_zona, disponibilidad, estado })
    return res.status(201).json({ message: "Mesa creada correctamente.", mesa })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al crear la mesa." })
  }
}

async function editMesa(req, res) {
  try {
    const { id } = req.params
    const { numero, nombre, capacidad, id_zona, estado } = req.body

    if (numero === undefined || numero === null || numero === "") {
      return res.status(400).json({ message: "El número de mesa es obligatorio." })
    }
    if (isNaN(Number(numero)) || Number(numero) <= 0) {
      return res.status(400).json({ message: "El número de mesa debe ser un entero positivo." })
    }
    if (capacidad !== undefined && (isNaN(Number(capacidad)) || Number(capacidad) <= 0)) {
      return res.status(400).json({ message: "La capacidad debe ser un número mayor a 0." })
    }

    const mesa = await updateMesa(req.user.id_establecimiento, id, { numero, nombre, capacidad, id_zona, estado })
    return res.status(200).json({ message: "Mesa actualizada correctamente.", mesa })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al actualizar la mesa." })
  }
}

async function changeMesaDisponibilidad(req, res) {
  try {
    const { id } = req.params
    const { disponibilidad } = req.body

    if (!disponibilidad) {
      return res.status(400).json({ message: "La disponibilidad es obligatoria." })
    }

    const mesa = await updateMesaDisponibilidad(req.user.id_establecimiento, id, disponibilidad)
    return res.status(200).json({ message: "Disponibilidad de mesa actualizada correctamente.", mesa })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al actualizar disponibilidad." })
  }
}

async function changeMesaStatus(req, res) {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (typeof estado !== "boolean") {
      return res.status(400).json({ message: "El estado debe ser true o false." })
    }

    const mesa = await updateMesaStatus(req.user.id_establecimiento, id, estado)
    return res.status(200).json({
      message: `Mesa ${estado ? "activada" : "desactivada"} correctamente.`,
      mesa,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al cambiar el estado de la mesa." })
  }
}

async function removeMesa(req, res) {
  try {
    const { id } = req.params
    const mesa = await deleteMesa(req.user.id_establecimiento, id)
    return res.status(200).json({ message: "Mesa eliminada correctamente.", mesa })
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message || "Error al eliminar la mesa." })
  }
}

module.exports = {
  listMesas,
  registerMesa,
  editMesa,
  changeMesaDisponibilidad,
  changeMesaStatus,
  removeMesa,
}