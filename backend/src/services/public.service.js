// backend/src/services/public.service.js

const { pool } = require("../config/database")

const cartaCache = new Map()
const CARTA_CACHE_TTL_MS = 30 * 1000

const QR_TYPE_CARTA_GENERAL = "CARTA_GENERAL"

const RESERVED_PUBLIC_SLUGS = new Set([
  "api",
  "app",
  "assets",
  "carta",
  "login",
  "restore-password",
  "unauthorized",
])

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || "http://localhost:5173").replace(/\/+$/, "")
}

function normalizeTenantSlug(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
}

function getShortId(idEstablecimiento) {
  return String(idEstablecimiento || "").replace(/-/g, "").slice(0, 8)
}

function buildCartaUrl(baseUrl, tenantSlug) {
  return `${normalizeBaseUrl(baseUrl)}/carta/${tenantSlug}`
}

function assertPublicIdentifier(identifier) {
  const value = String(identifier || "").trim()

  if (!value) {
    const error = new Error("El establecimiento es requerido.")
    error.statusCode = 400
    throw error
  }

  if (value.includes("/") || value.includes("..")) {
    const error = new Error("El identificador público del establecimiento no es válido.")
    error.statusCode = 400
    throw error
  }

  return value
}

async function findActiveEstablishmentById(idEstablecimiento) {
  const query = `
    select
      id_establecimiento,
      nombre_comercial,
      logo_url,
      moneda_simbolo,
      slug
    from establecimiento
    where id_establecimiento = $1
      and estado = true
    limit 1;
  `

  const { rows } = await pool.query(query, [idEstablecimiento])

  return rows[0] || null
}

async function isSlugTaken(slug, idEstablecimiento) {
  const query = `
    select 1
    from establecimiento
    where lower(slug) = lower($1)
      and id_establecimiento <> $2
    limit 1;
  `

  const { rows } = await pool.query(query, [slug, idEstablecimiento])

  return rows.length > 0
}

async function buildUniqueTenantSlug(baseSlug, idEstablecimiento) {
  const fallbackSlug = `restaurante-${getShortId(idEstablecimiento)}`
  let candidate = normalizeTenantSlug(baseSlug) || fallbackSlug

  if (RESERVED_PUBLIC_SLUGS.has(candidate)) {
    candidate = `${candidate}-restaurante`
  }

  if (!(await isSlugTaken(candidate, idEstablecimiento))) {
    return candidate
  }

  candidate = `${candidate}-${getShortId(idEstablecimiento)}`

  if (!(await isSlugTaken(candidate, idEstablecimiento))) {
    return candidate
  }

  let counter = 2
  while (await isSlugTaken(`${candidate}-${counter}`, idEstablecimiento)) {
    counter += 1
  }

  return `${candidate}-${counter}`
}

async function ensureTenantSlug(idEstablecimiento) {
  const establishment = await findActiveEstablishmentById(idEstablecimiento)

  if (!establishment) {
    const error = new Error("Establecimiento no encontrado.")
    error.statusCode = 404
    throw error
  }

  const normalizedCurrentSlug = normalizeTenantSlug(establishment.slug)
  const baseSlug = normalizedCurrentSlug || normalizeTenantSlug(establishment.nombre_comercial)
  const tenantSlug = await buildUniqueTenantSlug(baseSlug, establishment.id_establecimiento)

  if (establishment.slug === tenantSlug) {
    return {
      ...establishment,
      slug: tenantSlug,
    }
  }

  const updateQuery = `
    update establecimiento
    set
      slug = $1,
      updated_at = now()
    where id_establecimiento = $2
      and estado = true
    returning
      id_establecimiento,
      nombre_comercial,
      logo_url,
      moneda_simbolo,
      slug;
  `

  const { rows } = await pool.query(updateQuery, [
    tenantSlug,
    establishment.id_establecimiento,
  ])

  return rows[0]
}

async function resolvePublicEstablishment(identifier) {
  const publicIdentifier = assertPublicIdentifier(identifier)
  const normalizedSlug = normalizeTenantSlug(publicIdentifier)

  const query = `
    select
      id_establecimiento,
      nombre_comercial,
      logo_url,
      moneda_simbolo,
      slug
    from establecimiento
    where estado = true
      and (
        id_establecimiento::text = $1
        or lower(slug) = lower($2)
      )
    limit 1;
  `

  const { rows } = await pool.query(query, [publicIdentifier, normalizedSlug])

  if (rows.length === 0) {
    const error = new Error("Establecimiento no encontrado.")
    error.statusCode = 404
    throw error
  }

  const establishment = rows[0]

  if (!establishment.slug || establishment.slug !== normalizeTenantSlug(establishment.slug)) {
    return ensureTenantSlug(establishment.id_establecimiento)
  }

  return establishment
}

async function getCartaPublica(publicIdentifier) {

  
  const cacheKey = String(publicIdentifier || "").trim().toLowerCase()
  const cached = cartaCache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CARTA_CACHE_TTL_MS) {
    return cached.data 
  }
  
  const establishment = await resolvePublicEstablishment(publicIdentifier)

  const categoriesQuery = `
    select
      c.id_categoria,
      c.nombre,
      c.descripcion,
      c.orden_display,
      coalesce(
        json_agg(
          json_build_object(
            'id_producto', p.id_producto,
            'nombre', p.nombre,
            'descripcion', p.descripcion,
            'precio_base', p.precio_base,
            'imagen_referencial', p.imagen_referencial,
            'etiquetas', (
              select coalesce(
                json_agg(
                  json_build_object(
                    'nombre', e.nombre,
                    'color_etiqueta', e.color_etiqueta
                  )
                ),
                '[]'
              )
              from producto_etiqueta pe
              join etiqueta e
                on e.id_etiqueta = pe.id_etiqueta
              where pe.id_producto = p.id_producto
            )
          )
          order by p.nombre asc
        ) filter (where p.id_producto is not null),
        '[]'
      ) as productos
    from categoria c
    left join producto p
      on p.id_categoria = c.id_categoria
     and p.estado = true
     and p.disponibilidad = true
    where c.id_establecimiento = $1
      and c.estado = true
    group by c.id_categoria
    order by c.orden_display asc, c.nombre asc;
  `

  const categoriesResult = await pool.query(categoriesQuery, [
    establishment.id_establecimiento,
  ])

  const result = {
    establecimiento: establishment,
    categorias: categoriesResult.rows,
  }

  
  cartaCache.set(cacheKey, { data: result, timestamp: Date.now() })

  return result
}

async function getOrCreateQR(idEstablecimiento, baseUrl) {
  const establishment = await ensureTenantSlug(idEstablecimiento)
  const urlDestino = buildCartaUrl(baseUrl, establishment.slug)

  const existingQuery = `
    select
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr
    from codigo_qr
    where id_establecimiento = $1
      and tipo = $2
      and estado = true
    order by created_at desc
    limit 1;
  `

  const existingResult = await pool.query(existingQuery, [
    idEstablecimiento,
    QR_TYPE_CARTA_GENERAL,
  ])

  if (existingResult.rows.length > 0) {
    const existingQr = existingResult.rows[0]

    if (existingQr.url_destino === urlDestino) {
      return {
        ...existingQr,
        tenant_slug: establishment.slug,
      }
    }

    const updateQuery = `
      update codigo_qr
      set
        url_destino = $1,
        imagen_qr = null,
        updated_at = now()
      where id_codigo_qr = $2
        and estado = true
      returning
        id_codigo_qr,
        id_establecimiento,
        tipo,
        url_destino,
        imagen_qr;
    `

    const updateResult = await pool.query(updateQuery, [
      urlDestino,
      existingQr.id_codigo_qr,
    ])

    return {
      ...updateResult.rows[0],
      tenant_slug: establishment.slug,
    }
  }

  const insertQuery = `
    insert into codigo_qr (
      id_establecimiento,
      tipo,
      url_destino
    )
    values ($1, $2, $3)
    returning
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr;
  `

  const insertResult = await pool.query(insertQuery, [
    idEstablecimiento,
    QR_TYPE_CARTA_GENERAL,
    urlDestino,
  ])

  return {
    ...insertResult.rows[0],
    tenant_slug: establishment.slug,
  }
}

async function saveQRImagen(idCodigoQr, imagenBase64) {
  const updateQuery = `
    update codigo_qr
    set
      imagen_qr = $1,
      updated_at = now()
    where id_codigo_qr = $2
      and estado = true
    returning
      id_codigo_qr,
      id_establecimiento,
      tipo,
      url_destino,
      imagen_qr;
  `

  const updateResult = await pool.query(updateQuery, [
    imagenBase64,
    idCodigoQr,
  ])

  if (updateResult.rows.length === 0) {
    const error = new Error("No se pudo actualizar la imagen del QR.")
    error.statusCode = 404
    throw error
  }

  return updateResult.rows[0]
}

module.exports = {
  buildCartaUrl,
  getCartaPublica,
  getOrCreateQR,
  normalizeTenantSlug,
  saveQRImagen,
}
