import styles from "./AdminTopbar.module.css";
import {
  FaBars,
  FaBell,
  FaQuestionCircle,
  FaSearch,
  FaSignOutAlt,
} from "react-icons/fa";
import Logo from "../../../../assets/LogoP.png";
import { useAuth } from "../../../../context/AuthContext";

interface Props {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumb?: string;
}

export default function AdminTopbar({
  onToggleSidebar,
  title = "HOME",
  breadcrumb = "DASHBOARD",
}: Props) {
  const { user, requestLogout } = useAuth();

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          onClick={onToggleSidebar}
          aria-label="Abrir o cerrar menu lateral"
        >
          <FaBars />
        </button>
        <div className={styles.brand}>
          <img src={Logo} alt="Titanium" className={styles.brandLogo} />
        </div>

        <div className={styles.breadcrumbs}>
          <span className={styles.crumb}>{title}</span>
          <span className={styles.sep}>›</span>
          <span className={styles.crumbActive}>{breadcrumb}</span>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.search}>
          <FaSearch className={styles.searchIcon} />
          <input className={styles.searchInput} placeholder="Buscar..." />
        </div>

        <button
          className={styles.iconBtn}
          aria-label="Notificaciones"
          type="button"
        >
          <FaBell />
          <span className={styles.badge} />
        </button>

        <button className={styles.iconBtn} aria-label="Ayuda" type="button">
          <FaQuestionCircle />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            {(user?.email?.[0] ?? "A").toUpperCase()}
          </div>
          <div className={styles.profileText}>
            <div className={styles.name}>{user?.email ?? "Admin"}</div>
            <div className={styles.role}>Administrador</div>
          </div>
        </div>

        <button
          className={styles.iconBtn}
          aria-label="Cerrar sesion"
          type="button"
          onClick={() => void requestLogout()}
          title="Cerrar sesion"
        >
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
