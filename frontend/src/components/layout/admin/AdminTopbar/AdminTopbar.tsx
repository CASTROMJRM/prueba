import styles from "./AdminTopbar.module.css";
import { FaBell, FaQuestionCircle, FaSearch } from "react-icons/fa";
import Logo from "../../../../assets/LogoP.png";

interface Props {
  onToggleSidebar?: () => void;
  title?: string;
  breadcrumb?: string;
}

export default function AdminTopbar({
  title = "HOME",
  breadcrumb = "DASHBOARD",
}: Props) {
  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/*BRAND CON IMAGEN */}
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
          <div className={styles.avatar}>A</div>
          <div className={styles.profileText}>
            <div className={styles.name}>Admin</div>
            <div className={styles.role}>Administrador</div>
          </div>
        </div>
      </div>
    </header>
  );
}
