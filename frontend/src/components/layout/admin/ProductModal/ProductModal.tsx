import { useEffect, useMemo, useState } from "react";
import styles from "./ProductModal.module.css";

type ProductStatus = "Activo" | "Inactivo";
type ProductType = "Suplementación" | "Ropa";

export type ProductFormData = {
  name: string;
  category: string;
  price: number;
  stock: number;
  status: ProductStatus;
  image?: string;
  productType: ProductType;
  supplementFlavor?: string;
  supplementPresentation?: string;
  supplementServings?: string;
  apparelSize?: string;
  apparelColor?: string;
  apparelMaterial?: string;
};

interface Props {
  open: boolean;
  title?: string;
  initial?: Partial<ProductFormData>;
  onClose: () => void;
  onSave: (data: ProductFormData) => void;
}

const defaultData: ProductFormData = {
  name: "",
  category: "",
  price: 0,
  stock: 0,
  status: "Activo",
  image: "",
  productType: "Suplementación",
};

export default function ProductModal({
  open,
  title = "Nuevo producto",
  initial,
  onClose,
  onSave,
}: Props) {
  const [data, setData] = useState<ProductFormData>(defaultData);

  useEffect(() => {
    if (open) {
      setData({ ...defaultData, ...initial } as ProductFormData);
    }
  }, [open, initial]);

  const canSave = useMemo(() => {
    const hasSupplementDetails =
      data.supplementPresentation?.trim() &&
      data.supplementFlavor?.trim() &&
      data.supplementServings?.trim();
    const hasApparelDetails =
      data.apparelSize?.trim() && data.apparelColor?.trim();
    return (
      data.name.trim().length >= 3 &&
      data.category.trim().length >= 2 &&
      Number.isFinite(data.price) &&
      data.price > 0 &&
      Number.isFinite(data.stock) &&
      data.stock >= 0 &&
      (data.productType === "Suplementación"
        ? Boolean(hasSupplementDetails)
        : Boolean(hasApparelDetails))
    );
  }, [data]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      ...data,
      name: data.name.trim(),
      category: data.category.trim(),
      image: data.image?.trim() || "",
      supplementFlavor: data.supplementFlavor?.trim() || "",
      supplementPresentation: data.supplementPresentation?.trim() || "",
      supplementServings: data.supplementServings?.trim() || "",
      apparelSize: data.apparelSize?.trim() || "",
      apparelColor: data.apparelColor?.trim() || "",
      apparelMaterial: data.apparelMaterial?.trim() || "",
    });
  };

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>Completa los datos del producto.</p>
          </div>
          <button
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className={styles.body}>
          <div className={styles.grid}>
            <label className={`${styles.field} ${styles.span2}`}>
              <span>Tipo de producto</span>
              <select
                value={data.productType}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    productType: e.target.value as ProductType,
                    supplementFlavor:
                      e.target.value === "Suplementación"
                        ? p.supplementFlavor
                        : "",
                    supplementPresentation:
                      e.target.value === "Suplementación"
                        ? p.supplementPresentation
                        : "",
                    supplementServings:
                      e.target.value === "Suplementación"
                        ? p.supplementServings
                        : "",
                    apparelSize: e.target.value === "Ropa" ? p.apparelSize : "",
                    apparelColor:
                      e.target.value === "Ropa" ? p.apparelColor : "",
                    apparelMaterial:
                      e.target.value === "Ropa" ? p.apparelMaterial : "",
                  }))
                }
              >
                <option value="Suplementación">Suplementación</option>
                <option value="Ropa">Ropa</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Nombre</span>
              <input
                value={data.name}
                onChange={(e) =>
                  setData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ej. Creatina Monohidratada"
              />
            </label>

            <label className={styles.field}>
              <span>Categoría</span>
              <input
                value={data.category}
                onChange={(e) =>
                  setData((p) => ({ ...p, category: e.target.value }))
                }
                placeholder={
                  data.productType === "Suplementación"
                    ? "Ej. Proteína / Creatina / Pre-entreno"
                    : "Ej. Playera / Leggings / Sudadera"
                }
              />
            </label>

            {data.productType === "Suplementación" ? (
              <>
                <label className={styles.field}>
                  <span>Presentación</span>
                  <input
                    value={data.supplementPresentation || ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        supplementPresentation: e.target.value,
                      }))
                    }
                    placeholder="Ej. 900 g / 1.8 kg"
                  />
                </label>

                <label className={styles.field}>
                  <span>Sabor</span>
                  <input
                    value={data.supplementFlavor || ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        supplementFlavor: e.target.value,
                      }))
                    }
                    placeholder="Ej. Chocolate / Vainilla"
                  />
                </label>

                <label className={styles.field}>
                  <span>Porciones</span>
                  <input
                    value={data.supplementServings || ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        supplementServings: e.target.value,
                      }))
                    }
                    placeholder="Ej. 30 servicios"
                  />
                </label>
              </>
            ) : (
              <>
                <label className={styles.field}>
                  <span>Talla</span>
                  <input
                    value={data.apparelSize || ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, apparelSize: e.target.value }))
                    }
                    placeholder="Ej. CH / M / G"
                  />
                </label>

                <label className={styles.field}>
                  <span>Color</span>
                  <input
                    value={data.apparelColor || ""}
                    onChange={(e) =>
                      setData((p) => ({ ...p, apparelColor: e.target.value }))
                    }
                    placeholder="Ej. Negro / Azul"
                  />
                </label>

                <label className={styles.field}>
                  <span>Material</span>
                  <input
                    value={data.apparelMaterial || ""}
                    onChange={(e) =>
                      setData((p) => ({
                        ...p,
                        apparelMaterial: e.target.value,
                      }))
                    }
                    placeholder="Ej. Algodón / Dry-fit"
                  />
                </label>
              </>
            )}
            <label className={styles.field}>
              <span>Estado</span>
              <select
                value={data.status}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    status: e.target.value as ProductStatus,
                  }))
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Imagen (URL)</span>
              <input
                value={data.image || ""}
                onChange={(e) =>
                  setData((p) => ({ ...p, image: e.target.value }))
                }
                placeholder="https://..."
              />
            </label>
          </div>

          {!!data.image?.trim() && (
            <div className={styles.preview}>
              <img
                src={data.image}
                alt="Vista previa"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.btnPrimary}
            onClick={handleSave}
            disabled={!canSave}
            title={!canSave ? "Completa los campos obligatorios" : "Guardar"}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
