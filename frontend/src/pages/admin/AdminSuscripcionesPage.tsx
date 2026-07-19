import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaEnvelope,
  FaMoneyBillWave,
  FaSearch,
  FaSyncAlt,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import {
  approveSubscriptionGroup,
  createManualGroupMembershipPayment,
  createManualMembershipPayment,
  getMembershipPlans,
  getPendingSubscriptionGroups,
  type ManualGroupPaymentPayload,
  type ManualPaymentPayload,
  type MembershipPlan,
} from "../../services/membershipService";
import { showAlert, showSuccessToast } from "../../utils/feedback";
import styles from "./AdminSuscripcionesPage.module.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type AdminUser = {
  id: string;
  email: string;
  role: "cliente" | "entrenador" | "administrador";
  isVerified?: boolean;
  createdAt?: string;
};

type PaymentMethod = "cash" | "transfer" | "card_terminal";

type PendingGroupMember = {
  id: string;
  invitedEmail: string;
  status: string;
  role: string;
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    role: string;
  } | null;
};

type PendingGroup = {
  id: string;
  status: string;
  memberLimit: number;
  totalAmount: string | number;
  pricePerPerson?: string | number | null;
  startsAt?: string | null;
  endsAt?: string | null;
  plan?: MembershipPlan;
  owner?: {
    id: string;
    email: string;
    role: string;
  };
  members?: PendingGroupMember[];
  payment?: {
    id: string;
    status: string;
    method: string;
    provider: string;
    amount: string | number;
  };
};

const currencyFormatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  };
}

function formatCurrency(value: string | number | null | undefined) {
  const numericValue = Number(value ?? 0);
  return currencyFormatter.format(Number.isFinite(numericValue) ? numericValue : 0);
}

function getPlanLabel(plan: MembershipPlan) {
  if (plan.type === "group") {
    return `Paquete ${plan.maxPeople} personas`;
  }

  if (plan.type === "student") {
    return "Estudiante";
  }

  if (plan.type === "visit") {
    return "Visita";
  }

  return "Individual";
}

function getMethodProvider(method: PaymentMethod) {
  if (method === "card_terminal") {
    return "mercadopago_point";
  }

  if (method === "transfer") {
    return "bank_transfer";
  }

  return "none";
}

const statusLabels: Record<string, string> = {
  active: "Activo",
  accepted: "Aceptado",
  approved: "Aprobado",
  invited: "Invitado",
  pending: "Pendiente",
  pending_approval: "Pendiente de aprobación",
  payment_confirmed: "Pago confirmado",
  payment_pending: "Pago pendiente",
};

function getReadableStatus(status: string | null | undefined) {
  if (!status) {
    return "Sin estado";
  }

  return statusLabels[status] ?? status.replace(/_/g, " ");
}

function isReadyStatus(status: string) {
  return ["accepted", "approved", "active"].includes(status);
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminSuscripcionesPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingGroups, setPendingGroups] = useState<PendingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingIndividual, setSavingIndividual] = useState(false);
  const [savingGroup, setSavingGroup] = useState(false);
  const [approvingGroupId, setApprovingGroupId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedIndividualPlanId, setSelectedIndividualPlanId] = useState("");
  const [individualMethod, setIndividualMethod] = useState<PaymentMethod>("cash");
  const [individualReference, setIndividualReference] = useState("");
  const [individualNotes, setIndividualNotes] = useState("");
  const [individualStartsAt, setIndividualStartsAt] = useState("");

  const [ownerUserId, setOwnerUserId] = useState("");
  const [selectedGroupPlanId, setSelectedGroupPlanId] = useState("");
  const [groupMethod, setGroupMethod] = useState<PaymentMethod>("cash");
  const [groupReference, setGroupReference] = useState("");
  const [groupNotes, setGroupNotes] = useState("");
  const [groupStartsAt, setGroupStartsAt] = useState("");
  const [memberEmailsText, setMemberEmailsText] = useState("");

  const clients = useMemo(
    () => users.filter((user) => user.role === "cliente"),
    [users]
  );

  const individualPlans = useMemo(
    () => plans.filter((plan) => plan.type !== "group" && plan.isActive),
    [plans]
  );

  const groupPlans = useMemo(
    () => plans.filter((plan) => plan.type === "group" && plan.isActive),
    [plans]
  );

  const selectedIndividualPlan = useMemo(
    () => individualPlans.find((plan) => plan.id === selectedIndividualPlanId),
    [individualPlans, selectedIndividualPlanId]
  );

  const selectedGroupPlan = useMemo(
    () => groupPlans.find((plan) => plan.id === selectedGroupPlanId),
    [groupPlans, selectedGroupPlanId]
  );

  const expectedGroupGuests = selectedGroupPlan
    ? Math.max(Number(selectedGroupPlan.maxPeople) - 1, 0)
    : 0;

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return plans;
    }

    return plans.filter((plan) => {
      return (
        plan.name.toLowerCase().includes(normalizedQuery) ||
        plan.slug.toLowerCase().includes(normalizedQuery) ||
        plan.type.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [plans, query]);

  const activePlansCount = plans.filter((plan) => plan.isActive).length;
  const groupPlansCount = groupPlans.length;
  const averagePrice =
    plans.length > 0
      ? plans.reduce((sum, plan) => sum + Number(plan.price), 0) / plans.length
      : 0;

  async function loadData() {
    setLoading(true);

    try {
      const [plansResponse, usersResponse, groupsResponse] = await Promise.all([
        getMembershipPlans(),
        axios.get(`${API_URL}/admin/users`, authHeaders()),
        getPendingSubscriptionGroups(),
      ]);

      const loadedPlans: MembershipPlan[] = plansResponse.plans ?? [];
      const loadedUsers: AdminUser[] = usersResponse.data.users ?? [];
      const loadedGroups: PendingGroup[] = groupsResponse.groups ?? [];

      setPlans(loadedPlans);
      setUsers(loadedUsers);
      setPendingGroups(loadedGroups);

      const firstIndividual = loadedPlans.find(
        (plan) => plan.type !== "group" && plan.isActive
      );
      const firstGroup = loadedPlans.find(
        (plan) => plan.type === "group" && plan.isActive
      );
      const firstClient = loadedUsers.find((user) => user.role === "cliente");

      setSelectedIndividualPlanId((current) => current || firstIndividual?.id || "");
      setSelectedGroupPlanId((current) => current || firstGroup?.id || "");
      setSelectedUserId((current) => current || firstClient?.id || "");
      setOwnerUserId((current) => current || firstClient?.id || "");
    } catch (error) {
      console.error("LOAD MEMBERSHIPS ADMIN ERROR:", error);
      void showAlert({
        title: "No se pudo cargar el módulo de membresías",
        text: "Revisa que el backend esté activo y que tu usuario sea administrador.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCreateIndividualPayment() {
    if (!selectedUserId || !selectedIndividualPlanId) {
      void showAlert({
        title: "Faltan datos",
        text: "Selecciona un cliente y un plan individual.",
        icon: "warning",
      });
      return;
    }

    const payload: ManualPaymentPayload = {
      userId: selectedUserId,
      planId: selectedIndividualPlanId,
      method: individualMethod,
      provider: getMethodProvider(individualMethod),
      reference: individualReference,
      notes: individualNotes,
      startsAt: individualStartsAt || undefined,
    };

    setSavingIndividual(true);

    try {
      await createManualMembershipPayment(payload);

      showSuccessToast(
        "Membresía activada",
        "El pago fue registrado y la membresía individual quedó activa."
      );

      setIndividualReference("");
      setIndividualNotes("");
      setIndividualStartsAt("");
      await loadData();
    } catch (error) {
      console.error("CREATE INDIVIDUAL PAYMENT ERROR:", error);
      void showAlert({
        title: "No se pudo registrar el pago",
        text: "Verifica que el cliente no tenga errores y que el plan no sea grupal.",
        icon: "error",
      });
    } finally {
      setSavingIndividual(false);
    }
  }

  function parseMemberEmails() {
    return memberEmailsText
      .split(/[\n,;]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }

  async function handleCreateGroupPayment() {
    if (!ownerUserId || !selectedGroupPlanId) {
      void showAlert({
        title: "Faltan datos",
        text: "Selecciona el titular y el plan grupal.",
        icon: "warning",
      });
      return;
    }

    const selectedPlan = plans.find((plan) => plan.id === selectedGroupPlanId);
    const memberEmails = parseMemberEmails();
    const expectedGuests = selectedPlan ? Number(selectedPlan.maxPeople) - 1 : 0;

    if (memberEmails.length > expectedGuests) {
      void showAlert({
        title: "Demasiados integrantes",
        text: `Este paquete solo permite ${expectedGuests} correos además del titular.`,
        icon: "warning",
      });
      return;
    }

    const payload: ManualGroupPaymentPayload = {
      ownerUserId,
      planId: selectedGroupPlanId,
      method: groupMethod,
      provider: getMethodProvider(groupMethod),
      reference: groupReference,
      notes: groupNotes,
      startsAt: groupStartsAt || undefined,
      memberEmails,
    };

    setSavingGroup(true);

    try {
      await createManualGroupMembershipPayment(payload);

      showSuccessToast(
        "Paquete registrado",
        "El pago quedó registrado y el paquete quedó pendiente de aceptación/aprobación."
      );

      setGroupReference("");
      setGroupNotes("");
      setGroupStartsAt("");
      setMemberEmailsText("");
      await loadData();
    } catch (error) {
      console.error("CREATE GROUP PAYMENT ERROR:", error);
      void showAlert({
        title: "No se pudo registrar el paquete",
        text: "Verifica que el plan sea grupal y que los correos sean válidos.",
        icon: "error",
      });
    } finally {
      setSavingGroup(false);
    }
  }

  async function handleApproveGroup(groupId: string) {
    const confirmed = window.confirm(
      "¿Aprobar este paquete y activar membresía para todos los integrantes?"
    );

    if (!confirmed) return;

    setApprovingGroupId(groupId);

    try {
      await approveSubscriptionGroup(groupId);

      showSuccessToast(
        "Paquete aprobado",
        "Las membresías de los integrantes fueron activadas correctamente."
      );

      await loadData();
    } catch (error) {
      console.error("APPROVE GROUP ERROR:", error);
      void showAlert({
        title: "No se pudo aprobar el paquete",
        text: "Recuerda que todos los integrantes deben aceptar y tener cuenta registrada.",
        icon: "error",
      });
    } finally {
      setApprovingGroupId(null);
    }
  }

  return (
    <section className={styles.pageShell}>
      <header className={styles.heroSection}>
        <div>
          <span className={styles.heroEyebrow}>Módulo real del negocio</span>
          <h1 className={styles.heroTitle}>Membresías, pagos y paquetes</h1>
          <p className={styles.heroText}>
            Desde aquí el administrador registra pagos presenciales, pagos con
            terminal Mercado Pago, transferencias y paquetes grupales. Cada pago
            confirmado activa la membresía del cliente o deja el paquete en
            validación.
          </p>
        </div>

        <button
          type="button"
          className={styles.heroActionBtn}
          onClick={() => void loadData()}
          disabled={loading}
        >
          <FaSyncAlt />
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </header>

      <div className={styles.statsGrid}>
        <article className={styles.statCard}>
          <span className={styles.statIcon}>
            <FaWallet />
          </span>
          <div>
            <p className={styles.statLabel}>Planes activos</p>
            <strong className={styles.statValue}>{activePlansCount}</strong>
            <span className={styles.statHint}>
              Planes cargados desde PostgreSQL.
            </span>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statIcon}>
            <FaUsers />
          </span>
          <div>
            <p className={styles.statLabel}>Paquetes grupales</p>
            <strong className={styles.statValue}>{groupPlansCount}</strong>
            <span className={styles.statHint}>
              Paquetes para 2, 3 o 4 personas.
            </span>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statIcon}>
            <FaClock />
          </span>
          <div>
            <p className={styles.statLabel}>Pendientes</p>
            <strong className={styles.statValue}>{pendingGroups.length}</strong>
            <span className={styles.statHint}>
              Paquetes esperando aceptación o aprobación.
            </span>
          </div>
        </article>

        <article className={styles.statCard}>
          <span className={styles.statIcon}>
            <FaMoneyBillWave />
          </span>
          <div>
            <p className={styles.statLabel}>Precio promedio</p>
            <strong className={styles.statValue}>
              {formatCurrency(averagePrice)}
            </strong>
            <span className={styles.statHint}>
              Referencia comercial del catálogo.
            </span>
          </div>
        </article>
      </div>

      <section className={`${styles.panelCard} ${styles.workflowPanel}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.detailEyebrow}>Guía rápida</span>
            <h2 className={styles.detailTitle}>Flujo para administrar suscripciones</h2>
            <p className={styles.sectionText}>
              Trabaja de arriba hacia abajo: primero valida el plan, después
              registra el pago y al final revisa si hay paquetes por aprobar.
            </p>
          </div>
        </div>

        <div className={styles.workflowGrid}>
          <article className={styles.workflowCard}>
            <span className={styles.workflowNumber}>1</span>
            <div>
              <strong>Revisa catálogo</strong>
              <p>Confirma precio, duración y tipo antes de registrar el pago.</p>
            </div>
          </article>

          <article className={styles.workflowCard}>
            <span className={styles.workflowNumber}>2</span>
            <div>
              <strong>Pago individual</strong>
              <p>Selecciona cliente, plan, método y referencia del comprobante.</p>
            </div>
          </article>

          <article className={styles.workflowCard}>
            <span className={styles.workflowNumber}>3</span>
            <div>
              <strong>Pago grupal</strong>
              <p>Elige titular, paquete y agrega los correos de integrantes.</p>
            </div>
          </article>

          <article className={styles.workflowCard}>
            <span className={styles.workflowNumber}>4</span>
            <div>
              <strong>Aprueba paquetes</strong>
              <p>Activa el paquete cuando todos los integrantes estén listos.</p>
            </div>
          </article>
        </div>
      </section>

      <section className={`${styles.panelCard} ${styles.catalogPanel}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.detailEyebrow}>Catálogo real</span>
            <h2 className={styles.detailTitle}>Planes disponibles</h2>
            <p className={styles.sectionText}>
              Consulta los planes cargados desde MembershipPlans antes de
              registrar una membresía.
            </p>
          </div>

          <label className={styles.searchBox}>
            <FaSearch />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar plan..."
            />
          </label>
        </div>

        <div className={styles.sectionHelp}>
          <FaSearch />
          <span>
            Usa el buscador para encontrar por nombre, slug o tipo. El precio
            mostrado aquí es el que se enviará al registrar el pago.
          </span>
        </div>

        {loading ? (
          <div className={styles.emptyStateCard}>Cargando planes...</div>
        ) : filteredPlans.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Tipo</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th>Personas</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong>{plan.name}</strong>
                      <p>{plan.description}</p>
                    </td>
                    <td>{getPlanLabel(plan)}</td>
                    <td>{plan.durationDays} días</td>
                    <td>
                      <strong>{formatCurrency(plan.price)}</strong>
                      {plan.type === "group" ? (
                        <p>{formatCurrency(plan.pricePerPerson)} c/u</p>
                      ) : null}
                    </td>
                    <td>
                      {plan.minPeople === plan.maxPeople
                        ? plan.maxPeople
                        : `${plan.minPeople}-${plan.maxPeople}`}
                    </td>
                    <td>
                      <span
                        className={
                          plan.isActive
                            ? styles.statusActive
                            : styles.statusInactive
                        }
                      >
                        {plan.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyStateCard}>
            No hay planes que coincidan con la búsqueda.
          </div>
        )}
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.detailEyebrow}>Registro</span>
            <h2 className={styles.detailTitle}>Registrar una suscripción</h2>
            <p className={styles.sectionText}>
              Usa el formulario individual para una sola persona o el grupal
              cuando el pago cubre a varios clientes.
            </p>
          </div>
        </div>

        <div className={styles.registrationGrid}>
          <article className={`${styles.detailCard} ${styles.formCard}`}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailEyebrow}>Pago manual</span>
                <h2 className={styles.detailTitle}>Membresía individual</h2>
                <p className={styles.sectionText}>
                  Para visitas, semana, quincena, mensualidad, semestre o
                  anualidad de un solo cliente.
                </p>
              </div>
            </div>

            <div className={styles.formNotice}>
              <FaCreditCard />
              <span>
                Selecciona el cliente y el plan. Al registrar el pago, la
                membresía queda activa con la fecha elegida.
              </span>
            </div>

            <div className={styles.formStack}>
              <div className={styles.formSection}>
                <h3>Cliente y plan</h3>
                <div className={styles.formGrid}>
                  <label>
                    Cliente
                    <select
                      value={selectedUserId}
                      onChange={(event) => setSelectedUserId(event.target.value)}
                    >
                      <option value="">Selecciona cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Plan
                    <select
                      value={selectedIndividualPlanId}
                      onChange={(event) =>
                        setSelectedIndividualPlanId(event.target.value)
                      }
                    >
                      <option value="">Selecciona plan</option>
                      {individualPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatCurrency(plan.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>Datos del pago</h3>
                <div className={styles.formGrid}>
                  <label>
                    Método
                    <select
                      value={individualMethod}
                      onChange={(event) =>
                        setIndividualMethod(event.target.value as PaymentMethod)
                      }
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                      <option value="card_terminal">
                        Tarjeta presencial / Mercado Pago
                      </option>
                    </select>
                  </label>

                  <label>
                    Fecha de inicio
                    <input
                      type="date"
                      value={individualStartsAt}
                      onChange={(event) =>
                        setIndividualStartsAt(event.target.value)
                      }
                    />
                  </label>

                  <label className={styles.fieldFull}>
                    Referencia
                    <input
                      value={individualReference}
                      onChange={(event) =>
                        setIndividualReference(event.target.value)
                      }
                      placeholder="Folio, nota o referencia del pago"
                    />
                  </label>

                  <label className={styles.fieldFull}>
                    Notas
                    <textarea
                      value={individualNotes}
                      onChange={(event) => setIndividualNotes(event.target.value)}
                      placeholder="Observaciones del pago"
                    />
                  </label>
                </div>
              </div>

              <div className={styles.planSummary}>
                <span>Plan seleccionado</span>
                <strong>
                  {selectedIndividualPlan
                    ? `${selectedIndividualPlan.name} - ${formatCurrency(
                        selectedIndividualPlan.price
                      )}`
                    : "Selecciona un plan individual"}
                </strong>
                <p>Este registro activa la membresía del cliente seleccionado.</p>
              </div>

              <button
                type="button"
                className={`${styles.inlinePrimaryBtn} ${styles.fullAction}`}
                onClick={() => void handleCreateIndividualPayment()}
                disabled={savingIndividual}
              >
                <FaCreditCard />
                {savingIndividual ? "Registrando..." : "Registrar pago"}
              </button>
            </div>
          </article>

          <article className={`${styles.detailCard} ${styles.formCard}`}>
            <div className={styles.detailHeader}>
              <div>
                <span className={styles.detailEyebrow}>Pago grupal</span>
                <h2 className={styles.detailTitle}>Paquete por correos</h2>
                <p className={styles.sectionText}>
                  Para paquetes de 2, 3 o 4 personas con un titular y sus
                  integrantes invitados.
                </p>
              </div>
            </div>

            <div className={styles.formNotice}>
              <FaUsers />
              <span>
                El titular queda como responsable del pago. Agrega solo los
                correos de las personas adicionales.
              </span>
            </div>

            <div className={styles.formStack}>
              <div className={styles.formSection}>
                <h3>Titular y paquete</h3>
                <div className={styles.formGrid}>
                  <label>
                    Titular
                    <select
                      value={ownerUserId}
                      onChange={(event) => setOwnerUserId(event.target.value)}
                    >
                      <option value="">Selecciona titular</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.email}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Paquete
                    <select
                      value={selectedGroupPlanId}
                      onChange={(event) =>
                        setSelectedGroupPlanId(event.target.value)
                      }
                    >
                      <option value="">Selecciona paquete</option>
                      {groupPlans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} - {formatCurrency(plan.price)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <h3>Integrantes y pago</h3>
                <div className={styles.formGrid}>
                  <label>
                    Método
                    <select
                      value={groupMethod}
                      onChange={(event) =>
                        setGroupMethod(event.target.value as PaymentMethod)
                      }
                    >
                      <option value="cash">Efectivo</option>
                      <option value="transfer">Transferencia</option>
                      <option value="card_terminal">
                        Tarjeta presencial / Mercado Pago
                      </option>
                    </select>
                  </label>

                  <label>
                    Fecha de inicio
                    <input
                      type="date"
                      value={groupStartsAt}
                      onChange={(event) => setGroupStartsAt(event.target.value)}
                    />
                  </label>

                  <label className={styles.fieldFull}>
                    Correos de integrantes
                    <textarea
                      value={memberEmailsText}
                      onChange={(event) => setMemberEmailsText(event.target.value)}
                      placeholder="correo2@gmail.com&#10;correo3@gmail.com&#10;correo4@gmail.com"
                    />
                  </label>

                  <label className={styles.fieldFull}>
                    Referencia
                    <input
                      value={groupReference}
                      onChange={(event) => setGroupReference(event.target.value)}
                      placeholder="Pago paquete con terminal Mercado Pago"
                    />
                  </label>

                  <label className={styles.fieldFull}>
                    Notas
                    <textarea
                      value={groupNotes}
                      onChange={(event) => setGroupNotes(event.target.value)}
                      placeholder="Observaciones del paquete"
                    />
                  </label>
                </div>
              </div>

              <div className={styles.planSummary}>
                <span>Límite del paquete</span>
                <strong>
                  {selectedGroupPlan
                    ? `${selectedGroupPlan.maxPeople} personas en total`
                    : "Selecciona un paquete grupal"}
                </strong>
                <p>
                  {selectedGroupPlan
                    ? `Puedes agregar hasta ${expectedGroupGuests} correos además del titular.`
                    : "Al registrar, el paquete quedará pendiente de aceptación."}
                </p>
              </div>

              <button
                type="button"
                className={`${styles.inlinePrimaryBtn} ${styles.fullAction}`}
                onClick={() => void handleCreateGroupPayment()}
                disabled={savingGroup}
              >
                <FaUsers />
                {savingGroup ? "Registrando..." : "Registrar paquete"}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section className={`${styles.panelCard} ${styles.pendingPanel}`}>
        <div className={styles.sectionHeader}>
          <div>
            <span className={styles.detailEyebrow}>Validación</span>
            <h2 className={styles.detailTitle}>Paquetes pendientes</h2>
            <p className={styles.sectionText}>
              Revisa el estado de cada integrante. El botón se habilita cuando
              todos aceptaron y tienen cuenta registrada.
            </p>
          </div>
        </div>

        <div className={styles.sectionHelp}>
          <FaCheckCircle />
          <span>
            Antes de aprobar, confirma que el pago esté correcto y que el
            contador de integrantes coincida con el límite del paquete.
          </span>
        </div>

        {pendingGroups.length > 0 ? (
          <div className={styles.cardStack}>
            {pendingGroups.map((group) => {
              const members = group.members ?? [];
              const acceptedCount = members.filter((member) =>
                isReadyStatus(member.status)
              ).length;
              const isReadyToApprove = acceptedCount === Number(group.memberLimit);

              return (
                <article key={group.id} className={styles.pendingCard}>
                  <div className={styles.pendingHeader}>
                    <div>
                      <span className={styles.detailEyebrow}>
                        {getReadableStatus(group.status)}
                      </span>
                      <h3 className={styles.detailTitle}>
                        {group.plan?.name ?? "Paquete grupal"}
                      </h3>
                      <p className={styles.sectionText}>
                        Titular: {group.owner?.email ?? "Sin titular"}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={styles.inlinePrimaryBtn}
                      onClick={() => void handleApproveGroup(group.id)}
                      disabled={approvingGroupId === group.id || !isReadyToApprove}
                    >
                      <FaCheckCircle />
                      {approvingGroupId === group.id
                        ? "Aprobando..."
                        : "Aprobar paquete"}
                    </button>
                  </div>

                  <div className={styles.groupMetrics}>
                    <div className={styles.miniStatCard}>
                      <span>Pago registrado</span>
                      <strong>{formatCurrency(group.totalAmount)}</strong>
                    </div>
                    <div className={styles.miniStatCard}>
                      <span>Integrantes listos</span>
                      <strong>
                        {acceptedCount}/{group.memberLimit}
                      </strong>
                    </div>
                    <div className={styles.miniStatCard}>
                      <span>Vigencia</span>
                      <strong>
                        {formatDate(group.startsAt)} - {formatDate(group.endsAt)}
                      </strong>
                    </div>
                  </div>

                  <div
                    className={
                      isReadyToApprove ? styles.readyNote : styles.warningNote
                    }
                  >
                    {isReadyToApprove
                      ? "El paquete está listo para aprobarse."
                      : "Aún faltan integrantes por aceptar o completar su registro."}
                  </div>

                  <div className={styles.memberList}>
                    {members.map((member) => {
                      const isReady = isReadyStatus(member.status);

                      return (
                        <div key={member.id} className={styles.memberItem}>
                          <span>
                            <FaEnvelope /> {member.invitedEmail}
                          </span>
                          <strong
                            className={
                              isReady ? styles.statusReady : styles.statusWaiting
                            }
                          >
                            {getReadableStatus(member.status)}
                          </strong>
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={styles.emptyStateCard}>
            No hay paquetes pendientes por ahora.
          </div>
        )}
      </section>
    </section>
  );
}
