// src/pages/PermissionDemo/PermissionDemo.jsx

import { Link } from "react-router-dom"

import RequirePermission from "../../components/auth/RequirePermission"
import { getCurrentPermissions, getCurrentUser } from "../../services/authService"

import "./PermissionDemo.css"

export default function PermissionDemo() {
  const user = getCurrentUser()
  const permissions = getCurrentPermissions()

  return (
    <main className="permission-demo">
      <section className="permission-demo__shell">
        <header className="permission-demo__header">
          <div>
            <p className="permission-demo__eyebrow">Prueba de permisos</p>
            <h1>Autorización en frontend</h1>
            <p>
              Usuario actual: <strong>{user?.nombres} {user?.apellidos}</strong>{" "}
              · Rol: <strong>{user?.rol}</strong>
            </p>
          </div>

          <Link className="permission-demo__back" to="/dashboard">
            Volver al dashboard
          </Link>
        </header>

        <section className="permission-demo__grid">
          <RequirePermission
            permission="security.ver"
            fallback={
              <article className="permission-demo__card permission-demo__card--locked">
                <span>Bloqueado</span>
                <h2>Usuarios y Seguridad</h2>
                <p>No tienes permiso para visualizar seguridad.</p>
              </article>
            }
          >
            <article className="permission-demo__card">
              <span>Permitido</span>
              <h2>Usuarios y Seguridad</h2>
              <p>Puedes visualizar el módulo de seguridad.</p>
            </article>
          </RequirePermission>

          <RequirePermission
            permission="cashier.ver"
            fallback={
              <article className="permission-demo__card permission-demo__card--locked">
                <span>Bloqueado</span>
                <h2>Caja</h2>
                <p>No tienes permiso para visualizar caja.</p>
              </article>
            }
          >
            <article className="permission-demo__card">
              <span>Permitido</span>
              <h2>Caja</h2>
              <p>Puedes visualizar caja y pagos.</p>
            </article>
          </RequirePermission>

          <RequirePermission
            permission="pos.ver"
            fallback={
              <article className="permission-demo__card permission-demo__card--locked">
                <span>Bloqueado</span>
                <h2>POS / Salón</h2>
                <p>No tienes permiso para visualizar POS.</p>
              </article>
            }
          >
            <article className="permission-demo__card">
              <span>Permitido</span>
              <h2>POS / Salón</h2>
              <p>Puedes visualizar gestión de salón y pedidos.</p>
            </article>
          </RequirePermission>

          <RequirePermission
            permission="kds.ver"
            fallback={
              <article className="permission-demo__card permission-demo__card--locked">
                <span>Bloqueado</span>
                <h2>Cocina / KDS</h2>
                <p>No tienes permiso para visualizar cocina.</p>
              </article>
            }
          >
            <article className="permission-demo__card">
              <span>Permitido</span>
              <h2>Cocina / KDS</h2>
              <p>Puedes visualizar el monitor de cocina.</p>
            </article>
          </RequirePermission>
        </section>

        <section className="permission-demo__permissions">
          <h2>Permisos cargados en sesión</h2>

          {permissions.length > 0 ? (
            <ul>
              {permissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          ) : (
            <p>No hay permisos cargados.</p>
          )}
        </section>
      </section>
    </main>
  )
}