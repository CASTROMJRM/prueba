/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import styles from "./ProductImportExportPanel.module.css";
import {
  exportProductsCsv,
  exportProductsImportTemplateCsv,
  uploadProductsCsv,
  validateProductsImport,
  getProductsImportErrors,
  commitProductsImport,
} from "../../../../services/admin/catalogImportExport";

type ImportErrorRow = {
  error_id: number;
  row_num: number;
  field_name: string;
  error_message: string;
};

export default function ProductImportExportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [batchId, setBatchId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<ImportErrorRow[]>([]);

  const handleExportTemplate = async () => {
    try {
      setLoading(true);
      setMessage("");

      const blob = await exportProductsImportTemplateCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla_importacion_productos.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("Plantilla de importación exportada correctamente.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.error ||
          "Error exportando plantilla de importación.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      setMessage("");

      const blob = await exportProductsCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "catalogo_productos.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("CSV exportado correctamente.");
    } catch (error: any) {
      setMessage(error?.response?.data?.error || "Error exportando CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Selecciona un archivo CSV.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setErrors([]);

      const data = await uploadProductsCsv(file);
      setBatchId(data.batchId);
      setMessage(`Archivo subido correctamente. Batch ID: ${data.batchId}`);
    } catch (error: any) {
      setMessage(error?.response?.data?.error || "Error subiendo CSV.");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!batchId) {
      setMessage("No hay batchId para validar.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await validateProductsImport(batchId);
      setErrors(data.errors || []);

      if (data.errorsCount > 0) {
        setMessage(`Se encontraron ${data.errorsCount} errores.`);
      } else {
        setMessage("Validación exitosa. No hay errores.");
      }
    } catch (error: any) {
      setMessage(
        error?.response?.data?.error || "Error validando importación.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshErrors = async () => {
    if (!batchId) {
      setMessage("No hay batchId.");
      return;
    }

    try {
      setLoading(true);
      const data = await getProductsImportErrors(batchId);
      setErrors(data.errors || []);
      setMessage(`Errores cargados: ${data.errorsCount}`);
    } catch (error: any) {
      setMessage(error?.response?.data?.error || "Error obteniendo errores.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!batchId) {
      setMessage("No hay batchId.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const data = await commitProductsImport(batchId);
      setMessage(data.message || "Importación aplicada correctamente.");
    } catch (error: any) {
      setMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Error aplicando importación.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>Importación / Exportación de Catálogo</h3>

      <div className={styles.grid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Exportación</p>
          <p className={styles.cardHint}>
            Descarga catálogo completo o plantilla para importar.
          </p>
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.ghost}`}
              onClick={handleExport}
              disabled={loading}
            >
              Exportar CSV completo
            </button>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleExportTemplate}
              disabled={loading}
            >
              Exportar plantilla
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Importación</p>
          <p className={styles.cardHint}>
            Sube el CSV y luego valida o aplica el lote.
          </p>
          <input
            className={styles.fileInput}
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleUpload}
              disabled={loading || !file}
            >
              Subir CSV
            </button>
            <button
              className={`${styles.button} ${styles.warning}`}
              onClick={handleValidate}
              disabled={loading || !batchId}
            >
              Validar lote
            </button>
            <button
              className={`${styles.button} ${styles.ghost}`}
              onClick={handleRefreshErrors}
              disabled={loading || !batchId}
            >
              Ver errores
            </button>
            <button
              className={`${styles.button} ${styles.success}`}
              onClick={handleCommit}
              disabled={loading || !batchId}
            >
              Aplicar importación
            </button>
          </div>
        </div>
      </div>

      <div className={styles.infoRow}>
        {batchId && (
          <span className={`${styles.badge} ${styles.batchBadge}`}>
            Batch ID: {batchId}
          </span>
        )}
        {message && (
          <span className={`${styles.badge} ${styles.message}`}>{message}</span>
        )}
      </div>

      {errors.length > 0 && (
        <div className={styles.errorsWrap}>
          <h4 className={styles.errorsTitle}>Errores encontrados</h4>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Fila</th>
                  <th className={styles.th}>Campo</th>
                  <th className={styles.th}>Error</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr key={err.error_id}>
                    <td className={styles.td}>{err.row_num}</td>
                    <td className={styles.td}>{err.field_name}</td>
                    <td className={styles.td}>{err.error_message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
