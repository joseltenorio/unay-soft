// src/components/layout/FooterModals/TerminosModal.jsx

import "./FooterModal.css"
import modalHero from "../../../assets/images/modal-hero.jpg"

const sections = [
  {
    icon: (
      <svg viewBox="0 0 16 16"><rect x="2" y="1" width="12" height="14" rx="2"/><line x1="5" y1="5" x2="11" y2="5"/><line x1="5" y1="8" x2="11" y2="8"/><line x1="5" y1="11" x2="8" y2="11"/></svg>
    ),
    title: "1. Objeto del Sistema",
    text: "Umarí OS es una plataforma SaaS de uso profesional diseñada para la gestión operativa de establecimientos gastronómicos. Cada negocio accede a un entorno propio con datos aislados. Su uso está restringido únicamente al personal autorizado del establecimiento contratante, incluyendo los módulos de Punto de Venta (POS), Monitor de Cocina (KDS), Caja, Inventario, Carta Digital, Asistente Virtual, Analítica Operativa y Business Intelligence. Su uso está restringido únicamente a fines laborales dentro de la organización.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/><circle cx="8" cy="11" r="1"/></svg>
    ),
    title: "2. Acceso y Seguridad de Credenciales",
    text: "El acceso al sistema es personal e intransferible. Cada usuario es responsable de mantener la confidencialidad de sus credenciales. Queda prohibido compartir contraseñas, ceder acceso a terceros o intentar ingresar a rutas o módulos sin los permisos correspondientes. El sistema registra sesiones y audita acciones internas.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.6 3.5L8 10l-3.1 1.5.6-3.5L3 5.5 6.5 5z"/></svg>
    ),
    title: "3. Uso Permitido",
    text: "El sistema debe utilizarse exclusivamente para las funciones operativas y administrativas del establecimiento. Está prohibido utilizarlo para fines distintos a los laborales, extraer información de manera no autorizada o manipular datos de otros usuarios o módulos sin los permisos asignados.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>
    ),
    title: "4. Responsabilidades del Establecimiento y el Administrador",
    text: "El Administrador de cada establecimiento es responsable de la gestión de usuarios, asignación de roles y permisos, y configuración general su establecimiento. Umarí OS no se hace responsable por el uso indebido de credenciales internas."
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><line x1="8" y1="5" x2="8" y2="8"/><line x1="8" y1="10" x2="8" y2="11"/></svg>
    ),
    title: "5. Estado del Sistema",
    text: "Umarí OS se encuentra en desarrollo activo. Pueden realizarse cambios, mejoras o correcciones en cualquier momento. El proveedor no garantiza disponibilidad ininterrumpida ni se hace responsable por pérdidas derivadas de errores operativos, interrupciones del servicio o uso incorrecto de la plataforma.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><path d="M2 4h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/></svg>
    ),
    title: "6. Ley Aplicable",
    text: "El uso de este sistema se rige por las leyes vigentes de la República del Perú. Cualquier controversia será resuelta conforme a la normativa peruana aplicable.",
  },
]

export default function TerminosModal({ onClose }) {
  return (
    <div
      className="fmodal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="terminos-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fmodal__panel">

        <div
          className="fmodal__header"
          style={{ backgroundImage: `url(${modalHero})` }}
        >
          <button className="fmodal__close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" fill="none"><line x1="3" y1="3" x2="13" y2="13"/><line x1="13" y1="3" x2="3" y2="13"/></svg>
          </button>
          <h2 className="fmodal__title" id="terminos-title">
            Términos y Condiciones de Uso | Umarí OS
          </h2>
        </div>

        <div className="fmodal__body">
          <p className="fmodal__intro">
            <span className="fmodal__date">Última actualización: 3 de junio de 2026</span>
            Bienvenido a Umarí OS. El presente documento establece las normas y responsabilidades
            para el uso de esta plataforma SaaS de gestión gastronómica. Al acceder al sistema, 
            el establecimiento y sus colaboradores aceptan cumplir con las siguientes cláusulas.
          </p>

          {sections.map((s) => (
            <div className="fmodal__section" key={s.title}>
              <h3 className="fmodal__section-title">
                <span className="fmodal__section-icon" aria-hidden="true">{s.icon}</span>
                {s.title}
              </h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>

        <div className="fmodal__footer">
          <button className="fmodal__btn" onClick={onClose}>Aceptar y salir</button>
        </div>

      </div>
    </div>
  )
}