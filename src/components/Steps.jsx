export default function Steps() {
  return (
    <section className="steps" id="steps">
      <div className="section-header">
        <h2>Empieza a organizar tu negocio de manera simple</h2>
        <p>Un sistema diseñado para aligerar tu trabajo. Recibirás ayuda en todo el proceso.</p>
      </div>

      <div className="steps__grid">
        <div className="step-card">
          <div className="step-card__icon">👤</div>
          <h3>Solicita una cuenta</h3>
          <p>Solicita una cuenta en menos de 5 minutos. Proceso simple y rápido.</p>
        </div>

        <div className="step-card">
          <div className="step-card__icon">📖</div>
          <h3>Configura tu inventario</h3>
          <p>Sube tus productos, precios y fotos. Tan fácil como usar redes sociales.</p>
        </div>

        <div className="step-card">
          <div className="step-card__icon">💳</div>
          <h3>Registra tus ventas</h3>
          <p>Configura medios de pago y facturación electrónica.</p>
        </div>

        <div className="step-card">
          <div className="step-card__icon">✅</div>
          <h3>Empieza a vender</h3>
          <p>¡Listo! Acepta pedidos y gestiona tu restaurante centralizadamente.</p>
        </div>
      </div>
      
      <div className="steps__cta">
        <a href="#demo" className="btn btn-primary btn-lg">Solicitar ahora</a>
      </div>
    </section>
  );
}