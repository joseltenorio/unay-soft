// src/pages/modules/SecurityPage/UserForm.jsx

import { useEffect, useState } from "react"

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

  useEffect(() => {
    setFormData(getInitialFormState(mode, initialUser))
  }, [mode, initialUser])

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    setFormData((currentData) => ({
      ...currentData,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const payload = {
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      email: formData.email.trim().toLowerCase(),
      username: formData.username.trim().toLowerCase(),
      celular: formData.celular.trim(),
      id_rol: formData.id_rol,
      estado: formData.estado,
    }

    if (!isEditMode) {
      payload.password = formData.password
    }

    onSubmit(payload)
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

      <form className="user-form__body" onSubmit={handleSubmit}>
        <div className="user-form__grid">
          <label className="user-form__field">
            <span>Nombres</span>
            <input
              type="text"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              placeholder="Ej. Carlos"
              required
            />
          </label>

          <label className="user-form__field">
            <span>Apellidos</span>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              placeholder="Ej. Paredes Rojas"
              required
            />
          </label>

          <label className="user-form__field">
            <span>Correo</span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@umari.pe"
              required
            />
          </label>

          <label className="user-form__field">
            <span>Usuario</span>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="usuario.umari"
              required
            />
          </label>

          <label className="user-form__field">
            <span>Celular</span>
            <input
              type="text"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="+51 999 888 777"
            />
          </label>

          <label className="user-form__field">
            <span>Rol</span>
            <select
              name="id_rol"
              value={formData.id_rol}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un rol</option>

              {roles.map((role) => (
                <option key={role.id_rol} value={role.id_rol}>
                  {role.nombre}
                </option>
              ))}
            </select>
          </label>

          {!isEditMode && (
            <label className="user-form__field user-form__field--full">
              <span>Contraseña temporal</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
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