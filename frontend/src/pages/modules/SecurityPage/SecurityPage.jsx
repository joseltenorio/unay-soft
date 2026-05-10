// src/pages/modules/SecurityPage/SecurityPage.jsx

import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"

import { getUsers } from "../../../services/userService"

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
  const [status, setStatus] = useState("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function loadUsers() {
      try {
        setStatus("loading")
        setErrorMessage("")

        const usersData = await getUsers()

        setUsers(usersData)
        setStatus("success")
      } catch (error) {
        setStatus("error")
        setErrorMessage(
          error.message || "No se pudieron cargar los usuarios del sistema.",
        )
      }
    }

    loadUsers()
  }, [])

  const summary = useMemo(() => {
    const activeUsers = users.filter((user) => user.estado).length
    const roles = new Set(users.map((user) => user.rol).filter(Boolean))

    return {
      totalUsers: users.length,
      activeUsers,
      totalRoles: roles.size,
    }
  }, [users])

  return (
    <main className="security-page">
      <section className="security-page__shell">
        <header className="security-page__header">
          <div>
            <p className="security-page__eyebrow">Seguridad</p>
            <h1>Mantenimiento de usuarios</h1>
            <p>
              Consulta los usuarios registrados, sus roles, estado de acceso y
              último ingreso al sistema.
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
            <span>Roles registrados</span>
            <strong>{summary.totalRoles}</strong>
          </article>
        </section>

        <section className="security-page__panel">
          <div className="security-page__panel-header">
            <div>
              <h2>Usuarios del sistema</h2>
              <p>
                Esta vista está disponible solo para usuarios con permisos de
                gestión de seguridad.
              </p>
            </div>

            <button className="security-page__new-button" type="button" disabled>
              + Nuevo usuario
            </button>
          </div>

          {status === "loading" && (
            <div className="security-page__state">
              Cargando usuarios...
            </div>
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