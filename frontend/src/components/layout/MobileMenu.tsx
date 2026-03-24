import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface Props {
  onClose: () => void;
}

const MobileMenu = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const role = user?.rol ?? null;

  const handlePortalNavigation = () => {
    if (role === "administrador") navigate("/admin");
    else if (role === "cliente") navigate("/cliente");
    else if (role === "entrenador") navigate("/entrenador");
    else navigate("/login");

    onClose();
  };

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
        <Link to="/AboutePage" className="mobile-nav-link" onClick={onClose}>
          ACERCA DE
        </Link>

        <div className="mobile-nav-buttons">
          {!user ? (
            <>
              <Link to="/register" className="slider-btn-outline" onClick={onClose}>
                SUSCRIBETE
              </Link>
              <Link to="/login" className="slider-btn-solid" onClick={onClose}>
                INICIA SESION
              </Link>
            </>
          ) : (
            <>
              <button
                type="button"
                className="slider-btn-outline"
                onClick={handlePortalNavigation}
              >
                MI PORTAL
              </button>
              {role === "cliente" && (
                <Link
                  to="/cliente/configuracion"
                  className="slider-btn-outline"
                  onClick={onClose}
                >
                  CONFIGURACION
                </Link>
              )}
              <button
                type="button"
                className="slider-btn-solid"
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                CERRAR SESION
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default MobileMenu;
