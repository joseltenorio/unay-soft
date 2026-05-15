// backend/src/controllers/establishment.controller.js

const {
  getEstablishmentById,
  updateEstablishment,
} = require("../services/establishment.service")

async function getEstablishment(req, res) {
  try {
    const establishment = await getEstablishmentById(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Establecimiento obtenido correctamente.",
      establishment,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener el establecimiento.",
    })
  }
}

async function editEstablishment(req, res) {
  try {
    const {
      nombre_comercial,
      razon_social,
      ruc,
      direccion,
      telefono,
      email,
      logo_url,
      igv_porcentaje,
      moneda_codigo,
      moneda_simbolo,
    } = req.body

    if (!nombre_comercial || !razon_social || !ruc || !direccion) {
      return res.status(400).json({
        message:
          "Debe ingresar nombre comercial, razón social, RUC y dirección.",
      })
    }

    if (!/^\d{11}$/.test(String(ruc).trim())) {
      return res.status(400).json({
        message: "El RUC debe contener 11 dígitos.",
      })
    }

    if (
      igv_porcentaje === undefined ||
      igv_porcentaje === null ||
      Number.isNaN(Number(igv_porcentaje))
    ) {
      return res.status(400).json({
        message: "Debe ingresar un porcentaje de IGV válido.",
      })
    }

    if (Number(igv_porcentaje) < 0 || Number(igv_porcentaje) > 100) {
      return res.status(400).json({
        message: "El porcentaje de IGV debe estar entre 0 y 100.",
      })
    }

    const updatedEstablishment = await updateEstablishment(
      req.user.id_establecimiento,
      {
        nombre_comercial,
        razon_social,
        ruc,
        direccion,
        telefono,
        email,
        logo_url,
        igv_porcentaje,
        moneda_codigo,
        moneda_simbolo,
      },
    )

    return res.status(200).json({
      message: "Establecimiento actualizado correctamente.",
      establishment: updatedEstablishment,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al actualizar el establecimiento.",
    })
  }
}

module.exports = {
  getEstablishment,
  editEstablishment,
}