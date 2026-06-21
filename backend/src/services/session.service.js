// backend/src/services/session.service.js

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
      expira_at
    )
    values ($1, $2, $3, $4, $5)
    returning
      id_sesion,
      id_usuario,
      expira_at,
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
      s.revocado_at
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
    set refresh_token_hash = $1
    where id_sesion = $2
    returning
      id_sesion,
      id_usuario,
      expira_at,
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

module.exports = {
  createUserSession,
  getRequestMetadata,
  rotateUserSession,
}