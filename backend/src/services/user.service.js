// backend/src/services/user.service.js

const { pool } = require("../config/database")

async function getUsers() {
  const query = `
    select
      u.id_usuario,
      u.nombres,
      u.apellidos,
      u.email,
      u.username,
      u.celular,
      u.estado,
      u.ultimo_acceso_at,
      u.created_at,
      r.nombre as rol,
      e.nombre_comercial as establecimiento
    from usuario u
    inner join rol r on r.id_rol = u.id_rol
    inner join establecimiento e on e.id_establecimiento = u.id_establecimiento
    order by u.created_at asc;
  `

  const { rows } = await pool.query(query)

  return rows
}

module.exports = {
  getUsers,
}