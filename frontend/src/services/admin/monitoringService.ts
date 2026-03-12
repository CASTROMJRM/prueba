import { API } from "../../api/api";

export type MonitoringSummary = {
  database: string;
  tables: number;
  tablesSizeMB: string;
  databaseSizeMB: string;
};

export type MonitoringTable = {
  schema: string;
  table: string;
  estimatedRows: number;
  tableMB: string;
  indexMB: string;
  totalMB: string;
  seqScan: number;
  idxScan: number;
};

export type MonitoringResponse = {
  summary: MonitoringSummary;
  tables: MonitoringTable[];
  updatedAt: string;
};

export async function getPostgresMonitoring() {
  const { data } = await API.get<MonitoringResponse>(
    "/admin/monitoring/postgres",
  );
  return data;
}
