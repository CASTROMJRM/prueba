import { useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { FaCheck, FaEye, FaTable, FaXmark } from "react-icons/fa6";
import styles from "./AdminClientRenewalPredictionPage.module.css";

type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
type FitnessGoal = "gain" | "lose" | "maintain";
type RenewalClass = "Renovara" | "No renovara";

type RenewalDatasetRow = {
  userId: string;
  name: string;
  email: string;
  weeklyGymDays: number;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  startsAt: string;
  endsAt: string;
  autoRenew: boolean;
  total: number;
  paidAt: string | null;
  createdAt: string;
};

type ClassifiedRenewalRow = RenewalDatasetRow & {
  renewalClass: RenewalClass;
};

const activityLabel: Record<ActivityLevel, string> = {
  sedentary: "Sedentario",
  light: "Ligero",
  moderate: "Moderado",
  active: "Activo",
  very_active: "Muy activo",
};

const goalLabel: Record<FitnessGoal, string> = {
  gain: "Ganar masa",
  lose: "Bajar grasa",
  maintain: "Mantenerse",
};

const demoRows: RenewalDatasetRow[] = [
  {
    userId: "cli-001",
    name: "Andrea Martinez",
    email: "andrea.martinez@correo.com",
    weeklyGymDays: 3,
    activityLevel: "moderate",
    fitnessGoal: "gain",
    startsAt: "2025-05-01",
    endsAt: "2025-08-01",
    autoRenew: true,
    total: 1350,
    paidAt: "2025-05-28",
    createdAt: "2025-05-28",
  },
  {
    userId: "cli-002",
    name: "Carlos Reyes",
    email: "carlos.reyes@correo.com",
    weeklyGymDays: 1,
    activityLevel: "light",
    fitnessGoal: "maintain",
    startsAt: "2025-04-10",
    endsAt: "2025-07-10",
    autoRenew: true,
    total: 0,
    paidAt: null,
    createdAt: "2025-05-20",
  },
  {
    userId: "cli-003",
    name: "Fernanda Ruiz",
    email: "fernanda.ruiz@correo.com",
    weeklyGymDays: 4,
    activityLevel: "active",
    fitnessGoal: "lose",
    startsAt: "2025-03-15",
    endsAt: "2025-06-15",
    autoRenew: false,
    total: 890,
    paidAt: "2025-05-30",
    createdAt: "2025-05-30",
  },
  {
    userId: "cli-004",
    name: "Miguel Torres",
    email: "miguel.torres@correo.com",
    weeklyGymDays: 2,
    activityLevel: "sedentary",
    fitnessGoal: "gain",
    startsAt: "2025-02-01",
    endsAt: "2025-05-01",
    autoRenew: false,
    total: 0,
    paidAt: null,
    createdAt: "2025-05-18",
  },
  {
    userId: "cli-005",
    name: "Sofia Hernandez",
    email: "sofia.hernandez@correo.com",
    weeklyGymDays: 5,
    activityLevel: "very_active",
    fitnessGoal: "maintain",
    startsAt: "2025-05-20",
    endsAt: "2025-08-20",
    autoRenew: true,
    total: 2290,
    paidAt: "2025-05-25",
    createdAt: "2025-05-25",
  },
  {
    userId: "cli-006",
    name: "Jorge Castillo",
    email: "jorge.castillo@correo.com",
    weeklyGymDays: 2,
    activityLevel: "moderate",
    fitnessGoal: "lose",
    startsAt: "2025-04-01",
    endsAt: "2025-07-01",
    autoRenew: false,
    total: 0,
    paidAt: null,
    createdAt: "2025-05-24",
  },
  {
    userId: "cli-007",
    name: "Valeria Gomez",
    email: "valeria.gomez@correo.com",
    weeklyGymDays: 4,
    activityLevel: "active",
    fitnessGoal: "gain",
    startsAt: "2025-05-12",
    endsAt: "2025-08-12",
    autoRenew: true,
    total: 1690,
    paidAt: "2025-05-26",
    createdAt: "2025-05-26",
  },
  {
    userId: "cli-008",
    name: "Luis Mendoza",
    email: "luis.mendoza@correo.com",
    weeklyGymDays: 1,
    activityLevel: "light",
    fitnessGoal: "maintain",
    startsAt: "2025-03-05",
    endsAt: "2025-06-05",
    autoRenew: false,
    total: 390,
    paidAt: null,
    createdAt: "2025-05-22",
  },
];

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function classifyRenewal(row: RenewalDatasetRow): ClassifiedRenewalRow {
  const activityWeight: Record<ActivityLevel, number> = {
    sedentary: -12,
    light: -4,
    moderate: 8,
    active: 14,
    very_active: 20,
  };
  const goalWeight: Record<FitnessGoal, number> = {
    gain: 4,
    lose: 4,
    maintain: 2,
  };
  const score = clamp(
    26 +
      row.weeklyGymDays * 6 +
      activityWeight[row.activityLevel] +
      goalWeight[row.fitnessGoal] +
      (row.autoRenew ? 18 : -6) +
      (row.total > 0 ? 12 : -18) +
      (row.paidAt ? 18 : -14),
  );

  return {
    ...row,
    renewalClass: score >= 60 ? "Renovara" : "No renovara",
  };
}

const moneyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function AdminClientRenewalPredictionPage() {
  const [resultFilter, setResultFilter] = useState<"Todos" | RenewalClass>("Renovara");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const rows = useMemo(() => demoRows.map(classifyRenewal), []);
  const visibleRows = useMemo(
    () =>
      rows.filter(
        (row) => resultFilter === "Todos" || row.renewalClass === resultFilter,
      ),
    [resultFilter, rows],
  );

  const renewCount = rows.filter((row) => row.renewalClass === "Renovara").length;
  const noRenewCount = rows.length - renewCount;
  const visibleRenewCount = visibleRows.filter(
    (row) => row.renewalClass === "Renovara",
  ).length;
  const visibleNoRenewCount = visibleRows.length - visibleRenewCount;
  const selectedClient = selectedClientId
    ? rows.find((row) => row.userId === selectedClientId) ?? null
    : null;
  const chartData = [
    { name: "Renovaran", value: renewCount },
    { name: "No renovaran", value: noRenewCount },
  ];

  return (
    <section className={styles.page}>
      <header className={styles.hero}>
        <span className={styles.heroBadge}>Clasificacion simulada</span>
        <h1>Clasificacion de renovacion</h1>
        <p>
          Vista previa para identificar que clientes renovaran y cuales requieren
          seguimiento. Los datos son demo y despues se conectaran al backend.
        </p>
      </header>

      <section className={styles.summaryGrid}>
        <article className={styles.chartPanel}>
          <div className={styles.sectionTitle}>
            <span>
              <FaCheck />
            </span>
            <div>
              <h2>Resumen de renovacion</h2>
              <p>Comparacion general de clientes que renovarian y no renovarian.</p>
            </div>
          </div>

          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={92}
                  paddingAngle={4}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <div className={styles.metricStack}>
          <article className={styles.metricCard}>
            <span className={styles.metricIconRenew}>
              <FaCheck />
            </span>
            <div>
              <span>Renovarian</span>
              <strong>{renewCount}</strong>
              <small>Clientes clasificados como renovacion esperada</small>
            </div>
          </article>

          <article className={styles.metricCard}>
            <span className={styles.metricIconRisk}>
              <FaXmark />
            </span>
            <div>
              <span>No renovarian</span>
              <strong>{noRenewCount}</strong>
              <small>Clientes que requieren seguimiento</small>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.tableHeader}>
          <div className={styles.sectionTitle}>
            <span>
              <FaTable />
            </span>
            <div>
              <h2>Clientes evaluados</h2>
              <p>
                {visibleRows.length} registros, {visibleRenewCount} renovarian y{" "}
                {visibleNoRenewCount} requieren seguimiento.
              </p>
            </div>
          </div>

          <label className={styles.tableFilter}>
            <span>Mostrar</span>
            <select
              value={resultFilter}
              onChange={(event) =>
                setResultFilter(event.target.value as "Todos" | RenewalClass)
              }
            >
              <option value="Renovara">Renovaran</option>
              <option value="No renovara">No renovaran</option>
              <option value="Todos">Todos</option>
            </select>
          </label>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Actividad</th>
                <th>Objetivo</th>
                <th>Periodo</th>
                <th>Renovacion auto</th>
                <th>Pago</th>
                <th>Resultado</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.userId}>
                  <td>
                    <strong>{row.name}</strong>
                    <span>{row.email}</span>
                  </td>
                  <td>
                    <strong>{activityLabel[row.activityLevel]}</strong>
                    <span>{row.weeklyGymDays} dias por semana</span>
                  </td>
                  <td>{goalLabel[row.fitnessGoal]}</td>
                  <td>
                    <strong>{row.startsAt}</strong>
                    <span>al {row.endsAt}</span>
                  </td>
                  <td>{row.autoRenew ? "Activada" : "Desactivada"}</td>
                  <td>
                    <strong>{moneyFormatter.format(row.total)}</strong>
                    <span>{row.paidAt ? `Pagado ${row.paidAt}` : "Pendiente"}</span>
                  </td>
                  <td>
                    <span
                      className={`${styles.resultPill} ${
                        row.renewalClass === "Renovara"
                          ? styles.resultRenew
                          : styles.resultNoRenew
                      }`}
                    >
                      {row.renewalClass === "Renovara" ? <FaCheck /> : <FaXmark />}
                      {row.renewalClass}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={styles.detailBtn}
                      onClick={() => setSelectedClientId(row.userId)}
                    >
                      <FaEye />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedClient && (
        <div className={styles.modalOverlay} onClick={() => setSelectedClientId(null)}>
          <section
            className={styles.detailModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="renewal-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.detailHeader}>
              <div>
                <span
                  className={`${styles.resultPill} ${
                    selectedClient.renewalClass === "Renovara"
                      ? styles.resultRenew
                      : styles.resultNoRenew
                  }`}
                >
                  {selectedClient.renewalClass === "Renovara" ? <FaCheck /> : <FaXmark />}
                  {selectedClient.renewalClass}
                </span>
                <h2 id="renewal-detail-title">{selectedClient.name}</h2>
                <p>{selectedClient.email}</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setSelectedClientId(null)}
                aria-label="Cerrar detalle"
              >
                <FaXmark />
              </button>
            </div>

            <div className={styles.detailGrid}>
              <article>
                <span>Nivel de actividad</span>
                <strong>{activityLabel[selectedClient.activityLevel]}</strong>
                <small>{selectedClient.weeklyGymDays} dias por semana</small>
              </article>
              <article>
                <span>Objetivo</span>
                <strong>{goalLabel[selectedClient.fitnessGoal]}</strong>
              </article>
              <article>
                <span>Periodo actual</span>
                <strong>{selectedClient.startsAt}</strong>
                <small>al {selectedClient.endsAt}</small>
              </article>
              <article>
                <span>Renovacion automatica</span>
                <strong>{selectedClient.autoRenew ? "Activada" : "Desactivada"}</strong>
              </article>
              <article>
                <span>Pago</span>
                <strong>{moneyFormatter.format(selectedClient.total)}</strong>
                <small>
                  {selectedClient.paidAt
                    ? `Pagado ${selectedClient.paidAt}`
                    : "Pago pendiente"}
                </small>
              </article>
              <article>
                <span>Registro evaluado</span>
                <strong>{selectedClient.createdAt}</strong>
              </article>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
