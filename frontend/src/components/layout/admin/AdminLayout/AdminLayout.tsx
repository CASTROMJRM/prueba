import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";
import AdminSidebar from "../AdminSidebar/AdminSidebar";
import AdminTopbar from "../AdminTopbar/AdminTopbar";

export default function AdminLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <AdminSidebar />
      </aside>
      
      <main className={styles.main}>
        <AdminTopbar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
