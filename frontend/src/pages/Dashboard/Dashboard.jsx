import { useNavigate } from "react-router-dom"

import { getCurrentUser, logout } from "../../services/authService"

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

      <p>
        <strong>Usuario:</strong> {user?.nombres} {user?.apellidos}
      </p>

      <p>
        <strong>Correo:</strong> {user?.email || "No disponible"}
      </p>

      <p>
        <strong>Rol:</strong> {user?.rol || "No disponible"}
      </p>

      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </main>
  )
}