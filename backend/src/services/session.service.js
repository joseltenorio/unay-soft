// backend/src/services/session.service.js

const { authConfig } = require("../config/auth")
const { pool } = require("../config/database")
const {
  generateOpaqueToken,
  getRefreshTokenExpirationDate,
  hashToken,
} = require("../utils/token")

function getRequestMetadata(req) {
  const forwardedFor = req.headers["x-forwarded-for"]
  const ipFromForwardedHeader = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0]?.trim()

  return {
    ip_origen: ipFromForwardedHeader || req.ip || req.socket?.remoteAddress || null,
    user_agent: req.headers["user-agent"] || null,
  }
}

function resolveIdleTimeoutMinutes(user) {
  const roleName = String(user?.rol || "").trim().toLowerCase()

  if (roleName.includes("cajero")) {
    return authConfig.cashierIdleTimeoutMinutes
  }

  if (
    roleName.includes("cocina") ||
    roleName.includes("kds") ||
    roleName.includes("kitchen")
  ) {
    return authConfig.kdsIdleTimeoutMinutes
  }

  return authConfig.idleTimeoutMinutes
}

function isSessionIdleExpired(session, timeoutMinutes) {
  if (!session?.last_seen_at) {
    return false
  }

  const parsedTimeout = Number(timeoutMinutes)

  if (!Number.isFinite(parsedTimeout) || parsedTimeout <= 0) {
    return false
  }

  const lastSeenAt = new Date(session.last_seen_at)

  if (Number.isNaN(lastSeenAt.getTime())) {
    return false
  }

  const elapsedMs = Date.now() - lastSeenAt.getTime()
  const timeoutMs = parsedTimeout * 60 * 1000

  return elapsedMs > timeoutMs
}

async function createUserSession({
  id_usuario,
  remember = false,
  ip_origen = null,
  user_agent = null,
}) {
  const refreshToken = generateOpaqueToken()
  const refreshTokenHash = hashToken(refreshToken)
  const expirationDate = getRefreshTokenExpirationDate({ remember })

  const query = `
    insert into sesion_usuario (
      id_usuario,
      refresh_token_hash,
      ip_origen,
      user_agent,
      expira_at,
      last_seen_at
    )
    values ($1, $2, $3, $4, $5, now())
    returning
      id_sesion,
      id_usuario,
      expira_at,
      last_seen_at,
      created_at;
  `

  const { rows } = await pool.query(query, [
    id_usuario,
    refreshTokenHash,
    ip_origen,
    user_agent,
    expirationDate,
  ])

  return {
    session: rows[0],
    refreshToken,
  }
}

async function rotateUserSession(refreshToken) {
  const refreshTokenHash = hashToken(refreshToken)

  const sessionQuery = `
    select
      s.id_sesion,
      s.id_usuario,
      s.expira_at,
      s.revocado_at,
      s.last_seen_at
    from sesion_usuario s
    where s.refresh_token_hash = $1
      and s.revocado_at is null
      and s.expira_at > now()
    limit 1;
  `

  const { rows } = await pool.query(sessionQuery, [refreshTokenHash])

  if (rows.length === 0) {
    const error = new Error("Sesión inválida o expirada.")
    error.statusCode = 401
    throw error
  }

  const currentSession = rows[0]

  const newRefreshToken = generateOpaqueToken()
  const newRefreshTokenHash = hashToken(newRefreshToken)

  const updateQuery = `
    update sesion_usuario
    set
      refresh_token_hash = $1,
      last_seen_at = now()
    where id_sesion = $2
    returning
      id_sesion,
      id_usuario,
      expira_at,
      last_seen_at,
      created_at;
  `

  const { rows: updatedRows } = await pool.query(updateQuery, [
    newRefreshTokenHash,
    currentSession.id_sesion,
  ])

  return {
    session: updatedRows[0],
    refreshToken: newRefreshToken,
  }
}

async function getActiveSessionById(id_sesion, id_usuario) {
  if (!id_sesion || !id_usuario) {
    return null
  }

  const query = `
    select
      id_sesion,
      id_usuario,
      expira_at,
      revocado_at,
      last_seen_at,
      created_at
    from sesion_usuario
    where id_sesion = $1
      and id_usuario = $2
      and revocado_at is null
      and expira_at > now()
    limit 1;
  `

  const { rows } = await pool.query(query, [id_sesion, id_usuario])

  return rows[0] || null
}

async function touchUserSession(id_sesion, id_usuario) {
  if (!id_sesion || !id_usuario) {
    return null
  }

  const query = `
    update sesion_usuario
    set last_seen_at = now()
    where id_sesion = $1
      and id_usuario = $2
      and revocado_at is null
      and expira_at > now()
    returning
      id_sesion,
      id_usuario,
      expira_at,
      revocado_at,
      last_seen_at,
      created_at;
  `

  const { rows } = await pool.query(query, [id_sesion, id_usuario])

  return rows[0] || null
}

async function revokeUserSession(id_sesion, id_usuario) {
  const query = `
    update sesion_usuario
    set revocado_at = now()
    where id_sesion = $1
      and id_usuario = $2
      and revocado_at is null
    returning
      id_sesion,
      id_usuario,
      revocado_at;
  `

  const { rows } = await pool.query(query, [id_sesion, id_usuario])

  return rows[0] || null
}

module.exports = {
  createUserSession,
  getActiveSessionById,
  getRequestMetadata,
  isSessionIdleExpired,
  resolveIdleTimeoutMinutes,
  revokeUserSession,
  rotateUserSession,
  touchUserSession,
}