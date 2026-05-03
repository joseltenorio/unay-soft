// src/components/layout/Navbar/Navbar.jsx
import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar__container">
        <a href="#hero" className="navbar__logo">
          UnaySoft
        </a>

        <ul className="navbar__links">
          <li>
            <a href="#hero">Inicio</a>
          </li>
          <li>
            <a href="#steps">Funcionalidades</a>
          </li>
          <li>
            <a href="#demo">Precios</a>
          </li>
          <li>
            <a href="#account-access">Acerca de</a>
          </li>
          <li>
            <a href="#demo">FAQ</a>
          </li>
        </ul>

        <div className="navbar__auth">
          <a href="#" className="nav-btn-link">
            Iniciar sesión
          </a>

          <a href="#demo" className="btn btn-primary btn-sm">
            Empezar ahora
          </a>
        </div>
      </div>
    </nav>
  )
}