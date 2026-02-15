import { useEffect, useMemo, useState } from "react";
import styles from "./ModalSuscripciones.module.css";

type SubscriptionStatus = "Activo" | "Inactivo";
type SubscriptionBilling = "mes" | "trimestre" | "año";
type SubscriptionColor = "white" | "red" | "black";

export type SubscriptionFormData = {
  name: string;
  level: string;
  price: number;
  billing: SubscriptionBilling;
  status: SubscriptionStatus;
  color: SubscriptionColor;
  description: string;
  features: string[];
  highlight: boolean;
};

type FormState = SubscriptionFormData & {
  featuresText: string;
};

interface Props {
  open: boolean;
  title?: string;
  initial?: Partial<SubscriptionFormData>;
  onClose: () => void;
  onSave: (data: SubscriptionFormData) => void;
}

const defaultData: SubscriptionFormData = {
  name: "",
  level: "",
  price: 0,
  billing: "mes",
  status: "Activo",
  color: "red",
  description: "",
  features: [],
  highlight: false,
};

const toFeaturesText = (features?: string[]) =>
  (features || []).filter(Boolean).join("\n");

const toFeaturesList = (value: string) =>
  value
    .split("\n")
    .map((feature) => feature.trim())
    .filter(Boolean);

export default function ModalSuscripciones({
  open,
  title = "Nueva suscripción",
  initial,
  onClose,
  onSave,
}: Props) {
  const [data, setData] = useState<FormState>({
    ...defaultData,
    featuresText: "",
  });

  useEffect(() => {
    if (!open) return;
    const next = { ...defaultData, ...initial } as SubscriptionFormData;
    setData({
      ...next,
      featuresText: toFeaturesText(next.features),
    });
  }, [open, initial]);

  const parsedFeatures = useMemo(
    () => toFeaturesList(data.featuresText),
    [data.featuresText],
  );

  const canSave = useMemo(() => {
    return (
      data.name.trim().length >= 3 &&
      data.level.trim().length >= 3 &&
      Number.isFinite(data.price) &&
      data.price > 0 &&
      data.description.trim().length >= 10 &&
      parsedFeatures.length >= 2
    );
  }, [data, parsedFeatures]);

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
      name: data.name.trim(),
      level: data.level.trim(),
      price: data.price,
      billing: data.billing,
      status: data.status,
      color: data.color,
      description: data.description.trim(),
      features: parsedFeatures,
      highlight: data.highlight,
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
            <p className={styles.subtitle}>
              Define precio, beneficios y vigencia de la suscripción.
            </p>
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
            <label className={styles.field}>
              <span>Nombre del plan</span>
              <input
                value={data.name}
                onChange={(e) =>
                  setData((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Ej. Titanium Rojo"
              />
            </label>

            <label className={styles.field}>
              <span>Nivel</span>
              <input
                value={data.level}
                onChange={(e) =>
                  setData((p) => ({ ...p, level: e.target.value }))
                }
                placeholder="Ej. Básico / Premium"
              />
            </label>

            <label className={styles.field}>
              <span>Precio (MXN)</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={data.price}
                onChange={(e) =>
                  setData((p) => ({ ...p, price: Number(e.target.value) }))
                }
              />
            </label>

            <label className={styles.field}>
              <span>Periodicidad</span>
              <select
                value={data.billing}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    billing: e.target.value as SubscriptionBilling,
                  }))
                }
              >
                <option value="mes">Mensual</option>
                <option value="trimestre">Trimestral</option>
                <option value="año">Anual</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Estado</span>
              <select
                value={data.status}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    status: e.target.value as SubscriptionStatus,
                  }))
                }
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Color de tarjeta</span>
              <select
                value={data.color}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    color: e.target.value as SubscriptionColor,
                  }))
                }
              >
                <option value="white">Blanco</option>
                <option value="red">Rojo</option>
                <option value="black">Negro</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Destacado</span>
              <select
                value={data.highlight ? "yes" : "no"}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    highlight: e.target.value === "yes",
                  }))
                }
              >
                <option value="no">No</option>
                <option value="yes">Sí</option>
              </select>
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Descripción</span>
              <textarea
                rows={3}
                value={data.description}
                onChange={(e) =>
                  setData((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe el valor principal del plan."
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Características (una por línea)</span>
              <textarea
                rows={4}
                value={data.featuresText}
                onChange={(e) =>
                  setData((p) => ({ ...p, featuresText: e.target.value }))
                }
                placeholder="Acceso 24/7&#10;Clases grupales premium&#10;App Titanium"
              />
            </label>
          </div>

          {!!parsedFeatures.length && (
            <div className={styles.preview}>
              <p className={styles.previewTitle}>Características capturadas</p>
              <ul className={styles.featureList}>
                {parsedFeatures.map((feature, idx) => (
                  <li key={`${feature}-${idx}`}>{feature}</li>
                ))}
              </ul>
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
            title={
              !canSave ? "Completa los campos obligatorios" : "Guardar cambios"
            }
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
