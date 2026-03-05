/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  exportProductsCsv,
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
      setMessage(error?.response?.data?.error || "Error validando importación.");
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
          "Error aplicando importación."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 12, marginTop: 20 }}>
      <h3>Importación / Exportación de Catálogo</h3>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={handleExport} disabled={loading}>
          Exportar CSV
        </button>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button onClick={handleUpload} disabled={loading || !file}>
          Subir CSV
        </button>

        <button onClick={handleValidate} disabled={loading || !batchId}>
          Validar lote
        </button>

        <button onClick={handleRefreshErrors} disabled={loading || !batchId}>
          Ver errores
        </button>

        <button onClick={handleCommit} disabled={loading || !batchId}>
          Aplicar importación
        </button>
      </div>

      {batchId && (
        <p>
          <strong>Batch ID:</strong> {batchId}
        </p>
      )}

      {message && <p>{message}</p>}

      {errors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Errores encontrados</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ccc", padding: 8 }}>Fila</th>
                  <th style={{ border: "1px solid #ccc", padding: 8 }}>Campo</th>
                  <th style={{ border: "1px solid #ccc", padding: 8 }}>Error</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err) => (
                  <tr key={err.error_id}>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{err.row_num}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{err.field_name}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{err.error_message}</td>
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