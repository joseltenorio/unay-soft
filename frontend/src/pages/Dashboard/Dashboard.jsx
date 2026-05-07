// frontend/src/pages/Dashboard/Dashboard.jsx

import { useNavigate } from "react-router-dom"

import {
  getCurrentModules,
  getCurrentPermissions,
  getCurrentUser,
  logout,
} from "../../services/authService"

const roleMessages = {
  Administrador: "Bienvenido administrador. Tienes acceso completo al sistema.",
  Gerente: "Bienvenido gerente. Puedes supervisar operaciones y reportes.",
  Cajero: "Bienvenido cajero. Puedes gestionar caja y pagos.",
  Mozo: "Bienvenido mozo. Puedes gestionar atención en salón.",
  Cocina: "Bienvenido cocina. Puedes revisar pedidos pendientes.",
}

export default function Dashboard() {
  const navigate = useNavigate()

  const user = getCurrentUser()
  const permissions = getCurrentPermissions()
  const modules = getCurrentModules()

  const message =
    roleMessages[user?.rol] ||
    `Bienvenido. Tu rol actual es: ${user?.rol || "sin rol asignado"}.`

  function handleLogout() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <main style={{ padding: "32px" }}>
      <h1>Dashboard de prueba</h1>

      <p>{message}</p>

      <hr />

      <section>
        <h2>Datos del usuario</h2>

        <p>
          <strong>Usuario:</strong> {user?.nombres || "No disponible"}{" "}
          {user?.apellidos || ""}
        </p>

        <p>
          <strong>Correo:</strong> {user?.email || "No disponible"}
        </p>

        <p>
          <strong>Rol:</strong> {user?.rol || "No disponible"}
        </p>
      </section>

      <hr />

      <section>
        <h2>Permisos</h2>

        <p>
          <strong>Total de permisos:</strong> {permissions.length}
        </p>

        {permissions.length > 0 ? (
          <ul>
            {permissions.map((permission) => (
              <li key={permission}>{permission}</li>
            ))}
          </ul>
        ) : (
          <p>No hay permisos cargados para este usuario.</p>
        )}
      </section>

      <hr />

      <section>
        <h2>Módulos disponibles</h2>

        {modules.length > 0 ? (
          <ul>
            {modules.map((module) => (
              <li key={module.codigo}>
                <strong>{module.nombre}</strong>{" "}
                <span>({module.codigo})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay módulos disponibles para este usuario.</p>
        )}
      </section>

      <hr />

      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}