// src/components/layout/FooterModals/GuiaModal.jsx

import modalHero from "../../../assets/images/modal-hero.jpg"

import "./FooterModal.css"

const modules = [
  {
    name: "POS / Salón",
    desc: "Gestión de mesas, comandas y avisos de cocina.",
    wip: false,
  },
  {
    name: "KDS / Cocina",
    desc: "Monitor de preparación y estados de comandas.",
    wip: false,
  },
  {
    name: "Caja",
    desc: "Cobro de cuentas, liquidación y cierre de turno.",
    wip: true,
  },
  {
    name: "Inventario",
    desc: "Control de stock e insumos del local.",
    wip: true,
  },
  {
    name: "Carta Digital",
    desc: "Catálogo público por categorías, accesible desde QR.",
    wip: true,
  },
  {
    name: "Asistente Virtual",
    desc: "Consultas inteligentes sobre productos desde la carta.",
    wip: true,
  },
  {
    name: "BI / Informes",
    desc: "Dashboard de ventas, reportes y optimización de carta.",
    wip: true,
  },
  {
    name: "Seguridad",
    desc: "Gestión de usuarios y roles. Solo admin.",
    wip: false,
  },
  {
    name: "Establecimiento",
    desc: "Configuración fiscal, visual y parámetros del negocio.",
    wip: false,
  },
]

const flujo = [
  "El personal de salón selecciona una mesa desde POS y arma el pedido con los productos de la carta.",
  "La comanda se envía a cocina y aparece en el KDS como nuevo pedido.",
  "El personal de cocina prepara el pedido y cambia su estado a En preparación y luego a Lista.",
  "Cocina notifica al mesero desde el KDS.",
  "El mesero confirma la entrega desde la pestaña Avisos en POS.",
  "La comanda queda registrada como Entregada. Si la mesa ya tiene órdenes activas, se pueden registrar nuevas comandas sin afectar las anteriores.",
  "El cliente puede consultar la carta del establecimiento escaneando el código QR de su mesa, sin necesidad de iniciar sesión.",
]

export default function GuiaModal({ onClose }) {
  return (
    <div
      className="fmodal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guia-title"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="fmodal__panel">
        <div
          className="fmodal__header"
          style={{ backgroundImage: `url(${modalHero})` }}
        >
          <button className="fmodal__close" onClick={onClose} aria-label="Cerrar">
            <svg viewBox="0 0 16 16" fill="none">
              <line x1="3" y1="3" x2="13" y2="13" />
              <line x1="13" y1="3" x2="3" y2="13" />
            </svg>
          </button>

          <h2 className="fmodal__title" id="guia-title">
            Manual de Usuario | Umarí OS
          </h2>
        </div>

        <div className="fmodal__body">
          <p className="fmodal__intro">
            <span className="fmodal__date">
              Versión actual: en desarrollo activo
            </span>
            Umarí OS es una plataforma SaaS de gestión gastronómica. Cada
            establecimiento opera en su propio entorno con acceso controlado por
            roles y permisos definidos por su administrador. A continuación, se
            presenta una guía rápida para comenzar a usar el sistema.
          </p>

          <div className="fmodal__section">
            <h3 className="fmodal__section-title">
              <span className="fmodal__section-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" />
                  <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </span>
              Acceso al Sistema
            </h3>

            <p>
              Ingresa desde la pantalla de inicio con tu usuario y contraseña.
              Si olvidaste tu contraseña, usa la opción Restaurar contraseña. Si
              intentas acceder a un módulo sin permisos, el sistema mostrará una
              pantalla de acceso no autorizado.
            </p>
          </div>

          <div className="fmodal__section">
            <h3 className="fmodal__section-title">
              <span className="fmodal__section-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
              </span>
              Módulos Disponibles
            </h3>

            <div className="fmodal__modules">
              {modules.map((module) => (
                <div
                  className={`fmodal__module-card${
                    module.wip ? " fmodal__module-card--wip" : ""
                  }`}
                  key={module.name}
                >
                  <p className="fmodal__module-name">
                    {module.name}
                    {module.wip && (
                      <span className="fmodal__wip-badge">En desarrollo</span>
                    )}
                  </p>

                  <p className="fmodal__module-desc">{module.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="fmodal__section">
            <h3 className="fmodal__section-title">
              <span className="fmodal__section-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <polyline points="2 8 6 12 14 4" />
                </svg>
              </span>
              Flujo Operativo Básico
            </h3>

            <ol className="fmodal__steps">
              {flujo.map((paso, index) => (
                <li className="fmodal__step" key={paso}>
                  <span className="fmodal__step-num">{index + 1}</span>
                  <p>{paso}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="fmodal__section">
            <h3 className="fmodal__section-title">
              <span className="fmodal__section-icon" aria-hidden="true">
                <svg viewBox="0 0 16 16">
                  <circle cx="8" cy="5" r="3" />
                  <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                </svg>
              </span>
              Roles y Permisos
            </h3>

            <p>
              Cada usuario ve únicamente los módulos habilitados para su perfil.
              El administrador asigna roles y permisos desde el módulo de
              Seguridad.
            </p>
          </div>
        </div>

        <div className="fmodal__footer">
          <button className="fmodal__btn" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}