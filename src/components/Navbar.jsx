export default function Navbar() {
  return (
    <nav className="navbar">
      <a href="#" className="navbar__logo">UnaySoft</a>
      
      <ul className="navbar__links">
        <li><a href="#hero">Inicio</a></li>
        <li><a href="#steps">Funcionalidades</a></li>
        <li><a href="#">Precios</a></li>
        <li><a href="#">Acerca de</a></li>
        <li><a href="#">FAQ</a></li>
      </ul>

      <div className="navbar__auth">
        <a href="#" className="nav-btn-link">Iniciar Sesion</a>
        <a href="#demo" className="btn btn-primary btn-sm">Empezar ahora</a>
      </div>
    </nav>
  );
}