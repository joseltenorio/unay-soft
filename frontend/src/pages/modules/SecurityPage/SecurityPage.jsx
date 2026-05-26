// src/pages/modules/SecurityPage/SecurityPage.jsx

import { useEffect, useMemo, useState } from "react"

import {
  Filter,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

import useToast from "../../../components/common/Toast/useToast"

import { getRoles } from "../../../services/roleService"
import {
  createUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "../../../services/userService"

import UserForm from "./UserForm"

import "./SecurityPage.css"

const PAGE_SIZE = 8

function formatShortDate(value, fallback = "Sin registro") {
  if (!value) {
    return fallback
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return fallback
  }

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

function getUserFullName(user) {
  return `${user.nombres || ""} ${user.apellidos || ""}`.trim() || "Usuario"
}

function getUserInitials(user) {
  const names = [user.nombres, user.apellidos]
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(" ")
    .filter(Boolean)

  if (names.length === 0) {
    return "U"
  }

  return names
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("")
}

export default function SecurityPage() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])

  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRole, setSelectedRole] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const [formMode, setFormMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { showToast } = useToast()

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
        error.message || "No se pudo cargar la información de usuarios.",
      )
    }
  }

  useEffect(() => {
    loadSecurityData()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRole, selectedStatus])

  const summary = useMemo(() => {
    const activeUsers = users.filter((user) => user.estado).length
    const inactiveUsers = users.length - activeUsers

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return users.filter((user) => {
      const fullName = getUserFullName(user).toLowerCase()

      const matchesSearch =
        !normalizedSearch ||
        fullName.includes(normalizedSearch) ||
        user.email?.toLowerCase().includes(normalizedSearch) ||
        user.username?.toLowerCase().includes(normalizedSearch) ||
        user.rol?.toLowerCase().includes(normalizedSearch)

      const matchesRole =
        selectedRole === "all" || String(user.id_rol) === String(selectedRole)

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && user.estado) ||
        (selectedStatus === "inactive" && !user.estado)

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, selectedRole, selectedStatus])

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredUsers, currentPage])

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

        showToast({
          type: "success",
          title: "Usuario actualizado",
          message: "Los datos del usuario se guardaron correctamente.",
        })
      } else {
        await createUser(payload)

        showToast({
          type: "success",
          title: "Usuario creado",
          message: "El nuevo usuario fue registrado correctamente.",
        })
      }

      await loadSecurityData()
      handleCloseForm()
    } catch (error) {
      const message = error.message || "No se pudo guardar el usuario."

      setFormError(message)

      showToast({
        type: "error",
        title: "No se pudo guardar",
        message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleToggleStatus(user) {
    const nextStatus = !user.estado
    const actionLabel = nextStatus ? "activar" : "desactivar"

    const confirmed = window.confirm(
      `¿Deseas ${actionLabel} al usuario ${getUserFullName(user)}?`,
    )

    if (!confirmed) {
      return
    }

    try {
      setErrorMessage("")

      await updateUserStatus(user.id_usuario, nextStatus)
      await loadSecurityData()

      showToast({
        type: "success",
        title: nextStatus ? "Usuario activado" : "Usuario desactivado",
        message: `${getUserFullName(user)} fue ${
          nextStatus ? "activado" : "desactivado"
        } correctamente.`,
      })
    } catch (error) {
      const message =
        error.message || "No se pudo actualizar el estado del usuario."

      setStatus("error")
      setErrorMessage(message)

      showToast({
        type: "error",
        title: "No se pudo actualizar",
        message,
      })
    }
  }

  function handleClearFilters() {
    setSearchTerm("")
    setSelectedRole("all")
    setSelectedStatus("all")
  }

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  const isFormOpen = Boolean(formMode)
  const hasActiveFilters =
    searchTerm.trim() || selectedRole !== "all" || selectedStatus !== "all"

  return (
    <main className="security-page">
      <section className="security-page__shell">
        <header className="security-page__header">
          <div className="security-page__title-group">
            <div className="security-page__title-icon" aria-hidden="true">
              <UsersRound size={21} strokeWidth={2.2} />
            </div>

            <div>
              <h1>Gestión de usuarios</h1>
              <p>
                Administra al personal interno, sus roles operativos y el estado
                de acceso al sistema.
              </p>
            </div>
          </div>

          <button
            className="security-page__primary-button"
            type="button"
            onClick={handleOpenCreateForm}
            disabled={status === "loading"}
          >
            <Plus size={16} strokeWidth={2.4} />
            Nuevo usuario
          </button>
        </header>

        <section className="security-page__metrics" aria-label="Resumen de usuarios">
          <article className="security-page__metric-card">
            <span>Total usuarios</span>
            <strong>{summary.totalUsers}</strong>
          </article>

          <article className="security-page__metric-card">
            <span>Activos</span>
            <strong>{summary.activeUsers}</strong>
          </article>

          <article className="security-page__metric-card">
            <span>Inactivos</span>
            <strong>{summary.inactiveUsers}</strong>
          </article>
        </section>

        <section className="security-page__panel">
          <div className="security-page__panel-top">
            <div>
              <h2>
                Todos los usuarios{" "}
                <span>{filteredUsers.length}</span>
              </h2>
              <p>
                Vista conectada al backend y protegida por permisos de gestión.
              </p>
            </div>

            <button
              className="security-page__ghost-button"
              type="button"
              onClick={loadSecurityData}
              disabled={status === "loading"}
            >
              <RefreshCw
                size={15}
                strokeWidth={2.3}
                className={status === "loading" ? "is-spinning" : ""}
              />
              Actualizar
            </button>
          </div>

          <div className="security-page__toolbar">
            <label className="security-page__search">
              <Search size={17} strokeWidth={2.2} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar por nombre, correo, usuario o rol"
                aria-label="Buscar usuarios"
              />
            </label>

            <div className="security-page__filters">
              <label className="security-page__filter">
                <Filter size={15} strokeWidth={2.2} aria-hidden="true" />
                <select
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value)}
                  aria-label="Filtrar por rol"
                >
                  <option value="all">Todos los roles</option>

                  {roles.map((role) => (
                    <option key={role.id_rol} value={role.id_rol}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label className="security-page__filter">
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(event.target.value)}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </label>

              {hasActiveFilters && (
                <button
                  className="security-page__clear-button"
                  type="button"
                  onClick={handleClearFilters}
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {isFormOpen && (
            <div className="security-page__modal-overlay">
              <div
                className="security-page__modal"
                onClick={(event) => event.stopPropagation()}
              >
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
              </div>
            </div>
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

          {status === "success" && users.length > 0 && filteredUsers.length === 0 && (
            <div className="security-page__state">
              No se encontraron usuarios con los filtros aplicados.
            </div>
          )}

          {status === "success" && filteredUsers.length > 0 && (
            <>
              <div className="security-page__table-card">
                <table className="security-page__table">
                  <thead>
                    <tr>
                      <th className="security-page__checkbox-cell">
                        <span className="security-page__fake-checkbox" />
                      </th>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Último acceso</th>
                      <th>Fecha de registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedUsers.map((user) => (
                      <tr key={user.id_usuario}>
                        <td className="security-page__checkbox-cell">
                          <span className="security-page__fake-checkbox" />
                        </td>

                        <td>
                          <div className="security-page__user-cell">
                            <span className="security-page__avatar">
                              {getUserInitials(user)}
                            </span>

                            <div>
                              <strong>{getUserFullName(user)}</strong>
                              <small>{user.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="security-page__role">
                            {user.rol || "Sin rol"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={
                              user.estado
                                ? "security-page__status security-page__status--active"
                                : "security-page__status security-page__status--inactive"
                            }
                          >
                            {user.estado ? "Activo" : "Inactivo"}
                          </span>
                        </td>

                        <td>
                          <span className="security-page__date">
                            {formatShortDate(user.ultimo_acceso_at, "Nunca")}
                          </span>
                        </td>

                        <td>
                          <span className="security-page__date">
                            {formatShortDate(user.created_at)}
                          </span>
                        </td>

                        <td>
                          <div className="security-page__actions">
                            <button
                              className="security-page__table-button"
                              type="button"
                              onClick={() => handleOpenEditForm(user)}
                            >
                              <Pencil size={14} strokeWidth={2.1} />
                              Editar
                            </button>

                            <button
                              className={
                                user.estado
                                  ? "security-page__table-button security-page__table-button--danger"
                                  : "security-page__table-button security-page__table-button--success"
                              }
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                            >
                              <Power size={14} strokeWidth={2.1} />
                              {user.estado ? "Desactivar" : "Activar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <footer className="security-page__pagination">
                <p>
                  Mostrando{" "}
                  <strong>{paginatedUsers.length}</strong> de{" "}
                  <strong>{filteredUsers.length}</strong> usuarios
                </p>

                <div className="security-page__pagination-actions">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={
                          currentPage === page
                            ? "security-page__page-button security-page__page-button--active"
                            : "security-page__page-button"
                        }
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ),
                  )}

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              </footer>
            </>
          )}
        </section>
      </section>
    </main>
  )
}