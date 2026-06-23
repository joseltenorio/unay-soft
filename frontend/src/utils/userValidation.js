// frontend/src/utils/userValidation.js

const PERSON_NAME_PATTERN =
  /^(?!.*\s{2,})(?!.*['-]{2,})[\p{L}]+(?:[ '-][\p{L}]+)*$/u

const USERNAME_PATTERN =
  /^(?![._-])(?!.*[._-]{2})(?!.*[._-]$)[a-z0-9._-]{4,30}$/

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const RESERVED_USERNAMES = new Set([
  "admin",
  "administrator",
  "root",
  "system",
  "support",
  "soporte",
  "umari",
  "unay",
  "null",
  "undefined",
  "test",
  "demo",
])

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizePersonName(value) {
  return normalizeText(value)
}

export function isValidPersonName(value) {
  const normalizedValue = normalizePersonName(value)

  if (normalizedValue.length < 2 || normalizedValue.length > 60) {
    return false
  }

  return PERSON_NAME_PATTERN.test(normalizedValue)
}

export function normalizeEmail(value) {
  return normalizeText(value).toLowerCase()
}

export function isValidEmail(value) {
  const normalizedValue = normalizeEmail(value)

  if (normalizedValue.length < 5 || normalizedValue.length > 254) {
    return false
  }

  return EMAIL_PATTERN.test(normalizedValue)
}

export function normalizeUsername(value) {
  return normalizeText(value).toLowerCase()
}

export function isValidUsername(value) {
  const normalizedValue = normalizeUsername(value)

  if (!USERNAME_PATTERN.test(normalizedValue)) {
    return false
  }

  return !RESERVED_USERNAMES.has(normalizedValue)
}

export function normalizeRoleId(value) {
  return String(value ?? "").trim()
}

export function normalizePeruPhoneDigits(value) {
  const rawValue = normalizeText(value)

  if (!rawValue) {
    return ""
  }

  const digits = rawValue.replace(/\D/g, "")
  const nationalNumber = digits.startsWith("51") && digits.length > 9
    ? digits.slice(2)
    : digits

  return nationalNumber.slice(0, 9)
}

export function formatPeruPhoneDigits(value) {
  const digits = normalizePeruPhoneDigits(value)
  const firstBlock = digits.slice(0, 3)
  const secondBlock = digits.slice(3, 6)
  const thirdBlock = digits.slice(6, 9)

  return [firstBlock, secondBlock, thirdBlock].filter(Boolean).join(" ")
}

export function normalizePeruPhone(value) {
  const digits = normalizePeruPhoneDigits(value)

  if (!digits) {
    return ""
  }

  return `+51 ${formatPeruPhoneDigits(digits)}`
}

export function isValidPeruPhone(value) {
  return /^9\d{8}$/.test(normalizePeruPhoneDigits(value))
}

export function isStrongPassword(value) {
  const password = String(value ?? "")

  if (password.length < 8 || password.length > 72) {
    return false
  }

  return (
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}

export function validateUserForm(formData, { isEditMode = false } = {}) {
  const errors = {}

  if (!isValidPersonName(formData.nombres)) {
    errors.nombres =
      "El nombre solo puede contener letras, espacios, apóstrofe o guion."
  }

  if (!isValidPersonName(formData.apellidos)) {
    errors.apellidos =
      "El apellido solo puede contener letras, espacios, apóstrofe o guion."
  }

  if (!isValidEmail(formData.email)) {
    errors.email = "Debe ingresar un correo válido."
  }

  if (!isValidUsername(formData.username)) {
    errors.username =
      "El usuario debe tener 4 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo."
  }

  if (formData.celular && !isValidPeruPhone(formData.celular)) {
    errors.celular = "El celular debe tener el formato +51 999 888 777."
  }

  if (!normalizeRoleId(formData.id_rol)) {
    errors.id_rol = "Debe seleccionar un rol."
  }

  if (!isEditMode && !isStrongPassword(formData.password)) {
    errors.password =
      "La contraseña debe tener 8 a 72 caracteres e incluir mayúscula, minúscula, número y símbolo."
  }

  return errors
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0
}
