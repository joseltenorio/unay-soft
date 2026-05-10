// src/pages/modules/SecurityPage/SecurityPage.jsx

import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { getRoles } from "../../../services/roleService"
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../../../services/userService"
import UserForm from "./UserForm"

import "./SecurityPage.css"

function formatDate(value) {
  if (!value) {
    return "Sin registro"
  }

  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export default function SecurityPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])

  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const [formMode, setFormMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadSecurityData() {
    try {
      setStatus("loading")
      setErrorMessage("")

      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()])

      setUsers(usersData)
      setRoles(rolesData)
      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error.message || "No se pudo cargar la información de seguridad.",
      )
    }
  }

  useEffect(() => {
    loadSecurityData()
  }, [])

  const summary = useMemo(() => {
    const activeUsers = users.filter((user) => user.estado).length
    const inactiveUsers = users.length - activeUsers
    const foundRoles = new Set(users.map((user) => user.rol).filter(Boolean))

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      totalRoles: foundRoles.size,
    }
  }, [users])

  function handleOpenCreateForm() {
    setFormMode("create")
    setSelectedUser(null)
    setFormError("")
  }

  function handleOpenEditForm(user) {
    setFormMode("edit")
    setSelectedUser(user)
    setFormError("")
  }

  function handleCloseForm() {
    setFormMode(null)
    setSelectedUser(null)
    setFormError("")
    setIsSubmitting(false)
  }

  async function handleSubmitUser(payload) {
    try {
      setIsSubmitting(true)
      setFormError("")

      if (formMode === "edit" && selectedUser) {
        await updateUser(selectedUser.id_usuario, payload)
      } else {
        await createUser(payload)
      }

      await loadSecurityData()
      handleCloseForm()
    } catch (error) {
      setFormError(error.message || "No se pudo guardar el usuario.")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleStatus(user) {
    const nextStatus = !user.estado
    const actionLabel = nextStatus ? "activar" : "desactivar"

    const confirmed = window.confirm(
      `¿Deseas ${actionLabel} al usuario ${user.nombres} ${user.apellidos}?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage("")

      await updateUserStatus(user.id_usuario, nextStatus)
      await loadSecurityData()
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error.message || "No se pudo actualizar el estado del usuario.",
      )
    }
  }

  const isFormOpen = Boolean(formMode)

  return (
    <main className="security-page">
      <section className="security-page__shell">
        <header className="security-page__header">
          <div>
            <p className="security-page__eyebrow">Seguridad</p>
            <h1>Mantenimiento de usuarios</h1>
            <p>
              Administra usuarios internos, roles asignados, estado de acceso y
              datos principales del personal autorizado.
            </p>
          </div>

          <Link className="security-page__back" to="/app">
            Volver al inicio interno
          </Link>
        </header>

        <section className="security-page__summary" aria-label="Resumen de usuarios">
          <article>
            <span>Total usuarios</span>
            <strong>{summary.totalUsers}</strong>
          </article>

          <article>
            <span>Usuarios activos</span>
            <strong>{summary.activeUsers}</strong>
          </article>

          <article>
            <span>Usuarios inactivos</span>
            <strong>{summary.inactiveUsers}</strong>
          </article>

          <article>
            <span>Roles encontrados</span>
            <strong>{summary.totalRoles}</strong>
          </article>
        </section>

        <section className="security-page__panel">
          <div className="security-page__panel-header">
            <div>
              <h2>Usuarios del sistema</h2>
              <p>
                Esta vista está disponible para usuarios con permiso de gestión
                de seguridad.
              </p>
            </div>

            <button
              className="security-page__new-button"
              type="button"
              onClick={handleOpenCreateForm}
              disabled={status === "loading"}
            >
              + Nuevo usuario
            </button>
          </div>

          {isFormOpen && (
            <UserForm
              key={selectedUser?.id_usuario || "create"}
              mode={formMode}
              roles={roles}
              initialUser={selectedUser}
              isSubmitting={isSubmitting}
              errorMessage={formError}
              onCancel={handleCloseForm}
              onSubmit={handleSubmitUser}
            />
          )}

          {status === "loading" && (
            <div className="security-page__state">Cargando usuarios...</div>
          )}

          {status === "error" && (
            <div className="security-page__state security-page__state--error">
              {errorMessage}
            </div>
          )}

          {status === "success" && users.length === 0 && (
            <div className="security-page__state">
              No hay usuarios registrados.
            </div>
          )}

          {status === "success" && users.length > 0 && (
            <div className="security-page__table-wrapper">
              <table className="security-page__table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Último acceso</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id_usuario}>
                      <td>
                        <strong>
                          {user.nombres} {user.apellidos}
                        </strong>
                        <span>{user.establecimiento}</span>
                      </td>

                      <td>{user.email}</td>
                      <td>{user.username}</td>
                      <td>{user.rol}</td>

                      <td>
                        <span
                          className={
                            user.estado
                              ? "security-page__badge security-page__badge--active"
                              : "security-page__badge security-page__badge--inactive"
                          }
                        >
                          {user.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>

                      <td>{formatDate(user.ultimo_acceso_at)}</td>

                      <td>
                        <div className="security-page__actions">
                          <button
                            className="security-page__action-button"
                            type="button"
                            onClick={() => handleOpenEditForm(user)}
                          >
                            Editar
                          </button>

                          <button
                            className={
                              user.estado
                                ? "security-page__action-button security-page__action-button--danger"
                                : "security-page__action-button security-page__action-button--success"
                            }
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                          >
                            {user.estado ? "Desactivar" : "Activar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  )
}