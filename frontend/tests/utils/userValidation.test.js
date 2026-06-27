import { describe, it, expect } from "vitest"
import {
  normalizePersonName,
  isValidPersonName,
  normalizePeruPhoneDigits,
  isValidPeruPhone,
  isValidUsername,
  isStrongPassword,
  validateUserForm,
} from "@/utils/userValidation"

// describe agrupa pruebas relacionadas
// it describe qué debe pasar
// expect es la aserción: "espero que X sea Y"

describe("normalizePersonName", () => {
  it("convierte a mayúsculas", () => {
    expect(normalizePersonName("alejandra")).toBe("ALEJANDRA")
  })

  it("elimina espacios extremos", () => {
    expect(normalizePersonName("  jose  ")).toBe("JOSE")
  })

  it("normaliza apóstrofe tipográfico", () => {
    expect(normalizePersonName("O\u2019Connor")).toBe("O'CONNOR")
  })
})

describe("isValidPersonName", () => {
  it("acepta nombre simple", () => {
    expect(isValidPersonName("Alejandra")).toBe(true)
  })

  it("acepta nombre compuesto con guion", () => {
    expect(isValidPersonName("Jose-Manuel")).toBe(true)
  })

  it("acepta nombre con apóstrofe", () => {
    expect(isValidPersonName("O'Connor")).toBe(true)
  })

  it("rechaza nombre que empieza con guion", () => {
    expect(isValidPersonName("-Alejandra")).toBe(false)
  })

  it("rechaza nombre que termina con guion", () => {
    expect(isValidPersonName("Alejandra-")).toBe(false)
  })

  it("rechaza guiones consecutivos", () => {
    expect(isValidPersonName("Jose--Manuel")).toBe(false)
  })

  it("rechaza nombre vacío", () => {
    expect(isValidPersonName("")).toBe(false)
  })

  it("rechaza nombre con números", () => {
    expect(isValidPersonName("Jose123")).toBe(false)
  })
})

describe("normalizePeruPhoneDigits", () => {
  it("elimina código de país 51", () => {
    expect(normalizePeruPhoneDigits("51999888777")).toBe("999888777")
  })

  it("deja pasar número sin código de país", () => {
    expect(normalizePeruPhoneDigits("999888777")).toBe("999888777")
  })

  it("elimina espacios y caracteres no numéricos", () => {
    expect(normalizePeruPhoneDigits("999 888 777")).toBe("999888777")
  })

  it("retorna vacío si no hay valor", () => {
    expect(normalizePeruPhoneDigits("")).toBe("")
  })
})

describe("isValidPeruPhone", () => {
  it("acepta número válido", () => {
    expect(isValidPeruPhone("999888777")).toBe(true)
  })

  it("rechaza número que no empieza con 9", () => {
    expect(isValidPeruPhone("819888777")).toBe(false)
  })

  it("rechaza número con menos de 9 dígitos", () => {
    expect(isValidPeruPhone("9998887")).toBe(false)
  })
})

describe("isValidUsername", () => {
  it("acepta username válido", () => {
    expect(isValidUsername("usuario.umari")).toBe(true)
  })

  it("rechaza username reservado", () => {
    expect(isValidUsername("admin")).toBe(false)
  })

  it("rechaza username que empieza con punto", () => {
    expect(isValidUsername(".usuario")).toBe(false)
  })

  it("rechaza username que termina con guion", () => {
    expect(isValidUsername("usuario-")).toBe(false)
  })

  it("rechaza username con menos de 4 caracteres", () => {
    expect(isValidUsername("usr")).toBe(false)
  })
})

describe("isStrongPassword", () => {
  it("acepta contraseña fuerte", () => {
    expect(isStrongPassword("Caja123*")).toBe(true)
  })

  it("rechaza sin mayúscula", () => {
    expect(isStrongPassword("caja123*")).toBe(false)
  })

  it("rechaza sin símbolo", () => {
    expect(isStrongPassword("Caja1234")).toBe(false)
  })

  it("rechaza menos de 8 caracteres", () => {
    expect(isStrongPassword("Ca1*")).toBe(false)
  })
})

describe("validateUserForm", () => {
  const validPayload = {
    nombres: "Alejandra",
    apellidos: "Lopez",
    email: "ale@umari.pe",
    username: "ale.lopez",
    celular: "",
    id_rol: "2",
    password: "Caja123*",
  }

  it("no retorna errores con datos válidos", () => {
    const errors = validateUserForm(validPayload)
    expect(errors).toEqual({})
  })

  it("retorna error en nombres si empieza con guion", () => {
    const errors = validateUserForm({ ...validPayload, nombres: "-Alejandra" })
    expect(errors.nombres).toBeDefined()
  })

  it("retorna error en email inválido", () => {
    const errors = validateUserForm({ ...validPayload, email: "noesuncorreo" })
    expect(errors.email).toBeDefined()
  })

  it("no valida password en modo edit", () => {
    const errors = validateUserForm(
      { ...validPayload, password: "" },
      { isEditMode: true },
    )
    expect(errors.password).toBeUndefined()
  })

  it("valida password en modo create", () => {
    const errors = validateUserForm({ ...validPayload, password: "" })
    expect(errors.password).toBeDefined()
  })
})