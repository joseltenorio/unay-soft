export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero__overlay"></div>
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="hero__content hero_content--centered">
          <h1 className="hero__title">
            Domina cada detalle de tu restaurante con inteligencia real.
          </h1>

          <p className="hero__subtitle">
            Transformamos tu esfuerzo diario en rentabilidad.<br />
            No solo gestionamos pedidos, optimizamos tu éxito financiero.
          </p>
          
          <div className="hero__cta-group">
            <a href="#demo" className="btn btn-primary btn-lg" style={{ width: 'fit-content' }}>
              Solicítalo ahora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}