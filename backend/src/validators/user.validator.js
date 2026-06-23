// backend/src/validators/user.validator.js

const { z } = require("zod")

const {
  isStrongPassword,
  isValidPersonName,
  isValidUsername,
  normalizeEmail,
  normalizePersonName,
  normalizePeruPhone,
  normalizeUsername,
} = require("../utils/userValidation")

const personNameSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? normalizePersonName(value) : value,
  z
    .string({
      required_error: "Debe ingresar un nombre válido.",
      invalid_type_error: "El nombre debe ser texto.",
    })
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(60, "El nombre no debe superar 60 caracteres.")
    .refine(isValidPersonName, {
      message:
        "El nombre solo puede contener letras, espacios, apóstrofe o guion.",
    }),
)

const lastNameSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? normalizePersonName(value) : value,
  z
    .string({
      required_error: "Debe ingresar un apellido válido.",
      invalid_type_error: "El apellido debe ser texto.",
    })
    .min(2, "El apellido debe tener al menos 2 caracteres.")
    .max(60, "El apellido no debe superar 60 caracteres.")
    .refine(isValidPersonName, {
      message:
        "El apellido solo puede contener letras, espacios, apóstrofe o guion.",
    }),
)

const emailSchema = z.preprocess(
  (value) => (typeof value === "string" ? normalizeEmail(value) : value),
  z
    .string({
      required_error: "Debe ingresar un correo.",
      invalid_type_error: "El correo debe ser texto.",
    })
    .email("Debe ingresar un correo válido.")
    .max(254, "El correo no debe superar 254 caracteres."),
)

const usernameSchema = z.preprocess(
  (value) =>
    typeof value === "string" ? normalizeUsername(value) : value,
  z
    .string({
      required_error: "Debe ingresar un nombre de usuario.",
      invalid_type_error: "El nombre de usuario debe ser texto.",
    })
    .min(4, "El nombre de usuario debe tener al menos 4 caracteres.")
    .max(30, "El nombre de usuario no debe superar 30 caracteres.")
    .refine(isValidUsername, {
      message:
        "El usuario solo puede contener letras minúsculas, números, punto, guion o guion bajo, y no puede ser reservado.",
    }),
)

const passwordSchema = z
  .string({
    required_error: "Debe ingresar una contraseña.",
    invalid_type_error: "La contraseña debe ser texto.",
  })
  .refine(isStrongPassword, {
    message:
      "La contraseña debe tener 8 a 72 caracteres e incluir mayúscula, minúscula, número y símbolo.",
  })

const phoneSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return null
  }

  if (typeof value === "string" && value.trim() === "") {
    return null
  }

  const normalizedPhone = normalizePeruPhone(value)

  return normalizedPhone || value
}, z.union([
  z
    .string({
      invalid_type_error: "El celular debe ser texto.",
    })
    .regex(
      /^\+51 9\d{2} \d{3} \d{3}$/,
      "El celular debe tener el formato +51 999 888 777.",
    ),
  z.null(),
]))

const POSTGRES_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const uuidSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string({
      required_error: "El identificador es obligatorio.",
      invalid_type_error: "El identificador debe ser texto.",
    })
    .regex(POSTGRES_UUID_PATTERN, "El identificador enviado no es válido."),
)

const createUserSchema = z
  .object({
    nombres: personNameSchema,
    apellidos: lastNameSchema,
    email: emailSchema,
    username: usernameSchema,
    password: passwordSchema,
    celular: phoneSchema.optional().default(null),
    id_rol: uuidSchema,
    estado: z.boolean().optional().default(true),
  })
  .strict({
    message: "La solicitud contiene campos no permitidos.",
  })

const updateUserSchema = z
  .object({
    nombres: personNameSchema,
    apellidos: lastNameSchema,
    email: emailSchema,
    username: usernameSchema,
    celular: phoneSchema.optional().default(null),
    id_rol: uuidSchema,
    estado: z.boolean().optional().default(true),
  })
  .strict({
    message: "La solicitud contiene campos no permitidos.",
  })

const updateUserStatusSchema = z
  .object({
    estado: z.boolean({
      required_error: "Debe enviar el estado del usuario.",
      invalid_type_error: "Debe enviar el estado del usuario como true o false.",
    }),
  })
  .strict({
    message: "La solicitud contiene campos no permitidos.",
  })

const userIdParamSchema = z
  .object({
    id: uuidSchema,
  })
  .strict({
    message: "La solicitud contiene parámetros no permitidos.",
  })

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  userIdParamSchema,
}
