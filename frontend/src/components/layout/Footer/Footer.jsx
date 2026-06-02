// src/components/layout/Footer/Footer.jsx

import "./Footer.css"

const footerLinks = [
  {
    label: "Manual de Usuario",
    href: "#guia",
  },
  {
    label: "Términos y Condiciones",
    href: "#terminos",
  },
  {
    label: "Privacidad",
    href: "#privacidad",
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container container">
        <p className="footer__copyright">
          © 2026 Umarí OS v1.3 - Sistema de Gestión Gastronómica.
        </p>

        <nav className="footer__nav" aria-label="Enlaces legales y ayuda">
          {footerLinks.map((link) => (
            <a className="footer__link" href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}