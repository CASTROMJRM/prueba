import { NavLink } from "react-router-dom";
import styles from "./AdminSidebar.module.css";
import {
  FaChartBar,
  FaUsers,
  FaBoxOpen,
  FaIdCard,
  FaFileAlt,
  FaCog,
  FaTags,
  FaThLarge,
} from "react-icons/fa";
import Logo from "../../../../assets/LogoP.png";

// en AdminSidebar.tsx

const items = [
  { to: "/admin", label: "Resumen", icon: <FaChartBar /> },
  { to: "/admin/users", label: "Usuarios", icon: <FaUsers /> },

  { to: "/admin/brands", label: "Marcas", icon: <FaTags /> },
  { to: "/admin/categories", label: "Categorías", icon: <FaThLarge /> },

  { to: "/admin/products", label: "Productos", icon: <FaBoxOpen /> },

  { to: "/admin/suscripciones", label: "Suscripciones", icon: <FaIdCard /> },
  { to: "/admin/reports", label: "Reportes", icon: <FaFileAlt /> },
  { to: "/admin/settings", label: "Gestión del sitio", icon: <FaCog /> },
];


export default function AdminSidebar() {
  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>
        <NavLink to="/admin" className={styles.brandLink}>
          <img src={Logo} alt="Titanium - Panel Admin" className={styles.brandLogo} />
        </NavLink>

        <div className={styles.brandTexts}>
          <span className={styles.brandTitle}>PANEL ADMIN</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
