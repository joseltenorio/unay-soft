// src/pages/Unauthorized/Unauthorized.jsx

import { Link } from "react-router-dom"

import "./Unauthorized.css"

export default function Unauthorized() {
  return (
    <main className="unauthorized">
      <section className="unauthorized__card">
        <p className="unauthorized__eyebrow">Acceso restringido</p>

        <h1>No tienes permiso para ver esta sección</h1>

        <p className="unauthorized__message">
          Tu usuario está autenticado, pero tu rol actual no tiene autorización
          para acceder a este módulo.
        </p>

        <Link className="unauthorized__link" to="/app">
          Volver al inicio interno
        </Link>
      </section>
    </main>
  )
}