// backend/src/utils/jwt.js

const jwt = require("jsonwebtoken")
require("dotenv").config()

function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "2h",
  })
}

function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
  generateToken,
  verifyToken,
}