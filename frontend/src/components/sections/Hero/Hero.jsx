// src/components/sections/Hero/Hero.jsx

import { useState } from "react"

import heroBackground from "../../../assets/images/hero-background.jpg"
import "./Hero.css"

function getInitialHeroHeight() {
  if (typeof window === "undefined") {
    return "calc(100vh - var(--navbar-height))"
  }

  const rootStyles = getComputedStyle(document.documentElement)

  const navbarHeight =
    parseFloat(rootStyles.getPropertyValue("--navbar-height")) || 72

  const viewportHeight = window.innerHeight
  const initialHeroHeight = viewportHeight - navbarHeight

  return `${Math.max(initialHeroHeight, 660)}px`
}

export default function Hero() {
  const [heroHeight] = useState(getInitialHeroHeight)

  return (
    <section
      className="hero"
      id="inicio"
      style={{
        "--hero-background": `url(${heroBackground})`,
        "--hero-height": heroHeight,
      }}
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