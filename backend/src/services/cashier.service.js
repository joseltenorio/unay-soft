// backend/src/services/cashier.service.js

const { pool } = require("../config/database")

const APERTURA_ESTADOS_BLOQUEANTES = ["ABIERTA"]

function createHttpError(message, statusCode = 500) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
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

    // Bloquea la caja para evitar dos aperturas simultáneas sobre la misma caja
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

    // Verifica que esa caja no tenga ya una apertura ABIERTA (de cualquier usuario)
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

    // Verifica que el usuario no tenga ya otra apertura ABIERTA en cualquier caja
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

module.exports = {
  getCajasDisponibles,
  getAperturaActivaPorUsuario,
  abrirCaja,
  getResumenTurno,
  cerrarCaja,
}