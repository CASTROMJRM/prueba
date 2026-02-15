import { useMemo, useState } from "react";
import styles from "./AdminSuscripcionesPage.module.css";
import ModalSuscripciones from "../../components/layout/admin/ModalSuscripciones/ModalSuscripciones";
import type { SubscriptionFormData } from "../../components/layout/admin/ModalSuscripciones/ModalSuscripciones";

type SubscriptionStatus = "Activo" | "Inactivo";
type SubscriptionBilling = "mes" | "trimestre" | "año";
type SubscriptionColor = "white" | "red" | "black";

type Subscription = {
  id: string;
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

const initialSubscriptions: Subscription[] = [
  {
    id: "S-001",
    name: "Carte Blanche",
    level: "Básico",
    price: 299,
    billing: "mes",
    status: "Activo",
    color: "white",
    description: "Perfecto para comenzar tu journey fitness.",
    features: [
      "Acceso a área de pesas",
      "Clases grupales básicas",
      "Vestidores y regaderas",
      "App Titanium básica",
    ],
    highlight: false,
  },
  {
    id: "S-002",
    name: "Titanium Rojo",
    level: "Más popular",
    price: 499,
    billing: "mes",
    status: "Activo",
    color: "red",
    description: "El equilibrio perfecto entre calidad y precio.",
    features: [
      "Acceso 24/7",
      "Clases grupales premium",
      "Área cardio completo",
      "2 sesiones con entrenador",
    ],
    highlight: true,
  },
  {
    id: "S-003",
    name: "Titanium Negro",
    level: "Premium",
    price: 799,
    billing: "mes",
    status: "Inactivo",
    color: "black",
    description: "Experiencia fitness de élite completa.",
    features: [
      "Entrenador personal dedicado",
      "Acceso a zona VIP",
      "Nutricionista certificado",
      "Sesiones ilimitadas con coach",
    ],
    highlight: false,
  },
];

export default function AdminSuscripcionesPage() {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(initialSubscriptions);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [status, setStatus] = useState("Todos");
  const [sort, setSort] = useState<"name" | "price">("name");

  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Subscription | null>(null);

  const levels = useMemo(() => {
    const set = new Set(subscriptions.map((s) => s.level));
    return ["Todos", ...Array.from(set)];
  }, [subscriptions]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = subscriptions.filter((s) => {
      const matchQuery =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      const matchLevel = level === "Todos" || s.level === level;
      const matchStatus = status === "Todos" || s.status === status;
      return matchQuery && matchLevel && matchStatus;
    });

    list = list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return a.price - b.price;
    });

    return list;
  }, [subscriptions, query, level, status, sort]);

  const nextId = () => {
    const nums = subscriptions
      .map((s) => Number(s.id.replace("S-", "")))
      .filter((n) => Number.isFinite(n));
    const max = nums.length ? Math.max(...nums) : 0;
    const n = max + 1;
    return `S-${String(n).padStart(3, "0")}`;
  };

  const onDelete = (id: string) => {
    const ok = confirm(`¿Eliminar suscripción ${id}?`);
    if (!ok) return;
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  const openNew = () => {
    setEditing(null);
    setOpenModal(true);
  };

  const openEdit = (subscription: Subscription) => {
    setEditing(subscription);
    setOpenModal(true);
  };

  const handleSave = (data: SubscriptionFormData) => {
    if (editing) {
      setSubscriptions((prev) =>
        prev.map((s) =>
          s.id === editing.id
            ? {
                ...s,
                ...data,
              }
            : s,
        ),
      );
      setEditing(null);
      setOpenModal(false);
      return;
    }

    const newSubscription: Subscription = {
      id: nextId(),
      ...data,
    };

    setSubscriptions((prev) => [newSubscription, ...prev]);
    setOpenModal(false);

    if (level !== "Todos" && level !== newSubscription.level) {
      setLevel("Todos");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Suscripciones</h1>
          <p className={styles.subtitle}>
            Administra precios, beneficios y planes activos.
          </p>
        </div>

        <button className={styles.primaryBtn} onClick={openNew}>
          + Nueva suscripción
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            placeholder="Buscar por ID o nombre…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            className={styles.select}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>

          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as "name" | "price")}
          >
            <option value="name">Ordenar: Nombre</option>
            <option value="price">Ordenar: Precio</option>
          </select>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Nivel</th>
                <th className={styles.thRight}>Precio</th>
                <th>Periodicidad</th>
                <th>Características</th>
                <th>Estado</th>
                <th className={styles.thRight}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const preview = s.features.slice(0, 2);
                const remaining = s.features.length - preview.length;
                return (
                  <tr key={s.id}>
                    <td>
                      <div className={styles.planCell}>
                        <span className={styles.planName}>{s.name}</span>
                        <div className={styles.planMeta}>
                          <span>{s.id}</span>
                          <span>{s.description}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.tagGroup}>
                        <span className={styles.tag}>{s.level}</span>
                        {s.highlight && (
                          <span className={`${styles.tag} ${styles.highlight}`}>
                            Destacado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={styles.tdRight}>
                      ${s.price.toFixed(2)} MXN
                    </td>
                    <td>{s.billing}</td>
                    <td>
                      <div className={styles.features}>
                        {preview.map((feature, idx) => (
                          <span key={`${s.id}-feature-${idx}`}>
                            • {feature}
                          </span>
                        ))}
                        {remaining > 0 && <span>+ {remaining} más</span>}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.status} ${
                          s.status === "Activo"
                            ? styles.statusOn
                            : styles.statusOff
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className={styles.tdRight}>
                      <div className={styles.actions}>
                        <button
                          className={styles.btnGhost}
                          onClick={() => openEdit(s)}
                        >
                          Editar
                        </button>
                        <button
                          className={styles.btnDanger}
                          onClick={() => onDelete(s.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className={styles.empty}>
                    No hay suscripciones con esos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.footer}>
          <span className={styles.count}>
            Mostrando <b>{filtered.length}</b> suscripciones
          </span>
        </div>
      </div>

      <ModalSuscripciones
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditing(null);
        }}
        title={editing ? "Editar suscripción" : "Nueva suscripción"}
        initial={editing ?? undefined}
        onSave={handleSave}
      />
    </div>
  );
}
