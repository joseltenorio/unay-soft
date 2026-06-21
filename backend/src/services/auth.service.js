// backend/src/services/auth.service.js

const bcrypt = require("bcryptjs")

const { pool } = require("../config/database")
const { generateAccessToken } = require("../utils/jwt")
const {
  createUserSession,
  rotateUserSession,
} = require("./session.service")

async function getUserAccess(id_rol) {
  const modulesQuery = `
    select distinct
      m.codigo
    from modulo m
    inner join permiso p
      on p.id_modulo = m.id_modulo
    inner join rol_permiso rp
      on rp.id_permiso = p.id_permiso
    where rp.id_rol = $1
      and m.estado = true
      and p.estado = true
    order by m.codigo;
  `

  const { rows: modulesRows } = await pool.query(modulesQuery, [id_rol])

  const permissionsQuery = `
    select distinct
      p.codigo
    from permiso p
    inner join rol_permiso rp
      on rp.id_permiso = p.id_permiso
    inner join modulo m
      on m.id_modulo = p.id_modulo
    where rp.id_rol = $1
      and p.estado = true
      and m.estado = true
    order by p.codigo;
  `

  const { rows: permissionsRows } = await pool.query(permissionsQuery, [id_rol])

  return {
    modules: modulesRows.map((module) => ({ codigo: module.codigo })),
    permissions: permissionsRows.map((permission) => permission.codigo),
  }
}

function buildPublicUser(user) {
  return {
    id_usuario: user.id_usuario,
    id_establecimiento: user.id_establecimiento,
    id_rol: user.id_rol,
    nombres: user.nombres,
    apellidos: user.apellidos,
    email: user.email,
    username: user.username,
    rol: user.rol,
  }
}

function buildAccessTokenPayload(user, session) {
  return {
    id_usuario: user.id_usuario,
    id_establecimiento: user.id_establecimiento,
    id_rol: user.id_rol,
    id_sesion: session.id_sesion,
    nombres: user.nombres,
    apellidos: user.apellidos,
    email: user.email,
    username: user.username,
    rol: user.rol,
    session_mode: "single_establishment",
  }
}

async function findUserByIdentifier(identifier) {
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
      u.estado as usuario_estado,
      e.estado as establecimiento_estado,
      r.estado as rol_estado,
      r.nombre as rol
    from usuario u
    inner join rol r
      on r.id_rol = u.id_rol
     and r.id_establecimiento = u.id_establecimiento
    inner join establecimiento e
      on e.id_establecimiento = u.id_establecimiento
    where lower(u.email) = $1
       or lower(u.username) = $1
    limit 1;
  `

  const { rows } = await pool.query(query, [normalizedIdentifier])

  return rows[0] || null
}

async function findActiveUserById(id_usuario) {
  const query = `
    select
      u.id_usuario,
      u.id_establecimiento,
      u.id_rol,
      u.nombres,
      u.apellidos,
      u.email,
      u.username,
      u.estado as usuario_estado,
      e.estado as establecimiento_estado,
      r.estado as rol_estado,
      r.nombre as rol
    from usuario u
    inner join rol r
      on r.id_rol = u.id_rol
     and r.id_establecimiento = u.id_establecimiento
    inner join establecimiento e
      on e.id_establecimiento = u.id_establecimiento
    where u.id_usuario = $1
    limit 1;
  `

  const { rows } = await pool.query(query, [id_usuario])

  return rows[0] || null
}

function assertUserCanAccess(user) {
  if (!user) {
    const error = new Error("Credenciales inválidas.")
    error.statusCode = 401
    throw error
  }

  if (!user.usuario_estado) {
    const error = new Error("El usuario se encuentra inactivo.")
    error.statusCode = 403
    throw error
  }

  if (!user.rol_estado) {
    const error = new Error("El rol del usuario se encuentra inactivo.")
    error.statusCode = 403
    throw error
  }

  if (!user.establecimiento_estado) {
    const error = new Error("El establecimiento se encuentra inactivo.")
    error.statusCode = 403
    throw error
  }
}

async function loginUser(identifier, password, options = {}) {
  const { remember = false, ip_origen = null, user_agent = null } = options

  const user = await findUserByIdentifier(identifier)

  assertUserCanAccess(user)

  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas.")
    error.statusCode = 401
    throw error
  }

  const { session, refreshToken } = await createUserSession({
    id_usuario: user.id_usuario,
    remember,
    ip_origen,
    user_agent,
  })

  const accessToken = generateAccessToken(buildAccessTokenPayload(user, session))

  await pool.query(
    `
      update usuario
      set ultimo_acceso_at = now()
      where id_usuario = $1;
    `,
    [user.id_usuario],
  )

  const access = await getUserAccess(user.id_rol)

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    user: buildPublicUser(user),
    permissions: access.permissions,
    modules: access.modules,
    session: {
      id_sesion: session.id_sesion,
      expira_at: session.expira_at,
    },
  }
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    const error = new Error("Refresh token no enviado.")
    error.statusCode = 400
    throw error
  }

  const { session, refreshToken: newRefreshToken } =
    await rotateUserSession(refreshToken)

  const user = await findActiveUserById(session.id_usuario)

  assertUserCanAccess(user)

  const accessToken = generateAccessToken(buildAccessTokenPayload(user, session))
  const access = await getUserAccess(user.id_rol)

  return {
    token: accessToken,
    accessToken,
    refreshToken: newRefreshToken,
    user: buildPublicUser(user),
    permissions: access.permissions,
    modules: access.modules,
    session: {
      id_sesion: session.id_sesion,
      expira_at: session.expira_at,
    },
  }
}

module.exports = {
  loginUser,
  refreshUserSession,
}