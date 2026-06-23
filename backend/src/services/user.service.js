// backend/src/services/user.service.js

const bcrypt = require("bcryptjs")
const { pool } = require("../config/database")
const {
  createBusinessError,
  normalizeEmail,
  normalizePersonName,
  normalizePeruPhone,
  normalizeUsername,
} = require("../utils/userValidation")

function normalizeUserPayload(userData, { includePassword = false } = {}) {
  const normalizedUser = {
    nombres: normalizePersonName(userData.nombres),
    apellidos: normalizePersonName(userData.apellidos),
    email: normalizeEmail(userData.email),
    username: normalizeUsername(userData.username),
    celular: normalizePeruPhone(userData.celular),
    id_rol: userData.id_rol,
    estado: userData.estado === undefined ? true : userData.estado,
  }

  if (includePassword) {
    normalizedUser.password = userData.password
  }

  if (typeof normalizedUser.estado !== "boolean") {
    throw createBusinessError("Debe enviar el estado del usuario como true o false.")
  }

  return normalizedUser
}

function mapDuplicateConstraintError(error) {
  if (error.code !== "23505") {
    return null
  }

  const constraintName = String(error.constraint || "").toLowerCase()
  const detail = String(error.detail || "").toLowerCase()

  if (constraintName.includes("email") || detail.includes("email")) {
    return createBusinessError(
      "Ya existe un usuario registrado con ese correo.",
      409,
    )
  }

  if (constraintName.includes("username") || detail.includes("username")) {
    return createBusinessError(
      "Ya existe un usuario registrado con ese nombre de usuario.",
      409,
    )
  }

  return createBusinessError(
    "Ya existe un usuario registrado con esos datos.",
    409,
  )
}

async function getUsers(idEstablecimiento) {
  const query = `
    select
      u.id_usuario,
      u.id_rol,
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

async function ensureRoleBelongsToEstablishment(idRol, idEstablecimiento) {
  const roleQuery = `
    select id_rol
    from rol
    where id_rol = $1
      and id_establecimiento = $2
      and estado = true
    limit 1;
  `

  const roleResult = await pool.query(roleQuery, [idRol, idEstablecimiento])

  if (roleResult.rows.length === 0) {
    throw createBusinessError(
      "El rol seleccionado no existe o no pertenece al establecimiento.",
    )
  }
}

async function ensureUserBelongsToEstablishment(idUsuario, idEstablecimiento) {
  const userQuery = `
    select id_usuario
    from usuario
    where id_usuario = $1
      and id_establecimiento = $2
    limit 1;
  `

  const userResult = await pool.query(userQuery, [idUsuario, idEstablecimiento])

  if (userResult.rows.length === 0) {
    throw createBusinessError(
      "El usuario no existe o no pertenece al establecimiento.",
      404,
    )
  }
}

async function ensureEmailAndUsernameAreAvailable({
  email,
  username,
  excludedUserId = null,
}) {
  const duplicatedQuery = `
    select
      id_usuario,
      email,
      username
    from usuario
    where (lower(email) = $1 or lower(username) = $2)
      and ($3::uuid is null or id_usuario <> $3::uuid)
    limit 1;
  `

  const duplicatedResult = await pool.query(duplicatedQuery, [
    email,
    username,
    excludedUserId,
  ])

  if (duplicatedResult.rows.length === 0) {
    return
  }

  const duplicatedUser = duplicatedResult.rows[0]

  if (duplicatedUser.email.toLowerCase() === email) {
    throw createBusinessError(
      excludedUserId
        ? "Ya existe otro usuario registrado con ese correo."
        : "Ya existe un usuario registrado con ese correo.",
      409,
    )
  }

  if (duplicatedUser.username.toLowerCase() === username) {
    throw createBusinessError(
      excludedUserId
        ? "Ya existe otro usuario registrado con ese nombre de usuario."
        : "Ya existe un usuario registrado con ese nombre de usuario.",
      409,
    )
  }
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
    estado,
  } = normalizeUserPayload(userData, { includePassword: true })

  await ensureRoleBelongsToEstablishment(id_rol, idEstablecimiento)

  await ensureEmailAndUsernameAreAvailable({
    email,
    username,
  })

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

  try {
    const { rows } = await pool.query(insertQuery, [
      idEstablecimiento,
      id_rol,
      nombres,
      apellidos,
      email,
      username,
      passwordHash,
      celular,
      estado,
    ])

    return rows[0]
  } catch (error) {
    const mappedError = mapDuplicateConstraintError(error)

    if (mappedError) {
      throw mappedError
    }

    throw error
  }
}

async function updateUser(idEstablecimiento, idUsuario, userData) {
  const {
    nombres,
    apellidos,
    email,
    username,
    celular,
    id_rol,
    estado,
  } = normalizeUserPayload(userData)

  await ensureUserBelongsToEstablishment(idUsuario, idEstablecimiento)
  await ensureRoleBelongsToEstablishment(id_rol, idEstablecimiento)

  await ensureEmailAndUsernameAreAvailable({
    email,
    username,
    excludedUserId: idUsuario,
  })

  const updateQuery = `
    update usuario
    set
      id_rol = $1,
      nombres = $2,
      apellidos = $3,
      email = $4,
      username = $5,
      celular = $6,
      estado = $7
    where id_usuario = $8
      and id_establecimiento = $9
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
      created_at,
      updated_at;
  `

  try {
    const { rows } = await pool.query(updateQuery, [
      id_rol,
      nombres,
      apellidos,
      email,
      username,
      celular,
      estado,
      idUsuario,
      idEstablecimiento,
    ])

    return rows[0]
  } catch (error) {
    const mappedError = mapDuplicateConstraintError(error)

    if (mappedError) {
      throw mappedError
    }

    throw error
  }
}

async function updateUserStatus(
  idEstablecimiento,
  authenticatedUserId,
  idUsuario,
  estado,
) {
  if (typeof estado !== "boolean") {
    throw createBusinessError("Debe enviar el estado del usuario como true o false.")
  }

  if (authenticatedUserId === idUsuario && estado === false) {
    throw createBusinessError("No puede desactivar su propio usuario.")
  }

  await ensureUserBelongsToEstablishment(idUsuario, idEstablecimiento)

  const updateQuery = `
    update usuario
    set estado = $1
    where id_usuario = $2
      and id_establecimiento = $3
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
      created_at,
      updated_at;
  `

  const { rows } = await pool.query(updateQuery, [
    estado,
    idUsuario,
    idEstablecimiento,
  ])

  return rows[0]
}

module.exports = {
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
}