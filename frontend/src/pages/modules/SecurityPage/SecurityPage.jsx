// src/pages/modules/SecurityPage/SecurityPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react"

import {
  ChevronDown,
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

const ROW_HEIGHT = 58
const MIN_PAGE_SIZE = 4
const MAX_PAGE_SIZE = 10

function getRowsPerPage() {
  if (typeof window === "undefined") {
    return 8
  }

  const availableHeight = window.innerHeight - 355
  const rows = Math.floor(availableHeight / ROW_HEIGHT)

  return Math.max(MIN_PAGE_SIZE, Math.min(MAX_PAGE_SIZE, rows))
}

function formatShortDate(value, fallback = "Sin registro") {
  if (!value) return fallback

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return fallback

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
  const parts = [user.nombres, user.apellidos]
    .filter(Boolean)
    .join(" ")
    .trim()
    .split(" ")
    .filter(Boolean)

  if (parts.length === 0) return "U"

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
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
  const [pageSize, setPageSize] = useState(getRowsPerPage)

  const [formMode, setFormMode] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { showToast } = useToast()

  const loadSecurityData = useCallback(async ({ showLoading = true } = {}) => {
    try {
      if (showLoading) {
        setStatus("loading")
      }

      const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()])

      setUsers(usersData)
      setRoles(rolesData)
      setErrorMessage("")
      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage(
        error.message || "No se pudo cargar la información de usuarios.",
      )
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function fetchInitialSecurityData() {
      try {
        const [usersData, rolesData] = await Promise.all([getUsers(), getRoles()])

        if (!isMounted) return

        setUsers(usersData)
        setRoles(rolesData)
        setErrorMessage("")
        setStatus("success")
      } catch (error) {
        if (!isMounted) return

        setStatus("error")
        setErrorMessage(
          error.message || "No se pudo cargar la información de usuarios.",
        )
      }
    }

    fetchInitialSecurityData()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    function handleResize() {
      setPageSize(getRowsPerPage())
      setCurrentPage(1)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

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

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedUsers = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize

    return filteredUsers.slice(startIndex, startIndex + pageSize)
  }, [filteredUsers, activePage, pageSize])

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  function handleRoleChange(event) {
    setSelectedRole(event.target.value)
    setCurrentPage(1)
  }

  function handleStatusChange(event) {
    setSelectedStatus(event.target.value)
    setCurrentPage(1)
  }

  function handleClearFilters() {
    setSearchTerm("")
    setSelectedRole("all")
    setSelectedStatus("all")
    setCurrentPage(1)
  }

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

      await loadSecurityData({ showLoading: false })
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

    if (!confirmed) return

    try {
      await updateUserStatus(user.id_usuario, nextStatus)
      await loadSecurityData({ showLoading: false })

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

  function handlePreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1))
  }

  function handleNextPage() {
    setCurrentPage((page) => Math.min(totalPages, page + 1))
  }

  const hasActiveFilters =
    searchTerm.trim() || selectedRole !== "all" || selectedStatus !== "all"

  const isFormOpen = Boolean(formMode)

  return (
    <main className="security-page">
      <section className="security-page__shell">
        <header className="security-page__header">
          <div className="security-page__title-group">
            <span className="security-page__title-icon" aria-hidden="true">
              <UsersRound size={18} strokeWidth={2.2} />
            </span>

            <div>
              <h1>Gestión de usuarios</h1>
              <p>Administra usuarios, roles y accesos del personal interno.</p>
            </div>
          </div>
        </header>

        <section className="security-page__panel">
          <div className="security-page__panel-top">
            <div className="security-page__panel-heading">
              <h2>
                Todos los usuarios <span>{filteredUsers.length}</span>
              </h2>

              <div className="security-page__summary-inline" aria-label="Resumen">
                <span>Total {summary.totalUsers}</span>
                <span>Activos {summary.activeUsers}</span>
                <span>Inactivos {summary.inactiveUsers}</span>
              </div>
            </div>

            <div className="security-page__top-actions">
              <button
                className="security-page__ghost-button"
                type="button"
                onClick={() => loadSecurityData()}
                disabled={status === "loading"}
              >
                <RefreshCw
                  size={15}
                  strokeWidth={2.3}
                  className={status === "loading" ? "is-spinning" : ""}
                />
                Actualizar
              </button>

              <button
                className="security-page__primary-button"
                type="button"
                onClick={handleOpenCreateForm}
                disabled={status === "loading"}
              >
                <Plus size={15} strokeWidth={2.4} />
                Nuevo usuario
              </button>
            </div>
          </div>

          <div className="security-page__toolbar">
            <label className="security-page__search">
              <Search size={17} strokeWidth={2.2} aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Buscar por nombre, correo, usuario o rol"
                aria-label="Buscar usuarios"
              />
            </label>

            <div className="security-page__filters">
              <label className="security-page__filter">
                <Filter size={15} strokeWidth={2.2} aria-hidden="true" />

                <select
                  value={selectedRole}
                  onChange={handleRoleChange}
                  aria-label="Filtrar por rol"
                >
                  <option value="all">Todos los roles</option>

                  {roles.map((role) => (
                    <option key={role.id_rol} value={role.id_rol}>
                      {role.nombre}
                    </option>
                  ))}
                </select>

                <ChevronDown size={15} strokeWidth={2.3} aria-hidden="true" />
              </label>

              <label className="security-page__filter">
                <ShieldCheck size={15} strokeWidth={2.2} aria-hidden="true" />

                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  aria-label="Filtrar por estado"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>

                <ChevronDown size={15} strokeWidth={2.3} aria-hidden="true" />
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
              <div className="security-page__modal">
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
                  <colgroup>
                    <col className="security-page__col-check" />
                    <col className="security-page__col-user" />
                    <col className="security-page__col-role" />
                    <col className="security-page__col-status" />
                    <col className="security-page__col-last" />
                    <col className="security-page__col-created" />
                    <col className="security-page__col-actions" />
                  </colgroup>

                  <thead>
                    <tr>
                      <th>
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
                        <td>
                          <span className="security-page__fake-checkbox" />
                        </td>

                        <td>
                          <div className="security-page__user-cell">
                            <span className="security-page__avatar">
                              {getUserInitials(user)}
                            </span>

                            <div className="security-page__user-copy">
                              <strong title={getUserFullName(user)}>
                                {getUserFullName(user)}
                              </strong>
                              <small title={user.email}>{user.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="security-page__role" title={user.rol}>
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
                              <span>Editar</span>
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
                              <span>{user.estado ? "Desactivar" : "Activar"}</span>
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
                  Mostrando <strong>{paginatedUsers.length}</strong> de{" "}
                  <strong>{filteredUsers.length}</strong> usuarios
                </p>

                <div className="security-page__pagination-actions">
                  <button
                    type="button"
                    onClick={handlePreviousPage}
                    disabled={activePage === 1}
                  >
                    Anterior
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={
                          activePage === page
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
                    disabled={activePage === totalPages}
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