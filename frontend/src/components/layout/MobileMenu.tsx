import { Link } from "react-router-dom";

interface Props {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: Props) => {
  return (
    <div className="mobile-menu">
      <nav className="mobile-nav">
        <Link to="/" className="mobile-nav-link" onClick={onClose}>
          INICIO
        </Link>
        <Link to="/catalogue" className="mobile-nav-link" onClick={onClose}>
          PRODUCTOS
        </Link>
        <Link to="/suscripciones" className="mobile-nav-link" onClick={onClose}>
          SUSCRIPCIONES
        </Link>
        <Link to="/AboutPage" className="mobile-nav-link" onClick={onClose}>
          ACERCA DE
        </Link>

        <div className="mobile-nav-buttons">
          <Link to="/register" className="slider-btn-outline">
            SUSCRÍBETE
          </Link>
          <Link to="/login" className="slider-btn-solid">
            INICIA SESIÓN
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
