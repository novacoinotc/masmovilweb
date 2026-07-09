import Logo from "./ui/Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="logo">
            <Logo id="logo-footer" />
            <span>MASMOVIL</span>
          </a>
          <p>
            Tecnología que mueve datos y dinero.
            <br />
            Empresa 100% mexicana.
          </p>
        </div>
        <div className="footer-col">
          <h4>Empresa</h4>
          <a href="#empresa">Quiénes somos</a>
          <a href="#soluciones">Soluciones</a>
          <a href="#casos">Para quién</a>
        </div>
        <div className="footer-col">
          <h4>Plataforma</h4>
          <a href="#plataforma">Core de pagos</a>
          <a href="#api">API</a>
          <a href="#seguridad">Seguridad</a>
          <a href="#cumplimiento">Cumplimiento</a>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <a href="mailto:direccion@masmovil.lat">direccion@masmovil.lat</a>
          <a href="#contacto">Solicitar una prueba</a>
          <p className="footer-addr">
            Pompeya 2775, Lomas de Guevara,
            <br />
            C.P. 44657, Guadalajara, Jalisco, México
          </p>
        </div>
      </div>
      <div className="container footer-legal">
        <p>© 2026 MASMOVIL, S.A. de C.V. · RFC MAS191203EY6 · Todos los derechos reservados.</p>
        <p>Guadalajara, Jalisco, México</p>
      </div>
    </footer>
  );
}
