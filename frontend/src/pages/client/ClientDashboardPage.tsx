import styles from "./ClientPages.module.css";

const summaryCards = [
  { label: "Plan activo", value: "Premium 12 meses" },
  { label: "Próximo pago", value: "18 Feb 2026" },
  { label: "Clases este mes", value: "14 asistencias" },
];

export default function ClientDashboardPage() {
  return (
    <section className={styles.page}>
      <h2>Resumen de tu cuenta</h2>
      <div className={styles.grid}>
        {summaryCards.map((card) => (
          <article key={card.label} className={styles.card}>
            <p>{card.label}</p>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
