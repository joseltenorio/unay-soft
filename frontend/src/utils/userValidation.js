// frontend/src/utils/userValidation.js

const PERSON_NAME_PATTERN =
  /^(?!.*['-]{2,})[\p{L}]+(?:[ '-][\p{L}]+)*$/u

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
  return normalizeText(value).toUpperCase()
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
  const nationalNumber =
    digits.startsWith("51") ? digits.slice(2) : digits

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

function validatePersonName(value, fieldLabel) {
  const normalized = normalizePersonName(value)

  if (!normalized) {
    return `El ${fieldLabel} es obligatorio.`
  }

  if (normalized.length < 2 || normalized.length > 60) {
    return `El ${fieldLabel} debe tener entre 2 y 60 caracteres.`
  }

  if (/^['-]/.test(normalized)) {
    return `El ${fieldLabel} no puede empezar con guion o apóstrofe.`
  }

  if (/['-]$/.test(normalized)) {
    return `El ${fieldLabel} no puede terminar con guion o apóstrofe.`
  }

  if (/['-]{2,}/.test(normalized)) {
    return `El ${fieldLabel} no puede tener guiones o apóstrofes consecutivos.`
  }

  if (!PERSON_NAME_PATTERN.test(normalized)) {
    return `El ${fieldLabel} solo puede contener letras, espacios, apóstrofe o guion.`
  }

  return null
}

function validateUsername(value) {
  const normalized = normalizeUsername(value)

  if (!normalized) {
    return "El usuario es obligatorio."
  }

  if (normalized.length < 4 || normalized.length > 30) {
    return "El usuario debe tener entre 4 y 30 caracteres."
  }

  if (/^[._-]/.test(normalized)) {
    return "El usuario no puede empezar con punto, guion o guion bajo."
  }

  if (/[._-]$/.test(normalized)) {
    return "El usuario no puede terminar con punto, guion o guion bajo."
  }

  if (/[._-]{2,}/.test(normalized)) {
    return "El usuario no puede tener puntos, guiones o guiones bajos consecutivos."
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return "Este nombre de usuario no está disponible."
  }

  if (!USERNAME_PATTERN.test(normalized)) {
    return "El usuario solo puede contener letras, números, punto, guion o guion bajo."
  }

  return null
}

export function validateUserForm(formData, { isEditMode = false } = {}) {
  const errors = {}

  const nombresError = validatePersonName(formData.nombres, "nombre")
  if (nombresError) errors.nombres = nombresError

  const apellidosError = validatePersonName(formData.apellidos, "apellido")
  if (apellidosError) errors.apellidos = apellidosError

  if (!isValidEmail(formData.email)) {
    errors.email = "Debe ingresar un correo válido."
  }

  const usernameError = validateUsername(formData.username)
  if (usernameError) errors.username = usernameError

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
  return Object.values(errors).some((error) => error !== undefined)
}