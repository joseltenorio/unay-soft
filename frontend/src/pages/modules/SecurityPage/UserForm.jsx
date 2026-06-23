// src/pages/modules/SecurityPage/UserForm.jsx

import { useEffect, useMemo, useState } from "react"

import {
  hasValidationErrors,
  normalizeEmail,
  normalizePersonName,
  normalizePeruPhone,
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

function getInitialFormState(mode, initialUser) {
  if (mode === "edit" && initialUser) {
    return {
      nombres: initialUser.nombres || "",
      apellidos: initialUser.apellidos || "",
      email: initialUser.email || "",
      username: initialUser.username || "",
      celular: initialUser.celular || "",
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

function getFieldHintId(fieldName) {
  return `user-form-${fieldName}-hint`
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
  const [touchedFields, setTouchedFields] = useState({})

  const visibleFieldErrors = useMemo(() => {
    return Object.entries(fieldErrors).reduce((errors, [fieldName, message]) => {
      if (touchedFields[fieldName] || touchedFields.__submitted) {
        errors[fieldName] = message
      }

      return errors
    }, {})
  }, [fieldErrors, touchedFields])

  useEffect(() => {
    let isMounted = true

    const resetFormId = window.setTimeout(() => {
      if (!isMounted) {
        return
      }

      setFormData(getInitialFormState(mode, initialUser))
      setFieldErrors({})
      setTouchedFields({})
    }, 0)

    return () => {
      isMounted = false
      window.clearTimeout(resetFormId)
    }
  }, [mode, initialUser])

  function markFieldAsTouched(fieldName) {
    setTouchedFields((currentFields) => ({
      ...currentFields,
      [fieldName]: true,
    }))
  }

  function updateValidation(nextFormData) {
    setFieldErrors(validateUserForm(nextFormData, { isEditMode }))
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => {
      let nextValue = type === "checkbox" ? checked : value

      if (name === "celular") {
        nextValue = normalizePeruPhone(value)
      }

      if (name === "username") {
        nextValue = normalizeUsername(value)
      }

      const nextData = {
        ...currentData,
        [name]: nextValue,
      }

      updateValidation(nextData)

      return nextData
    })
  }

  function handleBlur(event) {
    const { name } = event.target

    markFieldAsTouched(name)

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
        nextData.celular = normalizePeruPhone(currentData.celular)
      }

      updateValidation(nextData)

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
      id_rol: formData.id_rol,
      estado: formData.estado,
    }

    if (!isEditMode) {
      normalizedPayload.password = formData.password
    }

    const errors = validateUserForm(normalizedPayload, { isEditMode })

    setFieldErrors(errors)
    setTouchedFields((currentFields) => ({
      ...currentFields,
      __submitted: true,
    }))

    if (hasValidationErrors(errors)) {
      return
    }

    onSubmit({
      ...normalizedPayload,
      celular: normalizedPayload.celular || null,
    })
  }

  function getFieldProps(fieldName, hintId = null) {
    const error = visibleFieldErrors[fieldName]
    const describedBy = [hintId, error ? getFieldErrorId(fieldName) : null]
      .filter(Boolean)
      .join(" ")

    return {
      "aria-invalid": error ? "true" : "false",
      "aria-describedby": describedBy || undefined,
      onBlur: handleBlur,
    }
  }

  function renderFieldError(fieldName) {
    const error = visibleFieldErrors[fieldName]

    if (!error) {
      return null
    }

    return (
      <small className="user-form__field-error" id={getFieldErrorId(fieldName)}>
        {error}
      </small>
    )
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

      {errorMessage && (
        <div className="user-form__error" role="alert">
          {errorMessage}
        </div>
      )}

      {hasValidationErrors(visibleFieldErrors) && (
        <div className="user-form__error" role="alert">
          Revisa los campos marcados antes de guardar el usuario.
        </div>
      )}

      <form className="user-form__body" onSubmit={handleSubmit} noValidate>
        <div className="user-form__grid">
          <label className="user-form__field">
            <span>Nombres</span>
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
            {renderFieldError("nombres")}
          </label>

          <label className="user-form__field">
            <span>Apellidos</span>
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
            {renderFieldError("apellidos")}
          </label>

          <label className="user-form__field">
            <span>Correo</span>
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
            {renderFieldError("email")}
          </label>

          <label className="user-form__field">
            <span>Usuario</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="usuario.umari"
              autoComplete="username"
              required
              {...getFieldProps("username", getFieldHintId("username"))}
            />
            <small className="user-form__hint" id={getFieldHintId("username")}>
              Usa 4 a 30 caracteres: letras minúsculas, números, punto, guion o
              guion bajo.
            </small>
            {renderFieldError("username")}
          </label>

          <label className="user-form__field">
            <span>Celular</span>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="+51 999 888 777"
              autoComplete="tel"
              inputMode="numeric"
              {...getFieldProps("celular", getFieldHintId("celular"))}
            />
            <small className="user-form__hint" id={getFieldHintId("celular")}>
              Opcional. Debe iniciar con 9 y guardarse como +51 999 888 777.
            </small>
            {renderFieldError("celular")}
          </label>

          <label className="user-form__field">
            <span>Rol</span>
            <select
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              onBlur={handleBlur}
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
            {renderFieldError("id_rol")}
          </label>

          {!isEditMode && (
            <label className="user-form__field user-form__field--full">
              <span>Contraseña temporal</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ej. Caja123*"
                autoComplete="new-password"
                required
                {...getFieldProps("password", getFieldHintId("password"))}
              />
              <small className="user-form__hint" id={getFieldHintId("password")}>
                Debe incluir mayúscula, minúscula, número y símbolo.
              </small>
              {renderFieldError("password")}
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