// backend/src/validators/auth.validator.js

const { z } = require("zod")

const booleanLikeSchema = z.preprocess((value) => {
  if (value === "true") return true
  if (value === "false") return false

  return value
}, z.boolean())

const loginSchema = z
  .object({
    identifier: z
      .string({
        required_error: "Debe ingresar usuario o correo.",
        invalid_type_error: "El usuario o correo debe ser texto.",
      })
      .trim()
      .min(3, "El usuario o correo debe tener al menos 3 caracteres.")
      .max(120, "El usuario o correo no debe superar 120 caracteres."),

    password: z
      .string({
        required_error: "Debe ingresar contraseña.",
        invalid_type_error: "La contraseña debe ser texto.",
      })
      .min(1, "Debe ingresar contraseña.")
      .max(128, "La contraseña no debe superar 128 caracteres."),

    remember: booleanLikeSchema.optional().default(false),
  })
  .strict({
    message: "La solicitud contiene campos no permitidos.",
  })

const refreshSchema = z
  .object({
    refreshToken: z
      .string({
        required_error: "Refresh token no enviado.",
        invalid_type_error: "El refresh token debe ser texto.",
      })
      .trim()
      .min(40, "Refresh token inválido.")
      .max(300, "Refresh token inválido."),
  })
  .strict({
    message: "La solicitud contiene campos no permitidos.",
  })

module.exports = {
  loginSchema,
  refreshSchema,
}