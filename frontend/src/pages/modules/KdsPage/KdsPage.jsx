// frontend/src/pages/modules/KdsPage/KdsPage.jsx

import { Bell, Clock3, Menu, Search } from "lucide-react"

import logoUmari from "../../../assets/icons/logo-umari-dark.svg"

import "./KdsPage.css"

export default function KdsPage() {
  return (
    <div className="kds-page">
      <header className="kds-topbar">
        <div className="kds-topbar__brand">
          <button
            className="kds-menu-button"
            type="button"
            aria-label="Abrir navegación"
            title="Abrir navegación"
          >
            <Menu size={21} />
          </button>

          <img
            src={logoUmari}
            alt=""
            className="kds-brand-logo"
            aria-hidden="true"
          />

          <div className="kds-title-block">
            <p>Umarí OS</p>
            <h1>Monitor de Cocina</h1>
          </div>
        </div>

        <div className="kds-topbar__tools">
          <label className="kds-search">
            <Search size={19} />
            <input type="search" placeholder="Buscar comanda, mesa o plato" />
          </label>

          <button
            className="kds-notification-button"
            type="button"
            aria-label="Ver notificaciones"
          >
            <Bell size={19} />
          </button>

          <span className="kds-topbar__divider" aria-hidden="true" />

          <div className="kds-user-summary" aria-label="Usuario actual">
            <div className="kds-user-avatar" aria-hidden="true">
              CA
            </div>

            <div>
              <strong>Chef Agus</strong>
              <span>Cocina</span>
            </div>
          </div>
        </div>
      </header>

      <main className="kds-shell">
        <section className="kds-board-intro">
          <div>
            <p className="kds-eyebrow">Operación en tiempo real</p>
            <h2>Tablero de comandas</h2>
            <p>
              Espacio preparado para visualizar pedidos pendientes, controlar
              preparación y marcar órdenes listas para despacho.
            </p>
          </div>
        </section>

        <section className="kds-board-empty">
          <Clock3 size={30} />

          <div>
            <h3>Tablero listo para comandas</h3>
            <p>
              En el siguiente commit se agregarán filtros por estado y tarjetas
              de comandas con acciones de cocina.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}