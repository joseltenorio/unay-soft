// src/components/layout/Navbar/Navbar.jsx

import "./Navbar.css"
import logoUmari from "../../../assets/icons/logo-umari.svg"

const navLinks = [
  {
    label: "Inicio",
    href: "#inicio",
  },
  {
    label: "Módulos",
    href: "#modulos",
  },
  {
    label: "Planes",
    href: "#precios",
  },
  {
    label: "Guía de Uso",
    href: "#guia",
  },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container container">
        <a className="navbar__brand" href="#inicio" aria-label="Ir al inicio de Umari">
          <img src={logoUmari} alt="Umarí" className="navbar__logo" />
          <span className="navbar__brand-name">Umarí</span>
        </a>

        <nav className="navbar__nav" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <a className="navbar__link" href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="navbar__actions">
          <a className="navbar__support" href="#soporte">
            Soporte Técnico
          </a>

          <a className="btn btn-cream navbar__staff-button" href="/login">
            Portal Staff
          </a>
        </div>
      </div>
    </header>
  )
}