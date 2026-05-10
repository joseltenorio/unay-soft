// backend/src/services/user.service.js

const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")

async function getUsers(idEstablecimiento) {
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
    where u.id_establecimiento = $1
    order by u.created_at asc;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows
}

async function createUser(idEstablecimiento, userData) {
  const {
    nombres,
    apellidos,
    email,
    username,
    password,
    celular,
    id_rol,
    estado = true,
  } = userData

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()

  const roleQuery = `
    select id_rol
    from rol
    where id_rol = $1
      and id_establecimiento = $2
      and estado = true
    limit 1;
  `

  const roleResult = await pool.query(roleQuery, [id_rol, idEstablecimiento])

  if (roleResult.rows.length === 0) {
    const error = new Error("El rol seleccionado no existe o no pertenece al establecimiento.")
    error.statusCode = 400
    throw error
  }

  const duplicatedQuery = `
    select
      id_usuario,
      email,
      username
    from usuario
    where lower(email) = $1
       or lower(username) = $2
    limit 1;
  `

  const duplicatedResult = await pool.query(duplicatedQuery, [
    normalizedEmail,
    normalizedUsername,
  ])

  if (duplicatedResult.rows.length > 0) {
    const duplicatedUser = duplicatedResult.rows[0]

    if (duplicatedUser.email.toLowerCase() === normalizedEmail) {
      const error = new Error("Ya existe un usuario registrado con ese correo.")
      error.statusCode = 409
      throw error
    }

    if (duplicatedUser.username.toLowerCase() === normalizedUsername) {
      const error = new Error("Ya existe un usuario registrado con ese nombre de usuario.")
      error.statusCode = 409
      throw error
    }
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const insertQuery = `
    insert into usuario (
      id_establecimiento,
      id_rol,
      nombres,
      apellidos,
      email,
      username,
      password_hash,
      celular,
      estado
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    returning
      id_usuario,
      id_establecimiento,
      id_rol,
      nombres,
      apellidos,
      email,
      username,
      celular,
      estado,
      ultimo_acceso_at,
      created_at;
  `

  const { rows } = await pool.query(insertQuery, [
    idEstablecimiento,
    id_rol,
    nombres.trim(),
    apellidos.trim(),
    normalizedEmail,
    normalizedUsername,
    passwordHash,
    celular?.trim() || null,
    Boolean(estado),
  ])

  return rows[0]
}

module.exports = {
  getUsers,
  createUser,
}