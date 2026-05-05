const express = require("express")

const router = express.Router()

router.get("/status", (req, res) => {
  res.json({
    message: "Auth module active",
    status: "OK",
  })
})

module.exports = router