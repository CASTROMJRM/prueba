import { API } from "../../api/api";

export const exportProductsCsv = async () => {
  const response = await API.get("/admin/products/export/csv", {
    responseType: "blob",
  });
  return response.data;
};

export const uploadProductsCsv = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await API.post("/admin/products/import/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const validateProductsImport = async (batchId: string) => {
  const response = await API.post(`/admin/products/import/${batchId}/validate`);
  return response.data;
};

export const getProductsImportErrors = async (batchId: string) => {
  const response = await API.get(`/admin/products/import/${batchId}/errors`);
  return response.data;
};

export const commitProductsImport = async (batchId: string) => {
  const response = await API.post(`/admin/products/import/${batchId}/commit`);
  return response.data;
};