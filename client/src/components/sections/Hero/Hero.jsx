// src/components/sections/Hero/Hero.jsx

import heroBackground from "../../../assets/images/hero-background.jpg"
import "./Hero.css"

export default function Hero() {
  return (
    <section
      className="hero"
      id="inicio"
      style={{ "--hero-background": `url(${heroBackground})` }}
    >
      <div className="hero__overlay" aria-hidden="true" />

      <div className="hero__container container">
        <div className="hero__content">
          <div className="hero__text-group">
            <h1 className="hero__title">
              La tecnología a la medida de la frescura de Umarí.
            </h1>

            <p className="hero__description">
              Bienvenido a la columna vertebral de nuestra operación.
              Digitalizamos la cadena de valor de nuestra cocina.
            </p>
          </div>

          <a className="btn btn-accent hero__button" href="/login">
            Acceso al Portal
          </a>
        </div>
      </div>
    </section>
  )
}