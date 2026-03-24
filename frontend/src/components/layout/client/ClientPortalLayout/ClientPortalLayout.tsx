import { NavLink, Outlet } from "react-router-dom";
import Header from "../../Header/Header";
import Footer from "../../Footer";
import styles from "./ClientPortalLayout.module.css";

const clientLinks = [
  { to: "/cliente", label: "Resumen" },
  { to: "/cliente/perfil", label: "Mi perfil" },
  { to: "/cliente/suscripcion", label: "Mi suscripcion" },
  { to: "/cliente/pagos", label: "Pagos" },
  { to: "/cliente/configuracion", label: "Configuracion (2FA)" },
];

export default function ClientPortalLayout() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <section className={styles.clientNav}>
          {clientLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/cliente"}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.active : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </section>

        <section className={styles.content}>
          <Outlet />
        </section>
      </main>

      <Footer />
    </div>
  );
}
