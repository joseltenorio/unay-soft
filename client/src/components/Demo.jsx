export default function Demo() {
  return (
    <section className="demo" id="demo">
      <div className="container">
        <h2>Solicita una demo del sistema</h2>
        <p className="demo__sub">Sin compromiso • Te contactamos al instante</p>
        
        <div className="demo__card">
          <div className="form-group">
            <label htmlFor="demo-name">Nombre completo <span className="required">*</span></label>
            <input type="text" id="demo-name" placeholder="Tu nombre completo" required />
          </div>

          <div className="form-group">
            <label htmlFor="demo-email">Correo electrónico <span className="required">*</span></label>
            <input type="email" id="demo-email" placeholder="tu@correo.com" required />
          </div>

          <div className="form-group">
            <label htmlFor="demo-phone">Teléfono / WhatsApp <span className="required">*</span></label>
            <input type="tel" id="demo-phone" placeholder="999 888 777" required />
          </div>

          <button type="submit" className="btn btn-primary demo__submit">Enviar solicitud</button>
          <p className="demo__note">Al continuar serás redirigido a WhatsApp para coordinar</p>
        </div>
      </div>
    </section>
  );
}