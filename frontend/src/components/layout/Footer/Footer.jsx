// src/components/layout/Footer/Footer.jsx

import { useState } from "react"
import "./Footer.css"

import GuiaModal      from "../FooterModals/GuiaModal"
import TerminosModal  from "../FooterModals/TerminosModal"
import PrivacidadModal from "../FooterModals/PrivacidadModal"

const footerLinks = [
  { label: "Manual de Usuario",      modal: "guia"       },
  { label: "Términos y Condiciones", modal: "terminos"   },
  { label: "Privacidad",             modal: "privacidad" },
]

export default function Footer() {
  const [openModal, setOpenModal] = useState(null)

  return (
    <>
      <footer className="footer">
        <div className="footer__container container">
          <p className="footer__copyright">
            © 2026 Umarí OS v1.3 - Sistema de Gestión Gastronómica.
          </p>

          <nav className="footer__nav" aria-label="Enlaces legales y ayuda">
            {footerLinks.map((link) => (
              <button
                key={link.modal}
                className="footer__link"
                onClick={() => setOpenModal(link.modal)}
                type="button"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {openModal === "guia"       && <GuiaModal       onClose={() => setOpenModal(null)} />}
      {openModal === "terminos"   && <TerminosModal   onClose={() => setOpenModal(null)} />}
      {openModal === "privacidad" && <PrivacidadModal onClose={() => setOpenModal(null)} />}
    </>
  )
}