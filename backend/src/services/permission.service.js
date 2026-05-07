// src/services/permision.service.js

const { pool } = require("../config/database")

async function getUserPermissions(idUsuario) {
  const query = `
    select
      p.codigo as permiso_codigo,
      p.accion as permiso_accion,
      m.codigo as modulo_codigo,
      m.nombre as modulo_nombre,
      m.ruta_frontend,
      m.icono,
      m.orden_display
    from usuario u
    inner join rol r
      on r.id_rol = u.id_rol
     and r.id_establecimiento = u.id_establecimiento
    inner join rol_permiso rp
      on rp.id_rol = r.id_rol
    inner join permiso p
      on p.id_permiso = rp.id_permiso
    inner join modulo m
      on m.id_modulo = p.id_modulo
    where u.id_usuario = $1
      and u.estado = true
      and r.estado = true
      and p.estado = true
      and m.estado = true
    order by m.orden_display asc, p.codigo asc;
  `

  const { rows } = await pool.query(query, [idUsuario])

  const permissions = rows.map((row) => row.permiso_codigo)

  const modulesMap = new Map()

  rows.forEach((row) => {
    if (!modulesMap.has(row.modulo_codigo)) {
      modulesMap.set(row.modulo_codigo, {
        codigo: row.modulo_codigo,
        nombre: row.modulo_nombre,
        ruta_frontend: row.ruta_frontend,
        icono: row.icono,
        orden_display: row.orden_display,
      })
    }
  })

  return {
    permissions,
    modules: Array.from(modulesMap.values()),
  }
}

module.exports = {
  getUserPermissions,
}