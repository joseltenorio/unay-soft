// backend/src/services/etiqueta.service.js

const { pool } = require("../config/database")

async function getEtiquetas() {
  const { rows } = await pool.query(`
    SELECT id_etiqueta, nombre, tipo, color_etiqueta
    FROM etiqueta
    WHERE estado = true
    ORDER BY nombre ASC
  `)
  return rows
}

module.exports = { getEtiquetas }