//src/components/sections/Demo/Demo.jsx
import './Demo.css'

export default function Demo() {
  return (
    <section className="demo" id="demo">
      <div className="container demo__container">
        <h2>Solicita una demo del sistema</h2>

        <p className="demo__sub">
          Sin compromiso • Te contactamos al instante
        </p>

        <form className="demo__card">
          <div className="form-group">
            <label htmlFor="demo-name">
              Nombre completo <span className="required">*</span>
            </label>
            <input
              type="text"
              id="demo-name"
              name="name"
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="demo-email">
              Correo electrónico <span className="required">*</span>
            </label>
            <input
              type="email"
              id="demo-email"
              name="email"
              placeholder="tu@correo.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="demo-phone">
              Teléfono / WhatsApp <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="demo-phone"
              name="phone"
              placeholder="999 888 777"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary demo__submit">
            Enviar solicitud
          </button>

          <p className="demo__note">
            Al continuar serás redirigido a WhatsApp para coordinar.
          </p>
        </form>
      </div>
    </section>
  )
}
