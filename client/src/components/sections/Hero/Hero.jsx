// src/components/sections/Hero/Hero.jsx
import heroRestaurantBg from '../../../assets/images/hero-restaurant-bg.jpg'
import './Hero.css'

export default function Hero() {
  return (
    <section
      className="hero"
      id="hero"
      style={{ backgroundImage: `url(${heroRestaurantBg})` }}
    >
      <div className="hero__overlay"></div>

      <div className="container hero__container">
        <div className="hero__content hero__content--centered">
          <h1 className="hero__title">
            Domina cada detalle de tu restaurante con inteligencia real.
          </h1>

          <p className="hero__subtitle">
            Transformamos tu esfuerzo diario en rentabilidad.
            <br />
            No solo gestionamos pedidos, optimizamos tu éxito financiero.
          </p>

          <div className="hero__cta-group">
            <a href="#demo" className="btn btn-primary btn-lg">
              Solicítalo ahora
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}