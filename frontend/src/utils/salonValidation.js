// frontend/src/utils/salonValidation.js

const ZONA_NAME_PATTERN = /^(?!.*\s{2,})(?!.*[-_]{2,})[\p{L}\p{N}]+(?:[ \-_()\p{L}\p{N}])*$/u
const MESA_NAME_PATTERN = /^(?!.*\s{2,})[\p{L}\p{N}]+(?:[\s\-_()\p{L}\p{N}])*$/u

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
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeZonaName(value) {
  return normalizeText(value)
}

export function normalizeMesaName(value) {
  return normalizeText(value)
}

function validateZonaName(value) {
  const v = normalizeZonaName(value)

  if (!v) return "El nombre de zona es obligatorio."
  if (v.length < 3) return "El nombre debe tener al menos 3 caracteres."
  if (v.length > 30) return "El nombre no puede superar los 30 caracteres."
  if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(v))
    return "El nombre contiene una secuencia de letras no válida."
  if (RESERVED_ZONA_NAMES.has(v.toLowerCase()))
    return "Este nombre de zona no está disponible."
  if (!ZONA_NAME_PATTERN.test(v))
    return "El nombre solo puede contener letras, números, espacios, guion o paréntesis."

  return null
}

export function isValidZonaName(value) {
  return validateZonaName(value) === null
}

export function validateZonaForm(formData) {
  const errors = {}

  const nombreError = validateZonaName(formData.nombre)
  if (nombreError) errors.nombre = nombreError

  if (formData.capacidad !== "" && formData.capacidad != null) {
    const cap = Number(formData.capacidad)
    if (isNaN(cap) || cap <= 0 || !Number.isInteger(cap)) {
      errors.capacidad = "La capacidad debe ser un número entero mayor a 0."
    }
  }

  return errors
}

function validateMesaName(value) {
  const v = normalizeMesaName(value)

  if (v.length < 1) return "El nombre no puede estar vacío."
  if (v.length > 20) return "El nombre no puede superar los 20 caracteres."
  if (/[bcdfghjklmnñpqrstvwxyz]{5,}/i.test(v))
    return "El nombre contiene una secuencia de letras no válida."
  if (!MESA_NAME_PATTERN.test(v))
    return "El nombre solo puede contener letras, números, espacios, guion o paréntesis."
  if (RESERVED_NAMES.has(v.toLowerCase()))
    return "Este nombre no está disponible."

  return null
}

export function isValidMesaName(value) {
  return validateMesaName(value) === null
}

export function validateMesaForm(formData) {
  const errors = {}

  const num = Number(formData.numero)
  if (!formData.numero || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
    errors.numero = "El número de mesa debe ser un entero mayor a 0."
  }

  if (formData.nombre && formData.nombre.trim() !== "") {
    const nombreError = validateMesaName(formData.nombre)
    if (nombreError) errors.nombre = nombreError
  }

  const cap = Number(formData.capacidad)
  if (!formData.capacidad || isNaN(cap) || cap <= 0 || !Number.isInteger(cap)) {
    errors.capacidad = "La capacidad debe ser un número entero mayor a 0."
  }

  return errors
}

export function validateMesaNumberUnique(numero, mesasExistentes = [], excludeId = null) {
  const num = Number(numero)
  const enUso = mesasExistentes
    .filter((m) => m.id_mesa !== excludeId)
    .some((m) => Number(m.numero) === num)

  return enUso ? `El número ${num} ya está en uso.` : null
}

export function hasValidationErrors(errors) {
  return Object.values(errors).some((error) => error !== undefined)
}