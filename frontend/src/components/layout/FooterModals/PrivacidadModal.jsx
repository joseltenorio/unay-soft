// src/components/layout/FooterModals/PrivacidadModal.jsx

import "./FooterModal.css"
import modalHero from "../../../assets/images/modal-hero.jpg"

const sections = [
  {
    icon: (
      <svg viewBox="0 0 16 16"><path d="M8 2l4 1.5v4c0 3-2 5-4 6-2-1-4-3-4-6v-4z"/></svg>
    ),
    title: "1. Datos que el Sistema Almacena",
    text: "Umarí OS almacena únicamente datos operativos internos del establecimiento: usuarios del sistema y sus roles, configuración del establecimiento, mesas y zonas del salón, carta de productos, órdenes y comandas, estados de preparación de cocina, tiempos de atención y entrega, accesos QR por mesa o establecimiento, datos de la carta digital (categorías, productos, imágenes), registros de popularidad y sugerencias de productos. Asimismo, se almacenan movimientos de caja, inventario, registro de sesiones activas y auditoría de acciones internas.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"/><line x1="5" y1="8" x2="11" y2="8"/></svg>
    ),
    title: "2. Datos que NO se Recopilan",
    text: "El sistema no recopila ni almacena datos personales de los clientes o comensales del establecimiento. Los clientes pueden consultar la carta digital y usar el asistente virtual sin crear una cuenta ni proporcionar datos personales.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>
    ),
    title: "3. Seguridad de la Información",
    text: "Las contraseñas de los usuarios se almacenan cifradas mediante bcryptjs. La autenticación se gestiona con tokens JWT de duración limitada. Todas las rutas internas están protegidas por middlewares de autenticación y autorización. El acceso a cada módulo y acción está controlado por el sistema de roles y permisos definido por el administrador.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><ellipse cx="8" cy="5" rx="6" ry="3"/><path d="M2 5v4c0 1.7 2.7 3 6 3s6-1.3 6-3V5"/><path d="M2 9v3c0 1.7 2.7 3 6 3s6-1.3 6-3V9"/></svg>
    ),
    title: "4. Almacenamiento de Datos",
    text: "Los datos se almacenan en una base de datos PostgreSQL alojada en Supabase, con acceso restringido mediante credenciales seguras. Solo el sistema backend tiene acceso directo a la base de datos.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"/><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6"/><line x1="11" y1="11" x2="14" y2="14"/><line x1="14" y1="11" x2="11" y2="14"/></svg>
    ),
    title: "5. Control de Acceso",
    text: "Cada usuario accede únicamente a los módulos y datos correspondientes a su rol. El perfil Administrador es el único con capacidad de gestionar usuarios, roles y configuración general. Las acciones relevantes dentro del sistema quedan registradas en el módulo de auditoría.",
  },
  {
    icon: (
      <svg viewBox="0 0 16 16"><path d="M2 4h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z"/><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><line x1="6" y1="8" x2="10" y2="8"/></svg>
    ),
    title: "6. Contacto",
    text: "Para consultas relacionadas con el manejo de datos o solicitudes sobre la información almacenada, comuníquese con el administrador del sistema de su establecimiento.",
  },
]

export default function PrivacidadModal({ onClose }) {
  return (
    <div
      className="fmodal__overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacidad-title"
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
          <h2 className="fmodal__title" id="privacidad-title">
            Política de Privacidad | Umarí OS
          </h2>
        </div>

        <div className="fmodal__body">
          <p className="fmodal__intro">
            <span className="fmodal__date">Última actualización: 3 de junio de 2026</span>
            En Umarí OS nos comprometemos a manejar la información del establecimiento de forma
            responsable y segura. Esta política describe qué datos se almacenan, cómo se
            protegen y quién tiene acceso a ellos.
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
          <button className="fmodal__btn" onClick={onClose}>Cerrar</button>
        </div>

      </div>
    </div>
  )
}