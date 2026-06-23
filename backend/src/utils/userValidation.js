// backend/src/utils/userValidation.js

const PERSON_NAME_PATTERN =
  /^(?!.*\s{2,})(?!.*['-]{2,})[\p{L}]+(?:[ '-][\p{L}]+)*$/u

const USERNAME_PATTERN =
  /^(?![._-])(?!.*[._-]{2})(?!.*[._-]$)[a-z0-9._-]{4,30}$/

const PERU_PHONE_PATTERN = /^\+51 9\d{2} \d{3} \d{3}$/

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

function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

function normalizePersonName(value) {
  return normalizeText(value)
}

function isValidPersonName(value) {
  const normalizedValue = normalizePersonName(value)

  if (normalizedValue.length < 2 || normalizedValue.length > 60) {
    return false
  }

  return PERSON_NAME_PATTERN.test(normalizedValue)
}

function normalizeEmail(value) {
  return normalizeText(value).toLowerCase()
}

function normalizeUsername(value) {
  return normalizeText(value).toLowerCase()
}

function isValidUsername(value) {
  const normalizedValue = normalizeUsername(value)

  if (!USERNAME_PATTERN.test(normalizedValue)) {
    return false
  }

  return !RESERVED_USERNAMES.has(normalizedValue)
}

function normalizePeruPhone(value) {
  const rawValue = normalizeText(value)

  if (!rawValue) {
    return null
  }

  const digits = rawValue.replace(/\D/g, "")
  const nationalNumber =
    digits.length === 11 && digits.startsWith("51")
      ? digits.slice(2)
      : digits

  if (!/^9\d{8}$/.test(nationalNumber)) {
    return null
  }

  return `+51 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(
    3,
    6,
  )} ${nationalNumber.slice(6)}`
}

function isValidPeruPhone(value) {
  const normalizedValue = normalizePeruPhone(value)

  return Boolean(normalizedValue && PERU_PHONE_PATTERN.test(normalizedValue))
}

function isStrongPassword(value) {
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

function createBusinessError(message, statusCode = 400) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

module.exports = {
  PERSON_NAME_PATTERN,
  PERU_PHONE_PATTERN,
  USERNAME_PATTERN,
  createBusinessError,
  isStrongPassword,
  isValidPersonName,
  isValidPeruPhone,
  isValidUsername,
  normalizeEmail,
  normalizePersonName,
  normalizePeruPhone,
  normalizeText,
  normalizeUsername,
}