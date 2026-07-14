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

// ── Cajas disponibles (para el select del AperturaGate) ────────────

async function getCajasDisponibles(idEstablecimiento) {
  const { rows } = await pool.query(
    `
      select
        id_caja,
        id_establecimiento,
        nombre,
        descripcion,
        estado
      from caja
      where id_establecimiento = $1
        and estado = true
      order by nombre asc;
    `,
    [idEstablecimiento],
  )

  return rows
}

// ── Apertura activa del usuario ─────────────────────────────────────
// Un usuario solo puede tener una apertura ABIERTA a la vez.
// Esto es lo que CashierPage consulta al montar la página para
// decidir si muestra AperturaGate o el resto del módulo.

async function getAperturaActivaPorUsuario(idUsuario, idEstablecimiento) {
  const { rows } = await pool.query(
    `
      select
        ac.id_apertura,
        ac.id_caja,
        c.nombre as caja_nombre,
        ac.id_usuario,
        ac.monto_inicial,
        ac.hora_apertura,
        ac.observaciones,
        ac.estado,
        ac.created_at
      from apertura_caja ac
      inner join caja c
        on c.id_caja = ac.id_caja
      where ac.id_usuario = $1
        and c.id_establecimiento = $2
        and ac.estado = 'ABIERTA'
      order by ac.hora_apertura desc
      limit 1;
    `,
    [idUsuario, idEstablecimiento],
  )

  return rows[0] || null
}

// ── Abrir caja ───────────────────────────────────────────────────

async function abrirCaja({ idEstablecimiento, idUsuario, idCaja, montoInicial, observaciones }) {
  const monto = Number(montoInicial)

  if (Number.isNaN(monto) || monto < 0) {
    throw createHttpError("El monto inicial debe ser un número mayor o igual a cero.", 400)
  }

  const client = await pool.connect()

  try {
    await client.query("begin")

    const { rows: cajaRows } = await client.query(
      `
        select id_caja, nombre, estado
        from caja
        where id_caja = $1
          and id_establecimiento = $2
        for update;
      `,
      [idCaja, idEstablecimiento],
    )

    if (cajaRows.length === 0) {
      throw createHttpError("La caja no existe o no pertenece al establecimiento.", 404)
    }

    if (!cajaRows[0].estado) {
      throw createHttpError("La caja seleccionada está inactiva.", 409)
    }

    const { rows: aperturaExistente } = await client.query(
      `
        select id_apertura
        from apertura_caja
        where id_caja = $1
          and estado = 'ABIERTA'
        limit 1;
      `,
      [idCaja],
    )

    if (aperturaExistente.length > 0) {
      throw createHttpError("Esta caja ya tiene un turno abierto por otro usuario.", 409)
    }

    const { rows: usuarioConTurno } = await client.query(
      `
        select id_apertura
        from apertura_caja
        where id_usuario = $1
          and estado = 'ABIERTA'
        limit 1;
      `,
      [idUsuario],
    )

    if (usuarioConTurno.length > 0) {
      throw createHttpError("Ya tienes un turno de caja abierto. Ciérralo antes de abrir otro.", 409)
    }

    const { rows: aperturaRows } = await client.query(
      `
        insert into apertura_caja (
          id_caja,
          id_usuario,
          monto_inicial,
          observaciones,
          estado
        )
        values ($1, $2, $3, $4, 'ABIERTA')
        returning
          id_apertura,
          id_caja,
          id_usuario,
          monto_inicial,
          hora_apertura,
          observaciones,
          estado,
          created_at;
      `,
      [idCaja, idUsuario, monto, observaciones?.trim() || null],
    )

    await client.query("commit")

    return {
      ...aperturaRows[0],
      caja_nombre: cajaRows[0].nombre,
    }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

// ── Cuentas por cobrar (para CobrarTab) ─────────────────────────────
// Agrupa por mesa todas las órdenes ENVIADA_A_CAJA (comanda + comandas
// de apoyo que se enviaron juntas) como una sola cuenta consolidada.

async function getCuentasPorCobrar(idEstablecimiento) {
  const { rows } = await pool.query(
    `
      select
        o.id_mesa,
        m.numero as mesa_numero,
        m.nombre as mesa_nombre,
        o.id_orden,
        o.numero_orden,
        o.subtotal,
        o.igv,
        o.total,
        o.observaciones,
        o.enviada_caja_at,
        u.nombres,
        u.apellidos,
        json_agg(
          json_build_object(
            'id_item_orden', io.id_item_orden,
            'id_producto', io.id_producto,
            'producto_nombre', p.nombre,
            'cantidad', io.cantidad,
            'precio_unitario', io.precio_unitario,
            'subtotal', io.subtotal,
            'notas_cocina', io.notas_cocina
          )
          order by io.created_at asc
        ) filter (where io.id_item_orden is not null) as items
      from orden o
      inner join usuario u
        on u.id_usuario = o.id_usuario
      left join mesa m
        on m.id_mesa = o.id_mesa
      left join item_orden io
        on io.id_orden = o.id_orden
        and io.estado_cocina <> 'ANULADO'
      left join producto p
        on p.id_producto = io.id_producto
      where u.id_establecimiento = $1
        and o.estado = 'ENVIADA_A_CAJA'
      group by
        o.id_mesa, m.numero, m.nombre,
        o.id_orden, o.numero_orden, o.subtotal, o.igv, o.total,
        o.observaciones, o.enviada_caja_at, u.nombres, u.apellidos
      order by o.id_mesa, o.enviada_caja_at asc;
    `,
    [idEstablecimiento],
  )

  const cuentasPorMesa = new Map()

  rows.forEach((row) => {
    const key = row.id_mesa || `sin-mesa-${row.id_orden}`

    if (!cuentasPorMesa.has(key)) {
      cuentasPorMesa.set(key, {
        id_mesa: row.id_mesa,
        mesa_numero: row.mesa_numero,
        mesa_nombre: row.mesa_nombre,
        ordenes: [],
        subtotal: 0,
        igv: 0,
        total: 0,
      })
    }

    const cuenta = cuentasPorMesa.get(key)

    cuenta.ordenes.push({
      id_orden: row.id_orden,
      numero_orden: row.numero_orden,
      observaciones: row.observaciones,
      enviada_caja_at: row.enviada_caja_at,
      mesero: [row.nombres, row.apellidos].filter(Boolean).join(" ").trim(),
      items: row.items || [],
    })

    cuenta.subtotal += Number(row.subtotal)
    cuenta.igv += Number(row.igv)
    cuenta.total += Number(row.total)
  })

  return Array.from(cuentasPorMesa.values()).map((cuenta) => ({
    ...cuenta,
    subtotal: Number(cuenta.subtotal.toFixed(2)),
    igv: Number(cuenta.igv.toFixed(2)),
    total: Number(cuenta.total.toFixed(2)),
    id_ordenes: cuenta.ordenes.map((o) => o.id_orden),
  }))
}

// ── Registrar pago (consolida N órdenes de una misma mesa en un solo
//    comprobante + un solo pago) ─────────────────────────────────────
// Reglas de negocio:
// - idOrdenes: todas las órdenes ENVIADA_A_CAJA que se cobran juntas
//   (típicamente todas las de una misma mesa, enviadas juntas).
// - Solo se acepta pago completo del total consolidado, un solo método
//   de pago (no hay pagos divididos).
// - tipo_comprobante: "BOL" o "FAC". FAC requiere numero_documento y
//   razon_social.
// - Al confirmar: cada orden pasa a 'PAGADA' con id_comprobante
//   apuntando al comprobante consolidado, y la mesa se libera.

async function registrarPago({
  idEstablecimiento,
  idUsuario,
  idApertura,
  idOrdenes,
  idMetodoPago,
  tipoComprobante,
  referencia,
  datosFactura,
}) {
  if (!idApertura) {
    throw createHttpError("Debe existir un turno de caja abierto para registrar el pago.", 400)
  }

  if (!Array.isArray(idOrdenes) || idOrdenes.length === 0) {
    throw createHttpError("Debe indicar al menos una orden a cobrar.", 400)
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

    const { rows: ordenRows } = await client.query(
      `
        select o.id_orden, o.id_mesa, o.estado, o.subtotal, o.igv, o.total
        from orden o
        where o.id_orden = any($1::uuid[])
        for update;
      `,
      [idOrdenes],
    )

    if (ordenRows.length !== idOrdenes.length) {
      throw createHttpError("Una o más órdenes indicadas no existen.", 404)
    }

    const ordenesNoCobrables = ordenRows.filter(
      (orden) => orden.estado !== ESTADO_ORDEN_COBRABLE,
    )

    if (ordenesNoCobrables.length > 0) {
      throw createHttpError(
        "Una o más órdenes no están en estado ENVIADA_A_CAJA.",
        409,
      )
    }

    const idsMesa = [...new Set(ordenRows.map((o) => o.id_mesa).filter(Boolean))]

    if (idsMesa.length > 1) {
      throw createHttpError(
        "Las órdenes a cobrar juntas deben pertenecer a la misma mesa.",
        409,
      )
    }

    const idMesa = idsMesa[0] || null

    const subtotalConsolidado = Number(
      ordenRows.reduce((sum, o) => sum + Number(o.subtotal), 0).toFixed(2),
    )
    const igvConsolidado = Number(
      ordenRows.reduce((sum, o) => sum + Number(o.igv), 0).toFixed(2),
    )
    const totalConsolidado = Number(
      ordenRows.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2),
    )

    if (totalConsolidado <= 0) {
      throw createHttpError("El total a cobrar debe ser mayor a cero.", 409)
    }

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

    const { rows: tipoComprobanteRows } = await client.query(
      `select id_tipo_comprobante from tipo_comprobante where codigo = $1;`,
      [tipo],
    )

    if (tipoComprobanteRows.length === 0) {
      throw createHttpError("El tipo de comprobante configurado no existe.", 500)
    }

    const idTipoComprobante = tipoComprobanteRows[0].id_tipo_comprobante
    const serie = SERIES_POR_TIPO[tipo]

    await client.query("select pg_advisory_xact_lock(hashtext($1));", [serie])

    const { rows: ultimoNumeroRows } = await client.query(
      `select numero from comprobante where serie = $1 order by numero desc limit 1;`,
      [serie],
    )

    const siguienteNumero =
      ultimoNumeroRows.length > 0 ? Number(ultimoNumeroRows[0].numero) + 1 : 1

    const numero = padNumero(siguienteNumero)

    const { rows: comprobanteRows } = await client.query(
      `
        insert into comprobante (
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
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        returning
          id_comprobante, id_apertura, id_tipo_comprobante, serie, numero,
          estado, subtotal, igv, total, numero_documento, razon_social,
          direccion_fiscal, fecha_emision;
      `,
      [
        idApertura,
        idTipoComprobante,
        serie,
        numero,
        subtotalConsolidado,
        igvConsolidado,
        totalConsolidado,
        datosFactura?.numero_documento || null,
        datosFactura?.razon_social || null,
        datosFactura?.direccion_fiscal || null,
      ],
    )

    const comprobante = comprobanteRows[0]

    await client.query(
      `
        update orden
        set estado = 'PAGADA',
            id_comprobante = $2,
            cerrada_at = now(),
            updated_at = now()
        where id_orden = any($1::uuid[]);
      `,
      [idOrdenes, comprobante.id_comprobante],
    )

    const { rows: pagoRows } = await client.query(
      `
        insert into pago (
          id_comprobante, id_usuario, id_apertura, id_metodo_pago,
          monto, referencia, estado
        )
        values ($1, $2, $3, $4, $5, $6, 'CONFIRMADO')
        returning
          id_pago, id_comprobante, id_usuario, id_apertura, id_metodo_pago,
          monto, referencia, estado, created_at;
      `,
      [
        comprobante.id_comprobante,
        idUsuario,
        idApertura,
        idMetodoPago,
        totalConsolidado,
        referencia?.trim() || null,
      ],
    )

    if (idMesa) {
      await client.query(
        `update mesa set disponibilidad = 'LIBRE', updated_at = now() where id_mesa = $1;`,
        [idMesa],
      )
    }

    await client.query("commit")

    return {
      comprobante,
      pago: pagoRows[0],
      ordenes_pagadas: idOrdenes,
    }
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

// ── Resumen del turno (para CierreTab y para el header de Historial) ─
// Trae desglose por método de pago, total de ventas, y el total en
// efectivo esperado (monto_inicial + pagos en efectivo confirmados).

async function getResumenTurno(idApertura, idEstablecimiento) {
  const { rows: aperturaRows } = await pool.query(
    `
      select
        ac.id_apertura,
        ac.id_caja,
        c.nombre as caja_nombre,
        ac.monto_inicial,
        ac.estado
      from apertura_caja ac
      inner join caja c
        on c.id_caja = ac.id_caja
      where ac.id_apertura = $1
        and c.id_establecimiento = $2
      limit 1;
    `,
    [idApertura, idEstablecimiento],
  )

  if (aperturaRows.length === 0) {
    throw createHttpError("La apertura de caja no existe o no pertenece al establecimiento.", 404)
  }

  const apertura = aperturaRows[0]

  const { rows: desgloseRows } = await pool.query(
    `
      select
        mp.nombre as metodo_pago,
        count(*)::int as cantidad,
        coalesce(sum(p.monto), 0) as total
      from pago p
      inner join metodo_pago mp
        on mp.id_metodo_pago = p.id_metodo_pago
      where p.id_apertura = $1
        and p.estado = 'CONFIRMADO'
      group by mp.nombre
      order by mp.nombre asc;
    `,
    [idApertura],
  )

  const totalVentasTurno = desgloseRows.reduce(
    (sum, row) => sum + Number(row.total),
    0,
  )

  const totalEfectivoPagos = desgloseRows
    .filter((row) => row.metodo_pago === "EFECTIVO")
    .reduce((sum, row) => sum + Number(row.total), 0)

  const totalEfectivoSistema = Number(apertura.monto_inicial) + totalEfectivoPagos

  return {
    id_apertura: apertura.id_apertura,
    caja_nombre: apertura.caja_nombre,
    monto_inicial: Number(apertura.monto_inicial),
    estado: apertura.estado,
    desglose_por_metodo: desgloseRows.map((row) => ({
      metodo_pago: row.metodo_pago,
      cantidad: row.cantidad,
      total: Number(row.total),
    })),
    total_ventas_turno: totalVentasTurno,
    total_efectivo_sistema: totalEfectivoSistema,
  }
}

// ── Cerrar caja ──────────────────────────────────────────────────

async function cerrarCaja({ idApertura, idEstablecimiento, idUsuario, totalDeclarado, observaciones }) {
  const declarado = Number(totalDeclarado)

  if (Number.isNaN(declarado) || declarado < 0) {
    throw createHttpError("El total declarado debe ser un número mayor o igual a cero.", 400)
  }

  const client = await pool.connect()

  try {
    await client.query("begin")

    const { rows: aperturaRows } = await client.query(
      `
        select
          ac.id_apertura,
          ac.id_caja,
          ac.monto_inicial,
          ac.estado
        from apertura_caja ac
        inner join caja c
          on c.id_caja = ac.id_caja
        where ac.id_apertura = $1
          and c.id_establecimiento = $2
        for update of ac;
      `,
      [idApertura, idEstablecimiento],
    )

    if (aperturaRows.length === 0) {
      throw createHttpError("La apertura de caja no existe o no pertenece al establecimiento.", 404)
    }

    const apertura = aperturaRows[0]

    if (apertura.estado !== "ABIERTA") {
      throw createHttpError("Este turno ya fue cerrado o anulado.", 409)
    }

    const { rows: pagosEfectivoRows } = await client.query(
      `
        select coalesce(sum(p.monto), 0) as total_efectivo
        from pago p
        inner join metodo_pago mp
          on mp.id_metodo_pago = p.id_metodo_pago
        where p.id_apertura = $1
          and p.estado = 'CONFIRMADO'
          and mp.nombre = 'EFECTIVO';
      `,
      [idApertura],
    )

    const totalEfectivoSistema =
      Number(apertura.monto_inicial) + Number(pagosEfectivoRows[0].total_efectivo)

    const diferencia = Number((declarado - totalEfectivoSistema).toFixed(2))

    const { rows: cierreRows } = await client.query(
      `
        insert into cierre_caja (
          id_apertura,
          id_usuario,
          total_sistema,
          total_declarado,
          diferencia,
          observaciones
        )
        values ($1, $2, $3, $4, $5, $6)
        returning
          id_cierre_caja,
          id_apertura,
          id_usuario,
          total_sistema,
          total_declarado,
          diferencia,
          hora_cierre,
          observaciones,
          created_at;
      `,
      [
        idApertura,
        idUsuario,
        totalEfectivoSistema,
        declarado,
        diferencia,
        observaciones?.trim() || null,
      ],
    )

    await client.query(
      `
        update apertura_caja
        set estado = 'CERRADA',
            updated_at = now()
        where id_apertura = $1;
      `,
      [idApertura],
    )

    await client.query("commit")

    return cierreRows[0]
  } catch (error) {
    await client.query("rollback")
    throw error
  } finally {
    client.release()
  }
}

// ── Métodos de pago disponibles (para el select del PayPanel) ──────

async function getMetodosPagoDisponibles(idEstablecimiento) {
  const { rows } = await pool.query(
    `
      select id_metodo_pago, nombre
      from metodo_pago
      where id_establecimiento = $1
        and estado = true
      order by nombre asc;
    `,
    [idEstablecimiento],
  )

  return rows
}

module.exports = {
  getCajasDisponibles,
  getAperturaActivaPorUsuario,
  abrirCaja,
  getMetodosPagoDisponibles,
  getCuentasPorCobrar,
  registrarPago,
  getResumenTurno,
  cerrarCaja,
}