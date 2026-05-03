// src/components/sections/AccountAccess/AccountAccess.jsx
import loginIllustration from '../../../assets/images/login-illustration.jpeg'
import './AccountAccess.css'

export default function AccountAccess() {
  return (
    <section className="account-access" id="account-access">
      <div className="container account-access__container">
        <div className="account-access__content">
          <h2 className="account-access__title">
            Inicia sesión para ver los detalles de tu negocio
          </h2>

          <p className="account-access__desc">
            Consulta tus ventas diarias, ganancias potenciales, análisis de rendimiento y más recursos para tu restaurante.
          </p>

          <div className="account-access__actions">
            <a href="#" className="btn-black">
              Inicia sesión en tu cuenta
            </a>

            <a href="#demo" className="link-animated">
              solicítalo ahora
            </a>
          </div>
        </div>

        <div className="account-access__image-container">
          <img
            src={loginIllustration}
            alt="Gestión de cuenta del restaurante"
            className="account-img"
          />
        </div>
      </div>
    </section>
  )
}