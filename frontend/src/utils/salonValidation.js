// frontend/src/utils/salonValidation.js

const ZONA_NAME_PATTERN = /^(?!.*\s{2,})(?!.*[-_]{2,})[\p{L}\p{N}]+(?:[ \-_()\p{L}\p{N}])*$/u
const MESA_NAME_PATTERN = /^[\p{L}\p{N}]+(?:[\s\-_()\p{L}\p{N}])*$/u

const RESERVED_ZONA_NAMES = new Set([
  "null", "undefined", "test", "demo", "xyz",
  "mesa", "asd", "asdasd", "zona",
])

const RESERVED_NAMES = new Set([
  "null", "undefined", "test", "demo", "xyz",
  "asd", "asdasd",
])

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeZonaName(value) {
  return normalizeText(value)
}

export function normalizeMesaName(value) {
  return normalizeText(value)
}

// ── ZONA ──────────────────────────────────────────────
export function isValidZonaName(value) {
  const v = normalizeZonaName(value)
  if (v.length < 3 || v.length > 30) return false
  if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(v)) return false
  if (!ZONA_NAME_PATTERN.test(v)) return false
  return !RESERVED_ZONA_NAMES.has(v.toLowerCase())
}

export function validateZonaForm(formData) {
  const errors = {}

  if (!isValidZonaName(formData.nombre)) {
    errors.nombre =
      "El nombre debe tener entre 3 y 30 caracteres válidos (letras, números o espacios coherentes). No se permiten símbolos repetidos o texto aleatorio."
  }

  if (formData.capacidad !== "" && formData.capacidad !== null && formData.capacidad !== undefined) {
    const cap = Number(formData.capacidad)
    if (isNaN(cap) || cap < 1 || !Number.isInteger(cap)) {
      errors.capacidad = "La capacidad debe ser un número entero mayor o igual a 1."
    }
  }

  return errors
}

// ── MESA ──────────────────────────────────────────────
export function isValidMesaName(value) {
  const v = normalizeMesaName(value)
  if (v.length < 1 || v.length > 20) return false
  if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(v)) return false
  if (!MESA_NAME_PATTERN.test(v)) return false
  return !RESERVED_NAMES.has(v.toLowerCase())
}

export function validateMesaForm(formData) {
  const errors = {}

  // Número (requerido)
  const num = Number(formData.numero)
  if (!formData.numero || isNaN(num) || num < 1 || !Number.isInteger(num)) {
    errors.numero = "El número de mesa debe ser un entero mayor a 1."
  }

  // Nombre (opcional — solo valida si tiene contenido)
  if (formData.nombre && formData.nombre.trim() !== "") {
    if (!isValidMesaName(formData.nombre)) {
      errors.nombre = "El nombre debe ser válido (ej. 'P01', 'Mesa VIP') y no contener texto aleatorio."
    }
  }

  // Capacidad (requerida)
  const cap = Number(formData.capacidad)
  if (!formData.capacidad || isNaN(cap) || cap <= 0 || !Number.isInteger(cap)) {
    errors.capacidad = "La capacidad debe ser un número entero mayor a 0."
  }

  return errors
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}