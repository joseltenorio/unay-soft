// backend/src/middlewares/validate.middleware.js

function getIssueMessage(issue) {
  if (issue.code === "unrecognized_keys") {
    return "La solicitud contiene campos no permitidos."
  }

  if (issue.code === "invalid_type" && issue.received === "undefined") {
    return "Faltan campos obligatorios en la solicitud."
  }

  return issue.message || "La solicitud contiene datos inválidos."
}

function getIssueField(issue) {
  if (issue.path.length > 0) {
    return issue.path.join(".")
  }

  if (issue.keys?.length > 0) {
    return issue.keys.join(", ")
  }

  return ""
}

function buildValidationResponse(result, res) {
  const errors = result.error.issues.map((issue) => ({
    field: getIssueField(issue),
    message: getIssueMessage(issue),
  }))

  return res.status(400).json({
    message: errors[0]?.message || "La solicitud contiene datos inválidos.",
    errors,
  })
}

function validateBody(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return buildValidationResponse(result, res)
    }

    req.body = result.data

    next()
  }
}

function validateParams(schema) {
  return function (req, res, next) {
    const result = schema.safeParse(req.params)

    if (!result.success) {
      return buildValidationResponse(result, res)
    }

    req.params = result.data

    next()
  }
}

module.exports = {
  validateBody,
  validateParams,
}