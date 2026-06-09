// frontend/src/components/sections/Demo/Demo.jsx

import "./Demo.css"

const trustItems = [
  "Sin compromiso",
  "Respuesta rápida",
  "Soporte directo",
]

export default function Demo() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <section className="demo-section" id="demo">
      <div className="demo-section__container container">
        <div className="demo-section__content">
          <p className="demo-section__eyebrow">Agenda una demostración</p>

          <h2 className="demo-section__title">
            Mira cómo Umarí puede ordenar la operación diaria de tu restaurante
          </h2>

          <p className="demo-section__description">
            Conoce cómo Umarí conecta pedidos, cocina, carta y control operativo
            en una demo breve pensada para tu restaurante.
          </p>
        </div>

        <div className="demo-section__side">
          <form className="demo-section__form" onSubmit={handleSubmit}>
            <div className="demo-section__form-header">
              <h3>Solicita una demo</h3>
              <p>Sin compromiso • Te contactamos al instante</p>
            </div>

            <div className="demo-section__field">
              <label htmlFor="demo-name">Nombre completo</label>
              <input
                id="demo-name"
                name="name"
                type="text"
                placeholder="Tu nombre completo"
                autoComplete="name"
              />
            </div>

            <div className="demo-section__field">
              <label htmlFor="demo-email">Correo electrónico</label>
              <input
                id="demo-email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                autoComplete="email"
              />
            </div>

            <div className="demo-section__field">
              <label htmlFor="demo-phone">Teléfono / WhatsApp</label>
              <input
                id="demo-phone"
                name="phone"
                type="tel"
                placeholder="999 888 777"
                autoComplete="tel"
              />
            </div>

            <button className="btn btn-primary demo-section__button" type="submit">
              Continuar
            </button>

            <p className="demo-section__note">
              Al enviar serás redirigido a WhatsApp para coordinar.
            </p>
          </form>

          <div className="demo-section__trust" aria-label="Beneficios de solicitar una demo">
            {trustItems.map((item) => (
              <div className="demo-section__trust-item" key={item}>
                <span aria-hidden="true">✓</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}