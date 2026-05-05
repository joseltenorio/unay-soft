// backend/src/config/database.js

const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

async function testConnection() {
  try {
    const result = await pool.query("select now() as current_time")
    console.log("Database connected:", result.rows[0].current_time)
  } catch (error) {
    console.error("Database connection error:", error.message)
    process.exit(1)
  }
}

module.exports = {
  pool,
  testConnection,
}