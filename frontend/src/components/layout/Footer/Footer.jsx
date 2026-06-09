// src/components/layout/Footer/Footer.jsx

import { useState } from "react"

import GuiaModal from "../FooterModals/GuiaModal"
import PrivacidadModal from "../FooterModals/PrivacidadModal"
import TerminosModal from "../FooterModals/TerminosModal"

import "./Footer.css"

const footerLinks = [
  {
    label: "Manual de Usuario",
    modal: "guia",
  },
  {
    label: "Términos y Condiciones",
    modal: "terminos",
  },
  {
    label: "Privacidad",
    modal: "privacidad",
  },
]

export default function Footer() {
  const [openModal, setOpenModal] = useState(null)

  function closeModal() {
    setOpenModal(null)
  }

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
                className="footer__link"
                key={link.modal}
                type="button"
                onClick={() => setOpenModal(link.modal)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      </footer>

      {openModal === "guia" && <GuiaModal onClose={closeModal} />}
      {openModal === "terminos" && <TerminosModal onClose={closeModal} />}
      {openModal === "privacidad" && <PrivacidadModal onClose={closeModal} />}
    </>
  )
}