// backend/src/services/role.service.js

const { pool } = require("../config/database")

async function getRoles(idEstablecimiento) {
  const query = `
    select
      id_rol,
      nombre,
      descripcion,
      estado,
      created_at
    from rol
    where id_establecimiento = $1
      and estado = true
    order by nombre asc;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows
}

module.exports = {
  getRoles,
}