import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer footer-complete">
      <div className="footer-container">
        <div className="footer-content">
          {/* Columna 1: Sobre MERA'S */}
          <div className="footer-column">
            <h3>MERA'S</h3>
            <p className="footer-description">
              Indumentaria y estampados personalizados. 
              Diseñamos prendas únicas para vos.
            </p>
            <div className="footer-social">
              <a 
                href="https://www.instagram.com/merasoficial" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="social-link"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a 
                href="https://www.tiktok.com/@merasoficial" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="social-link"
              >
                <i className="fab fa-tiktok"></i>
              </a>
              <a 
                href="https://wa.me/5493815987621" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="social-link"
              >
                <i className="fab fa-whatsapp"></i>
              </a>
            </div>
          </div>

          {/* Columna 2: Links rápidos */}
          <div className="footer-column">
            <h4>Navegación</h4>
            <ul className="footer-menu">
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/productos">Productos</Link></li>
              <li><Link to="/disenar">Crear Mi Prenda</Link></li>
              <li><Link to="/sobre-nosotros">Sobre Nosotros</Link></li>
              <li><Link to="/categorias">Categorías</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div className="footer-column">
            <h4>Contacto</h4>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:merasofic@gmail.com">merasofic@gmail.com</a>
              </li>
              <li>
                <i className="fab fa-whatsapp"></i>
                <a href="https://wa.me/5493815987621" target="_blank" rel="noopener noreferrer">
                  +54 9 381 598-7621
                </a>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>San Miguel de Tucumán, Argentina</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} MERA'S. Todos los derechos reservados.</p>
            <div className="footer-bottom-links">
              <Link to="/terminos">Términos y Condiciones</Link>
              <span>•</span>
              <Link to="/privacidad">Política de Privacidad</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;