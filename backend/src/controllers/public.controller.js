// backend/src/controllers/public.controller.js

const QRCode = require("qrcode")

const {
  getCartaPublica,
  getOrCreateQR,
  saveQRImagen,
} = require("../services/public.service")

async function cartaPublica(req, res) {
  try {
    const { id_establecimiento } = req.params

    if (!id_establecimiento) {
      return res.status(400).json({
        message: "El establecimiento es requerido.",
      })
    }

    const data = await getCartaPublica(id_establecimiento)

    return res.status(200).json(data)
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener la carta.",
    })
  }
}

async function generarQR(req, res) {
  try {
    const idEstablecimiento = req.user.id_establecimiento
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173"

    if (!idEstablecimiento) {
      return res.status(400).json({
        message: "No se pudo identificar el establecimiento del usuario.",
      })
    }

    let qr = await getOrCreateQR(idEstablecimiento, baseUrl)

    if (!qr.imagen_qr) {
      const imagenBase64 = await QRCode.toDataURL(qr.url_destino, {
        width: 400,
        margin: 2,
        color: {
          dark: "#1a1a1a",
          light: "#ffffff",
        },
      })

      qr = await saveQRImagen(qr.id_codigo_qr, imagenBase64)
    }

    return res.status(200).json({
      message: "QR obtenido correctamente.",
      qr: {
        id_codigo_qr: qr.id_codigo_qr,
        url_destino: qr.url_destino,
        imagen_qr: qr.imagen_qr,
      },
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al generar el QR.",
    })
  }
}

module.exports = {
  cartaPublica,
  generarQR,
}