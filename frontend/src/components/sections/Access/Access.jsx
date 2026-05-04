// src/components/sections/Access/Access.jsx

import accessIllustration from "../../../assets/images/access-illustration.jpg"
import "./Access.css"

export default function Access() {
  return (
    <section className="access" id="guia">
      <div className="access__container container">
        <div className="access__content">
          <div className="access__text-content">
            <h2 className="access__title">
              Inicia sesión para ver los detalles del negocio
            </h2>

            <p className="access__description">
              Consulta las ventas diarias, ganancias potenciales, análisis de
              rendimiento y más recursos para el restaurante.
            </p>

            <a className="btn btn-primary access__button" href="/login">
              Acceder al Portal
            </a>
          </div>

          <div className="access__media" aria-hidden="true">
            <img
              src={accessIllustration}
              alt=""
              className="access__image"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}