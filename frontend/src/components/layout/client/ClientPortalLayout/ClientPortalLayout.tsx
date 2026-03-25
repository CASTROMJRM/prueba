import { NavLink, Outlet } from "react-router-dom";
import {
  CreditCard,
  LayoutGrid,
  ShieldCheck,
  UserRound,
  Wallet,
} from "lucide-react";
import Header from "../../Header/Header";
import Footer from "../../Footer";
import styles from "./ClientPortalLayout.module.css";

const clientLinks = [
  { to: "/cliente", label: "Resumen", icon: <LayoutGrid size={18} /> },
  { to: "/cliente/perfil", label: "Mi perfil", icon: <UserRound size={18} /> },
  {
    to: "/cliente/suscripcion",
    label: "Mi suscripcion",
    icon: <CreditCard size={18} />,
  },
  { to: "/cliente/pagos", label: "Pagos", icon: <Wallet size={18} /> },
  {
    to: "/cliente/configuracion",
    label: "Configuracion (2FA)",
    icon: <ShieldCheck size={18} />,
  },
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
              <span className={styles.linkIcon}>{item.icon}</span>
              <span className={styles.linkLabel}>{item.label}</span>
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
