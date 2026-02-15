import { Link, NavLink } from "react-router-dom";
import styles from "./Navbar.module.css";
import Logo from "../../../assets/LogoP.png";

import {
  FaHome,
  FaDumbbell,
  FaIdCard,
  FaInfoCircle,
  FaUserPlus,
  FaSignInAlt,
} from "react-icons/fa";

interface Props {
  scrolled: boolean;
  onToggleMobile: () => void;
}

const Navbar = ({ scrolled, onToggleMobile }: Props) => {
  return (
    <header
      className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}
    >
      <div className={styles.headerContent}>
        <div className={styles.logoContainer}>
          <Link to="/">
            <img
              src={Logo}
              alt="Titanium Sport Gym"
              className={styles.logoImage}
            />
          </Link>
        </div>

        <nav className={styles.navDesktop}>
          <div className={styles.navMainLinks}>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
              end
            >
              <FaHome className={styles.navIcon} />
              INICIO
              <span className={styles.navUnderline} />
            </NavLink>

            <NavLink
              to="/catalogue"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              <FaDumbbell className={styles.navIcon} />
              PRODUCTOS
              <span className={styles.navUnderline} />
            </NavLink>

            <NavLink
              to="/suscripciones"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              <FaIdCard className={styles.navIcon} />
              SUSCRIPCIONES
              <span className={styles.navUnderline} />
            </NavLink>

            <NavLink
              to="/AboutePage"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              <FaInfoCircle className={styles.navIcon} />
              ACERCA DE NOSOTROS
              <span className={styles.navUnderline} />
            </NavLink>
          </div>

          <div className={styles.navActionLinks}>
            {/* SE ELIMINÓ ESTA LÍNEA: <div className={styles.navDivider} /> */}
            <Link to="/register" className={styles.btnOutline}>
              <FaUserPlus /> SUSCRÍBETE
            </Link>
            <Link to="/login" className={styles.btnSolid}>
              <FaSignInAlt /> INICIA SESIÓN
            </Link>
          </div>
        </nav>

        <button
          onClick={onToggleMobile}
          className={styles.mobileMenuBtn}
          aria-label="Abrir menú"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
