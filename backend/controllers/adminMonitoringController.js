import { sequelize } from "../config/sequelize.js";

const bytesToMB = (bytes = 0) => Number(bytes / (1024 * 1024)).toFixed(2);

export const getPostgresMonitoring = async (_req, res) => {
  try {
    const [summaryRows] = await sequelize.query(`
      SELECT
        current_database() AS database,
        COUNT(*)::int AS tables,
        COALESCE(SUM(pg_total_relation_size(c.oid)), 0)::bigint AS total_tables_bytes,
        pg_database_size(current_database())::bigint AS database_bytes
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relkind = 'r'
        AND n.nspname NOT IN ('pg_catalog', 'information_schema');
    `);

    const [tableRows] = await sequelize.query(`
      SELECT
        st.schemaname,
        st.relname AS table_name,
        st.n_live_tup::bigint AS est_rows,
        pg_relation_size(st.relid)::bigint AS table_bytes,
        pg_indexes_size(st.relid)::bigint AS index_bytes,
        pg_total_relation_size(st.relid)::bigint AS total_bytes,
        st.seq_scan::bigint AS seq_scan,
        st.idx_scan::bigint AS idx_scan
      FROM pg_stat_user_tables st
      ORDER BY pg_total_relation_size(st.relid) DESC;
    `);

    const summary = summaryRows[0] || {};

    return res.json({
      summary: {
        database: summary.database || "unknown",
        tables: Number(summary.tables || 0),
        tablesSizeMB: bytesToMB(summary.total_tables_bytes),
        databaseSizeMB: bytesToMB(summary.database_bytes),
      },
      tables: tableRows.map((row) => ({
        schema: row.schemaname,
        table: row.table_name,
        estimatedRows: Number(row.est_rows || 0),
        tableMB: bytesToMB(row.table_bytes),
        indexMB: bytesToMB(row.index_bytes),
        totalMB: bytesToMB(row.total_bytes),
        seqScan: Number(row.seq_scan || 0),
        idxScan: Number(row.idx_scan || 0),
      })),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: "No se pudieron obtener métricas de PostgreSQL",
      detail: error.message,
    });
  }
};
