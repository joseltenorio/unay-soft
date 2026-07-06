// frontend/src/utils/textNormalization.js

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
}

export function removeDiacritics(value) {
  return normalizeText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}

export function normalizeMetodoPago(value) {
  return removeDiacritics(value).toUpperCase()
}