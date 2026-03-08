import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  FaChevronRight,
  FaBoxes,
} from "react-icons/fa";
import Logo from "../../../../assets/LogoP.png";

// en AdminSidebar.tsx

const topItems = [
  { to: "/admin", label: "Resumen", icon: <FaChartBar /> },
  { to: "/admin/users", label: "Usuarios", icon: <FaUsers /> },
];

const catalogItems = [
  { to: "/admin/products", label: "Productos", icon: <FaBoxOpen /> },
  { to: "/admin/brands", label: "Marcas", icon: <FaTags /> },
  { to: "/admin/categories", label: "Categorías", icon: <FaThLarge /> },
];
const bottomItems = [
  { to: "/admin/suscripciones", label: "Suscripciones", icon: <FaIdCard /> },
  { to: "/admin/reports", label: "Reportes", icon: <FaFileAlt /> },
  { to: "/admin/settings", label: "Gestión del sitio", icon: <FaCog /> },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();

  const catalogActive = useMemo(
    () => catalogItems.some((item) => pathname.startsWith(item.to)),
    [pathname],
  );

  const [catalogOpen, setCatalogOpen] = useState(catalogActive);

  useEffect(() => {
    if (catalogActive) setCatalogOpen(true);
  }, [catalogActive]);

  return (
    <div className={styles.wrap}>
      <div className={styles.brand}>
        <NavLink to="/admin" className={styles.brandLink}>
          <img
            src={Logo}
            alt="Titanium - Panel Admin"
            className={styles.brandLogo}
          />
        </NavLink>

        <div className={styles.brandTexts}>
          <span className={styles.brandTitle}>PANEL ADMIN</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {topItems.map((item) => (
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

        <button
          type="button"
          className={`${styles.catalogToggle} ${catalogActive ? styles.active : ""}`}
          onClick={() => setCatalogOpen((prev) => !prev)}
          aria-expanded={catalogOpen}
        >
          <span className={styles.catalogLeft}>
            <span className={styles.icon}>
              <FaBoxes />
            </span>
            <span className={styles.label}>Catálogo</span>
          </span>
          <span
            className={`${styles.chevron} ${catalogOpen ? styles.chevronOpen : ""}`}
          >
            <FaChevronRight />
          </span>
        </button>

        {catalogOpen && (
          <div className={styles.submenu}>
            {catalogItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `${styles.subLink} ${isActive ? styles.subActive : ""}`
                }
              >
                <span className={styles.icon}>{item.icon}</span>
                <span className={styles.label}>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}

        {bottomItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
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
