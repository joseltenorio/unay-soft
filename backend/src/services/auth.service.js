// backend/src/services/auth.service.js

const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")
const { generateToken } = require("../utils/jwt")

async function loginUser(identifier, password) {
  const normalizedIdentifier = identifier.trim().toLowerCase()

  const query = `
    select
      u.id_usuario,
      u.id_establecimiento,
      u.id_rol,
      u.nombres,
      u.apellidos,
      u.email,
      u.username,
      u.password_hash,
      u.estado,
      r.nombre as rol
    from usuario u
    inner join rol r on r.id_rol = u.id_rol
    where lower(u.email) = $1
       or lower(u.username) = $1
    limit 1;
  `

  const { rows } = await pool.query(query, [normalizedIdentifier])

  if (rows.length === 0) {
    const error = new Error("Credenciales inválidas.")
    error.statusCode = 401
    throw error
  }

  const user = rows[0]

  if (!user.estado) {
    const error = new Error("El usuario se encuentra inactivo.")
    error.statusCode = 403
    throw error
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas.")
    error.statusCode = 401
    throw error
  }

  const token = generateToken({
    id_usuario: user.id_usuario,
    id_establecimiento: user.id_establecimiento,
    id_rol: user.id_rol,
    nombres: user.nombres,
    apellidos: user.apellidos,
    email: user.email,
    username: user.username,
    rol: user.rol,
  })
  
  await pool.query(
    `
      update usuario
      set ultimo_acceso_at = now()
      where id_usuario = $1;
    `,
    [user.id_usuario],
  )

  const modulesQuery = `
  SELECT DISTINCT m.codigo
  FROM modulo m
  INNER JOIN permiso p ON p.id_modulo = m.id_modulo
  INNER JOIN rol_permiso rp ON rp.id_permiso = p.id_permiso
  WHERE rp.id_rol = $1
    AND m.estado = true
`
const { rows: modulesRows } = await pool.query(modulesQuery, [user.id_rol])
const modules = modulesRows.map((m) => ({ codigo: m.codigo }))
const permissionsQuery = `
  SELECT p.codigo
  FROM permiso p
  INNER JOIN rol_permiso rp ON rp.id_permiso = p.id_permiso
  WHERE rp.id_rol = $1
`
const { rows: permissionsRows } = await pool.query(permissionsQuery, [user.id_rol])
const permissions = permissionsRows.map((p) => p.codigo)
  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      id_establecimiento: user.id_establecimiento,
      id_rol: user.id_rol,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      username: user.username,
      rol: user.rol,
    },
    modules,  // ← agrega esto
  }
}

module.exports = {
  loginUser,
}