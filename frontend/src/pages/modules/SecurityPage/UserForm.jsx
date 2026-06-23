// src/pages/modules/SecurityPage/UserForm.jsx

import { useEffect, useState } from "react"

import {
  formatPeruPhoneDigits,
  hasValidationErrors,
  normalizeEmail,
  normalizePersonName,
  normalizePeruPhone,
  normalizePeruPhoneDigits,
  normalizeRoleId,
  normalizeUsername,
  validateUserForm,
} from "../../../utils/userValidation"

import "./UserForm.css"

const emptyFormState = {
  nombres: "",
  apellidos: "",
  email: "",
  username: "",
  celular: "",
  id_rol: "",
  password: "",
  estado: true,
}

const fieldHelp = {
  nombres: "Solo letras, espacios, apóstrofe o guion.",
  apellidos: "Solo letras, espacios, apóstrofe o guion.",
  email: "Debe tener formato usuario@dominio.com.",
  username:
    "Usa 4 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo.",
  celular: "Ingrese 9 dígitos si desea registrar celular.",
  id_rol: "Seleccione un rol operativo activo.",
  password: "Debe incluir mayúscula, minúscula, número y símbolo.",
}

function getInitialFormState(mode, initialUser) {
  if (mode === "edit" && initialUser) {
    return {
      nombres: initialUser.nombres || "",
      apellidos: initialUser.apellidos || "",
      email: initialUser.email || "",
      username: initialUser.username || "",
      celular: normalizePeruPhoneDigits(initialUser.celular),
      id_rol: initialUser.id_rol || "",
      password: "",
      estado: Boolean(initialUser.estado),
    }
  }

  return emptyFormState
}

function getFieldErrorId(fieldName) {
  return `user-form-${fieldName}-error`
}

function getFieldHelpId(fieldName) {
  return `user-form-${fieldName}-help`
}

function FieldHelp({ fieldName, errors }) {
  const error = errors[fieldName]

  return (
    <small
      className={error ? "user-form__field-error" : "user-form__hint"}
      id={error ? getFieldErrorId(fieldName) : getFieldHelpId(fieldName)}
    >
      {error || fieldHelp[fieldName]}
    </small>
  )
}

export default function UserForm({
  mode = "create",
  roles = [],
  initialUser = null,
  isSubmitting = false,
  errorMessage = "",
  onCancel,
  onSubmit,
}) {
  const isEditMode = mode === "edit"

  const [formData, setFormData] = useState(() =>
    getInitialFormState(mode, initialUser),
  )
  const [fieldErrors, setFieldErrors] = useState({})
  const [wasSubmitted, setWasSubmitted] = useState(false)

  const visibleFieldErrors = wasSubmitted ? fieldErrors : {}
  const hasVisibleErrors = hasValidationErrors(visibleFieldErrors)

  useEffect(() => {
    let isMounted = true

    const resetFormId = window.setTimeout(() => {
      if (!isMounted) {
        return
      }

      setFormData(getInitialFormState(mode, initialUser))
      setFieldErrors({})
      setWasSubmitted(false)
    }, 0)

    return () => {
      isMounted = false
      window.clearTimeout(resetFormId)
    }
  }, [mode, initialUser])

  function validateOnlyAfterSubmit(nextFormData) {
    if (!wasSubmitted) {
      return
    }

    setFieldErrors(validateUserForm(nextFormData, { isEditMode }))
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => {
      let nextValue = type === "checkbox" ? checked : value

      if (name === "celular") {
        nextValue = normalizePeruPhoneDigits(value)
      }

      if (name === "username") {
        nextValue = normalizeUsername(value)
      }

      if (name === "id_rol") {
        nextValue = normalizeRoleId(value)
      }

      const nextData = {
        ...currentData,
        [name]: nextValue,
      }

      validateOnlyAfterSubmit(nextData)

      return nextData
    })
  }

  function handleBlur(event) {
    const { name } = event.target

    setFormData((currentData) => {
      const nextData = {
        ...currentData,
      }

      if (name === "nombres") {
        nextData.nombres = normalizePersonName(currentData.nombres)
      }

      if (name === "apellidos") {
        nextData.apellidos = normalizePersonName(currentData.apellidos)
      }

      if (name === "email") {
        nextData.email = normalizeEmail(currentData.email)
      }

      if (name === "username") {
        nextData.username = normalizeUsername(currentData.username)
      }

      if (name === "celular") {
        nextData.celular = normalizePeruPhoneDigits(currentData.celular)
      }

      if (name === "id_rol") {
        nextData.id_rol = normalizeRoleId(currentData.id_rol)
      }

      validateOnlyAfterSubmit(nextData)

      return nextData
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const normalizedPayload = {
      nombres: normalizePersonName(formData.nombres),
      apellidos: normalizePersonName(formData.apellidos),
      email: normalizeEmail(formData.email),
      username: normalizeUsername(formData.username),
      celular: normalizePeruPhone(formData.celular),
      id_rol: normalizeRoleId(formData.id_rol),
      estado: formData.estado,
    }

    if (!isEditMode) {
      normalizedPayload.password = formData.password
    }

    const errors = validateUserForm(normalizedPayload, { isEditMode })

    setFormData((currentData) => ({
      ...currentData,
      nombres: normalizedPayload.nombres,
      apellidos: normalizedPayload.apellidos,
      email: normalizedPayload.email,
      username: normalizedPayload.username,
      celular: normalizePeruPhoneDigits(normalizedPayload.celular),
      id_rol: normalizedPayload.id_rol,
    }))
    setFieldErrors(errors)
    setWasSubmitted(true)

    if (hasValidationErrors(errors)) {
      return
    }

    onSubmit({
      ...normalizedPayload,
      celular: normalizedPayload.celular || null,
    })
  }

  function getFieldProps(fieldName) {
    const error = visibleFieldErrors[fieldName]

    return {
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": error
        ? getFieldErrorId(fieldName)
        : getFieldHelpId(fieldName),
      onBlur: handleBlur,
    }
  }

  return (
    <section className="user-form">
      <div className="user-form__header">
        <div>
          <p className="user-form__eyebrow">
            {isEditMode ? "Editar usuario" : "Nuevo usuario"}
          </p>

          <h2>
            {isEditMode
              ? "Actualizar datos del usuario"
              : "Registrar usuario interno"}
          </h2>

          <p>
            Completa la información del usuario y asigna un rol operativo dentro
            del sistema.
          </p>
        </div>

        <button
          className="user-form__close"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          aria-label="Cerrar formulario"
        >
          ×
        </button>
      </div>

      <div
        className={
          errorMessage || hasVisibleErrors
            ? "user-form__error"
            : "user-form__error user-form__error--empty"
        }
        role="alert"
        aria-hidden={!errorMessage && !hasVisibleErrors}
      >
        {errorMessage ||
          (hasVisibleErrors
            ? "Revisa los campos marcados antes de guardar el usuario."
            : "Sin errores")}
      </div>

      <form className="user-form__body" onSubmit={handleSubmit} noValidate>
        <div className="user-form__grid">
          <label className="user-form__field">
            <span>
              Nombres <strong>*</strong>
            </span>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej. José Luis"
              autoComplete="given-name"
              required
              {...getFieldProps("nombres")}
            />
            <FieldHelp fieldName="nombres" errors={visibleFieldErrors} />
          </label>

          <label className="user-form__field">
            <span>
              Apellidos <strong>*</strong>
            </span>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej. O'Connor Rojas"
              autoComplete="family-name"
              required
              {...getFieldProps("apellidos")}
            />
            <FieldHelp fieldName="apellidos" errors={visibleFieldErrors} />
          </label>

          <label className="user-form__field">
            <span>
              Correo <strong>*</strong>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@umari.pe"
              autoComplete="email"
              required
              {...getFieldProps("email")}
            />
            <FieldHelp fieldName="email" errors={visibleFieldErrors} />
          </label>

          <label className="user-form__field">
            <span>
              Usuario <strong>*</strong>
            </span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="usuario.umari"
              autoComplete="username"
              required
              {...getFieldProps("username")}
            />
            <FieldHelp fieldName="username" errors={visibleFieldErrors} />
          </label>

          <label className="user-form__field">
            <span>Celular</span>
            <div
              className={
                visibleFieldErrors.celular
                  ? "user-form__phone user-form__phone--invalid"
                  : "user-form__phone"
              }
            >
              <span className="user-form__phone-prefix">+51</span>
              <input
                type="tel"
                name="celular"
                value={formatPeruPhoneDigits(formData.celular)}
                onChange={handleChange}
                placeholder="999 888 777"
                autoComplete="tel-national"
                inputMode="numeric"
                maxLength={11}
                {...getFieldProps("celular")}
              />
            </div>
            <FieldHelp fieldName="celular" errors={visibleFieldErrors} />
          </label>

          <label className="user-form__field">
            <span>
              Rol <strong>*</strong>
            </span>
            <select
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              required
              {...getFieldProps("id_rol")}
            >
              <option value="">Seleccione un rol</option>

              {roles.map((role) => (
                <option key={role.id_rol} value={role.id_rol}>
                  {role.nombre}
                </option>
              ))}
            </select>
            <FieldHelp fieldName="id_rol" errors={visibleFieldErrors} />
          </label>

          {!isEditMode && (
            <label className="user-form__field user-form__field--full">
              <span>
                Contraseña temporal <strong>*</strong>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ej. Caja123*"
                autoComplete="new-password"
                required
                {...getFieldProps("password")}
              />
              <FieldHelp fieldName="password" errors={visibleFieldErrors} />
            </label>
          )}

          <label className="user-form__switch user-form__field--full">
            <input
              type="checkbox"
              name="estado"
              checked={formData.estado}
              onChange={handleChange}
            />
            <span />
            Usuario activo
          </label>
        </div>

        <div className="user-form__actions">
          <button
            className="user-form__button user-form__button--secondary"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            className="user-form__button user-form__button--primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEditMode
                ? "Guardar cambios"
                : "Crear usuario"}
          </button>
        </div>
      </form>
    </section>
  )
}
