// backend/src/controllers/producto.controller.js

const {
  getProductos,
  createProducto,
  updateProducto,
  updateProductoStatus,
  deleteProducto,
  setProductoTags,
  updateProductoDisponibilidad,
  updateProductoImagen,
} = require("../services/producto.service")

async function listProductos(req, res) {
  try {
    const productos = await getProductos(req.user.id_establecimiento)
    return res.status(200).json({
      message: "Productos obtenidos correctamente.",
      total: productos.length,
      productos,
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener productos.",
      error: error.message,
    })
  }
}

async function registerProducto(req, res) {
  try {
    const { nombre, descripcion, precio_base, id_categoria, imagen_referencial, disponibilidad, estado } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre del producto es obligatorio." })
    }

    if (precio_base === undefined || precio_base === null || precio_base === "") {
      return res.status(400).json({ message: "El precio del producto es obligatorio." })
    }

    if (isNaN(Number(precio_base)) || Number(precio_base) < 0) {
      return res.status(400).json({ message: "El precio debe ser un número mayor o igual a 0." })
    }

    if (!id_categoria) {
      return res.status(400).json({ message: "La categoría del producto es obligatoria." })
    }

    const nuevo = await createProducto(req.user.id_establecimiento, {
      nombre,
      descripcion,
      precio_base,
      id_categoria,
      imagen_referencial,
      disponibilidad,
      estado,
    })

    return res.status(201).json({
      message: "Producto creado correctamente.",
      producto: nuevo,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al crear el producto.",
    })
  }
}

async function editProducto(req, res) {
  try {
    const { id } = req.params
    const { nombre, descripcion, precio_base, id_categoria, imagen_referencial, disponibilidad, estado } = req.body

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: "El nombre del producto es obligatorio." })
    }

    if (precio_base === undefined || precio_base === null || precio_base === "") {
      return res.status(400).json({ message: "El precio del producto es obligatorio." })
    }

    if (isNaN(Number(precio_base)) || Number(precio_base) < 0) {
      return res.status(400).json({ message: "El precio debe ser un número mayor o igual a 0." })
    }

    if (!id_categoria) {
      return res.status(400).json({ message: "La categoría del producto es obligatoria." })
    }

    const actualizado = await updateProducto(req.user.id_establecimiento, id, {
      nombre,
      descripcion,
      precio_base,
      id_categoria,
      imagen_referencial,
      disponibilidad,
      estado,
    })

    return res.status(200).json({
      message: "Producto actualizado correctamente.",
      producto: actualizado,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar el producto.",
    })
  }
}

async function removeProducto(req, res) {
  try {
    const { id } = req.params
    const producto = await deleteProducto(req.user.id_establecimiento, id)
    return res.status(200).json({
      message: "Producto eliminado correctamente.",
      producto,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al eliminar producto.",
    })
  }
}

async function changeProductoStatus(req, res) {
  try {
    const { id } = req.params
    const { estado } = req.body

    if (typeof estado !== "boolean") {
      return res.status(400).json({ message: "El estado debe ser true o false." })
    }

    const actualizado = await updateProductoStatus(req.user.id_establecimiento, id, estado)

    return res.status(200).json({
      message: `Producto ${estado ? "activado" : "desactivado"} correctamente.`,
      producto: actualizado,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al cambiar el estado del producto.",
    })
  }
}

async function changeProductoDisponibilidad(req, res) {
  try {
    const { id } = req.params
    const { disponibilidad } = req.body

    if (typeof disponibilidad !== "boolean") {
      return res.status(400).json({
        message: "Debe enviar disponibilidad como true o false.",
      })
    }

    const producto = await updateProductoDisponibilidad(
      req.user.id_establecimiento, id, disponibilidad
    )

    return res.status(200).json({
      message: disponibilidad
        ? "Producto marcado como disponible."
        : "Producto marcado como agotado.",
      producto,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar disponibilidad.",
    })
  }
}

async function assignTags(req, res) {
  try {
    const { id } = req.params
    const { tag_ids } = req.body

    if (!Array.isArray(tag_ids)) {
      return res.status(400).json({
        message: "Debe enviar un arreglo de IDs de etiquetas.",
      })
    }

    await setProductoTags(req.user.id_establecimiento, id, tag_ids)

    return res.status(200).json({
      message: "Etiquetas asignadas correctamente.",
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al asignar etiquetas.",
    })
  }
}

async function uploadProductoImagen(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se envió ningún archivo." })
    }

    const { createClient } = require("@supabase/supabase-js")
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const idEstablecimiento = req.user.id_establecimiento
    const idProducto = req.params.id
    const extension = req.file.originalname.split(".").pop()
    const filePath = `${idEstablecimiento}/${idProducto}.${extension}`

    const { error: uploadError } = await supabase.storage
      .from("Producto_img")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      })

    if (uploadError) {
      console.error("Supabase error:", uploadError)
      return res.status(500).json({ message: "Error al subir la imagen a Supabase." })
    }

    const { data: urlData } = supabase.storage
      .from("Producto_img")
      .getPublicUrl(filePath)
    const publicUrl = urlData.publicUrl + `?t=${Date.now()}`
    const updated = await updateProductoImagen(idEstablecimiento, idProducto, publicUrl)
    return res.status(200).json({
      message: "Imagen del producto actualizada correctamente.",
      producto: updated,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al subir la imagen.",
    })
  }
}

module.exports = {
  listProductos,
  registerProducto,
  editProducto,
  changeProductoStatus,
  removeProducto,
  assignTags,
  changeProductoDisponibilidad,
  uploadProductoImagen
}