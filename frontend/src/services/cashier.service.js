// backend/src/services/cashier.service.js

const { pool } = require("../config/database")

function createHttpError(message, statusCode = 500) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

const SERIES_POR_TIPO = {
  BOL: "B001",
  FAC: "F001",
}

const ESTADO_ORDEN_COBRABLE = "ENVIADA_A_CAJA"

function padNumero(numero) {
  return String(numero).padStart(6, "0")
}

// ── Registrar pago (comprobante + pago, pago completo) ──────────────
// Reglas de negocio:
// - Solo se acepta pago completo (monto del pago = total de la orden).
// - Un solo método de pago por comprobante (no hay pagos divididos).
// - Solo se puede cobrar una orden en estado ENVIADA_A_CAJA.
// - tipo_comprobante: "BOL" (Boleta) o "FAC" (Factura). FAC requiere
//   numero_documento (RUC) y razon_social.
// - Al confirmar el pago, la orden pasa a estado 'PAGADA'.

async function registrarPago({
  idEstablecimiento,
  idUsuario,
  idApertura,
  idOrden,
  idMetodoPago,
  tipoComprobante,
  referencia,
  datosFactura,
}) {
  if (!idApertura) {
    throw createHttpError("Debe existir un turno de caja abierto para registrar el pago.", 400)
  }

  if (!idOrden) {
    throw createHttpError("Debe indicar la orden a cobrar.", 400)
  }

  if (!idMetodoPago) {
    throw createHttpError("Debe indicar el método de pago.", 400)
  }

  const tipo = String(tipoComprobante || "").toUpperCase()

  if (!SERIES_POR_TIPO[tipo]) {
    throw createHttpError("El tipo de comprobante debe ser BOL o FAC.", 400)
  }

  if (tipo === "FAC") {
    if (!datosFactura?.numero_documento || !datosFactura?.razon_social) {
      throw createHttpError(
        "Para emitir factura debe indicar RUC (numero_documento) y razón social.",
        400,
      )
    }
  }

  const client = await pool.connect()

  try {
    await client.query("begin")

    // Bloquea y valida la apertura de caja
    const { rows: aperturaRows } = await client.query(
      `
        select ac.id_apertura, ac.id_usuario, ac.estado, c.id_establecimiento
        from apertura_caja ac
        inner join caja c
          on c.id_caja = ac.id_caja
        where ac.id_apertura = $1
        for update of ac;
      `,
      [idApertura],
    )

    if (aperturaRows.length === 0 || aperturaRows[0].id_establecimiento !== idEstablecimiento) {
      throw createHttpError("El turno de caja no existe o no pertenece al establecimiento.", 404)
    }

    if (aperturaRows[0].estado !== "ABIERTA") {
      throw createHttpError("El turno de caja indicado no está abierto.", 409)
    }

    if (aperturaRows[0].id_usuario !== idUsuario) {
      throw createHttpError("Este turno de caja pertenece a otro usuario.", 403)
    }

    // Bloquea y valida la orden
    const { rows: ordenRows } = await client.query(
      `
        select id_orden, estado, subtotal, igv, total
        from orden
        where id_orden = $1
        for update;
      `,
      [idOrden],
    )

    if (ordenRows.length === 0) {
      throw createHttpError("La orden no existe.", 404)
    }

    const orden = ordenRows[0]

    if (orden.estado !== ESTADO_ORDEN_COBRABLE) {
      throw createHttpError(
        `Esta orden no está lista para cobrar (estado actual: ${orden.estado}). Debe estar ENVIADA_A_CAJA.`,
        409,
      )
    }

    if (Number(orden.total) <= 0) {
      throw createHttpError("La orden no tiene un total válido para cobrar.", 409)
    }

    // Verifica que el método de pago exista y pertenezca al establecimiento
    const { rows: metodoPagoRows } = await client.query(
      `
        select id_metodo_pago
        from metodo_pago
        where id_metodo_pago = $1
          and id_establecimiento = $2
          and estado = true;
      `,
      [idMetodoPago, idEstablecimiento],
    )

    if (metodoPagoRows.length === 0) {
      throw createHttpError("El método de pago no existe o está inactivo.", 404)
    }

    // Obtiene el tipo de comprobante (BOL/FAC)
    const { rows: tipoComprobanteRows } = await client.query(
      `
        select id_tipo_comprobante
        from tipo_comprobante
        where codigo = $1;
      `,
      [tipo],
    )

    if (tipoComprobanteRows.length === 0) {
      throw createHttpError("El tipo de comprobante configurado no existe.", 500)
    }

    const idTipoComprobante = tipoComprobanteRows[0].id_tipo_comprobante
    const serie = SERIES_POR_TIPO[tipo]

    // Serializa la generación de correlativo por serie (evita condición de carrera
    // incluso cuando aún no existe ninguna fila con esa serie)
    await client.query("select pg_advisory_xact_lock(hashtext($1));", [serie])

    const { rows: ultimoNumeroRows } = await client.query(
      `
        select numero
        from comprobante
        where serie = $1
        order by numero desc
        limit 1;
      `,
      [serie],
    )

    const siguienteNumero =
      ultimoNumeroRows.length > 0 ? Number(ultimoNumeroRows[0].numero) + 1 : 1

    const numero = padNumero(siguienteNumero)

    const { rows: comprobanteRows } = await client.query(
      `
        insert into comprobante (
          id_orden,
          id_apertura,
          id_tipo_comprobante,
          serie,
          numero,
          subtotal,
          igv,
          total,
          numero_documento,
          razon_social,
          direccion_fiscal
        )
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        returning
          id_comprobante,
          id_orden,
          id_apertura,
          id_tipo_comprobante,
          serie,
          numero,
          estado,
          subtotal,
          igv,
          total,
          numero_documento,
          razon_social,
          direccion_fiscal,
          fecha_emision;
      `,
      [
        idOrden,
        idApertura,
        idTipoComprobante,
        serie,
        numero,
        orden.subtotal,
        orden.igv,
        orden.total,
        datosFactura?.numero_documento || null,
        datosFactura?.razon_social || null,
        datosFactura?.direccion_fiscal || null,
      ],
    )

    const comprobante = comprobanteRows[0]

    const { rows: pagoRows } = await client.query(
      `
        insert into pago (
          id_comprobante,
          id_usuario,
          id_apertura,
          id_metodo_pago,
          monto,
          referencia,
          estado
        )
        values ($1, $2, $3, $4, $5, $6, 'CONFIRMADO')
        returning
          id_pago,
          id_comprobante,
          id_usuario,
          id_apertura,
          id_metodo_pago,
          monto,
          referencia,
          estado,
          created_at;
      `,
      [
        comprobante.id_comprobante,
        idUsuario,
        idApertura,
        idMetodoPago,
        orden.total,
        referencia?.trim() || null,
      ],
    )

    await client.query(
      `
        update orden
        set estado = 'PAGADA',
            cerrada_at = now(),
            updated_at = now()
        where id_orden = $1;
      `,
      [idOrden],
    )

    await client.query("commit")

    return {
      comprobante,
      pago: pagoRows[0],
    }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

module.exports = {
  registrarPago,
}