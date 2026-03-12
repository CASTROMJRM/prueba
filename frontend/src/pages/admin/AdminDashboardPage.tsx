import { useEffect, useState } from "react";
import styles from "./AdminDashboardPage.module.css";
import {
  getPostgresMonitoring,
  type MonitoringResponse,
} from "../../services/admin/monitoringService";

export default function AdminDashboardPage() {
  const [data, setData] = useState<MonitoringResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPostgresMonitoring();
      setData(response);
    } catch (err: any) {
      setError(err?.response?.data?.error || "No se pudo cargar el monitoreo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const summary = data?.summary;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Panel Administrativo</h1>
        <p>
          Monitoreo de PostgreSQL (tablas, peso y uso) para rol administrador.
        </p>
      </div>

      <button className={styles.refresh} onClick={load} disabled={loading}>
        {loading ? "Actualizando..." : "Actualizar métricas"}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.k}>Base de datos</div>
          <div className={styles.v}>{summary?.database || "-"}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.k}>Tablas</div>
          <div className={styles.v}>{summary?.tables ?? 0}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.k}>Peso total de tablas</div>
          <div className={styles.v}>{summary?.tablesSizeMB || "0.00"} MB</div>
        </div>
        <div className={styles.card}>
          <div className={styles.k}>Peso total DB</div>
          <div className={styles.v}>{summary?.databaseSizeMB || "0.00"} MB</div>
        </div>
      </div>

      <div className={styles.meta}>
        Última actualización:{" "}
        {data?.updatedAt ? new Date(data.updatedAt).toLocaleString() : "-"}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Schema</th>
              <th>Tabla</th>
              <th>Filas est.</th>
              <th>Tabla (MB)</th>
              <th>Índices (MB)</th>
              <th>Total (MB)</th>
              <th>Seq Scan</th>
              <th>Idx Scan</th>
            </tr>
          </thead>
          <tbody>
            {data?.tables?.length ? (
              data.tables.map((row) => (
                <tr key={`${row.schema}.${row.table}`}>
                  <td>{row.schema}</td>
                  <td>{row.table}</td>
                  <td>{row.estimatedRows}</td>
                  <td>{row.tableMB}</td>
                  <td>{row.indexMB}</td>
                  <td>{row.totalMB}</td>
                  <td>{row.seqScan}</td>
                  <td>{row.idxScan}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>{loading ? "Cargando..." : "Sin datos."}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
