// backend/src/controllers/cashier.controller.js

const {
  getCajasDisponibles,
  getAperturaActivaPorUsuario,
  abrirCaja,
  getMetodosPagoDisponibles,
  getCuentasPorCobrar,
  registrarPago,
  getResumenTurno,
  cerrarCaja,
} = require("../services/cashier.service")

async function listCajasDisponibles(req, res) {
  try {
    const cajas = await getCajasDisponibles(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Cajas disponibles obtenidas correctamente.",
      total: cajas.length,
      cajas,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener cajas disponibles.",
    })
  }
}

async function getAperturaActiva(req, res) {
  try {
    const apertura = await getAperturaActivaPorUsuario(
      req.user.id_usuario,
      req.user.id_establecimiento,
    )

    return res.status(200).json({
      message: apertura
        ? "Turno activo encontrado."
        : "No hay turno activo para este usuario.",
      apertura,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener el turno activo.",
    })
  }
}

async function openCaja(req, res) {
  try {
    const { id_caja, monto_inicial, observaciones } = req.body

    if (!id_caja) {
      return res.status(400).json({
        message: "Debe seleccionar una caja para abrir el turno.",
      })
    }

    if (monto_inicial === undefined || monto_inicial === null) {
      return res.status(400).json({
        message: "Debe indicar el monto inicial de apertura.",
      })
    }

    const apertura = await abrirCaja({
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      idCaja: id_caja,
      montoInicial: monto_inicial,
      observaciones,
    })

    return res.status(201).json({
      message: "Turno de caja abierto correctamente.",
      apertura,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al abrir el turno de caja.",
    })
  }
}

async function getResumen(req, res) {
  try {
    const { id_apertura } = req.params

    if (!id_apertura) {
      return res.status(400).json({
        message: "Debe indicar el turno de caja a consultar.",
      })
    }

    const resumen = await getResumenTurno(id_apertura, req.user.id_establecimiento)

    return res.status(200).json({
      message: "Resumen del turno obtenido correctamente.",
      resumen,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener el resumen del turno.",
    })
  }
}

async function closeCaja(req, res) {
  try {
    const { id_apertura } = req.params
    const { total_declarado, observaciones } = req.body

    if (!id_apertura) {
      return res.status(400).json({
        message: "Debe indicar el turno de caja a cerrar.",
      })
    }

    if (total_declarado === undefined || total_declarado === null) {
      return res.status(400).json({
        message: "Debe indicar el total declarado en efectivo.",
      })
    }

    const cierre = await cerrarCaja({
      idApertura: id_apertura,
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      totalDeclarado: total_declarado,
      observaciones,
    })

    return res.status(201).json({
      message: "Turno de caja cerrado correctamente.",
      cierre,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al cerrar el turno de caja.",
    })
  }
}

async function listCuentasPorCobrar(req, res) {
  try {
    const cuentas = await getCuentasPorCobrar(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Cuentas por cobrar obtenidas correctamente.",
      total: cuentas.length,
      cuentas,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener las cuentas por cobrar.",
    })
  }
}

async function registrarPagoHandler(req, res) {
  try {
    const {
      id_apertura,
      id_ordenes,
      id_metodo_pago,
      tipo_comprobante,
      referencia,
      datos_factura,
    } = req.body

    if (!id_apertura) {
      return res.status(400).json({
        message: "Debe indicar el turno de caja activo.",
      })
    }

    if (!Array.isArray(id_ordenes) || id_ordenes.length === 0) {
      return res.status(400).json({
        message: "Debe indicar al menos una orden a cobrar.",
      })
    }

    if (!id_metodo_pago) {
      return res.status(400).json({
        message: "Debe indicar el método de pago.",
      })
    }

    if (!tipo_comprobante) {
      return res.status(400).json({
        message: "Debe indicar el tipo de comprobante (BOL o FAC).",
      })
    }

    const resultado = await registrarPago({
      idEstablecimiento: req.user.id_establecimiento,
      idUsuario: req.user.id_usuario,
      idApertura: id_apertura,
      idOrdenes: id_ordenes,
      idMetodoPago: id_metodo_pago,
      tipoComprobante: tipo_comprobante,
      referencia,
      datosFactura: datos_factura,
    })

    return res.status(201).json({
      message: "Pago registrado correctamente.",
      resultado,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al registrar el pago.",
    })
  }
}

async function listMetodosPago(req, res) {
  try {
    const metodos = await getMetodosPagoDisponibles(req.user.id_establecimiento)

    return res.status(200).json({
      message: "Métodos de pago obtenidos correctamente.",
      total: metodos.length,
      metodos,
    })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || "Error al obtener métodos de pago.",
    })
  }
}

module.exports = {
  listCajasDisponibles,
  getAperturaActiva,
  openCaja,
  listMetodosPago,
  listCuentasPorCobrar,
  registrarPagoHandler,
  getResumen,
  closeCaja,
}