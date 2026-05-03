export default function AccountAccess() {
  return (
    <section className="account-access">
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '60px' }}>
        <div className="account-access__content">
          <h2 className="account-access__title">Inicia sesión para ver los detalles de tu negocio</h2>
          
          <p className="account-access__desc">
            Consulta tus ventas diarias, ganancias potenciales, análisis de rendimiento y más recursos para tu restaurante.
          </p>

          <div className="account-access__actions">
            <a href="#" className="btn-black" style={{ textDecoration: 'none' }}>Inicia sesión en tu cuenta</a>
            <a href="#demo" className="link-animated">solicítalo ahora</a>
          </div>
        </div>

        <div className="account-access__image-container">
          <img src="/login-illustration.jpeg" alt="Gestión de cuenta" className="account-img" />
        </div>
      </div>
    </section>
  );
}