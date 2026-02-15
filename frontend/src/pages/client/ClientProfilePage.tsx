import styles from "./ClientPages.module.css";

export default function ClientProfilePage() {
  return (
    <section className={styles.page}>
      <h2>Mi perfil</h2>
      <p>
        Desde aquí podrás actualizar tus datos personales y contacto de
        emergencia.
      </p>
    </section>
  );
}
