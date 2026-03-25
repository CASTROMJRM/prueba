import { useEffect, useMemo, useState } from "react";
import {
  CalendarClock,
  Dumbbell,
  LineChart as LineChartIcon,
  Minus,
  Scale,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Weight,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import styles from "./ProfilePredictionPanel.module.css";
import {
  buildDisplayProgressRecords,
  buildPredictionSummary,
  createEmptyProfilePredictionState,
  loadProfilePredictionState,
  saveProfilePredictionState,
  type FitnessGoalOption,
  type LifestyleData,
  type PersonalData,
  type ProfilePredictionState,
  type ProgressRecord,
} from "../../../../services/client/profilePredictionService";

interface ProfilePredictionPanelProps {
  storageScope: string;
  displayName?: string;
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatWeight(value: number | null) {
  return value === null ? "--" : `${value.toFixed(1)} kg`;
}

function formatBmi(value: number | null, label: string) {
  return value === null ? "--" : `${value.toFixed(1)} - ${label}`;
}

function formatRate(value: number | null) {
  if (value === null) return "--";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)} kg/sem`;
}

function formatDistance(value: number | null) {
  if (value === null) return "--";
  return `${value.toFixed(1)} kg`;
}

function formatGoalDate(value: string | null) {
  if (!value) return "--";

  return new Date(value).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getStatusClassName(
  statusTone: "success" | "warning" | "danger" | "neutral"
) {
  if (statusTone === "success") return styles.statusSuccess;
  if (statusTone === "warning") return styles.statusWarning;
  if (statusTone === "danger") return styles.statusDanger;
  return styles.statusNeutral;
}

function getChangeClassName(change: number | null) {
  if (change === null || change === 0) return styles.changeNeutral;
  if (change < 0) return styles.changeNegative;
  return styles.changePositive;
}

function getChangeLabel(change: number | null) {
  if (change === null) return "-";
  if (change === 0) return "0.0 kg";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)} kg`;
}

function formatRecordDate(recordDate: string) {
  return new Date(recordDate).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfilePredictionPanel({
  storageScope,
  displayName,
}: ProfilePredictionPanelProps) {
  const [profileState, setProfileState] = useState<ProfilePredictionState>(
    createEmptyProfilePredictionState()
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [recordWeight, setRecordWeight] = useState("");
  const [recordDate, setRecordDate] = useState(getTodayInputValue());

  useEffect(() => {
    const storedState = loadProfilePredictionState(storageScope);
    setProfileState(storedState);
    setRecordDate(getTodayInputValue());
    setIsHydrated(true);
  }, [storageScope]);

  useEffect(() => {
    if (!isHydrated) return;
    saveProfilePredictionState(storageScope, profileState);
  }, [isHydrated, profileState, storageScope]);

  const summary = useMemo(
    () => buildPredictionSummary(profileState),
    [profileState]
  );
  const displayRecords = useMemo(
    () => buildDisplayProgressRecords(profileState.progressRecords),
    [profileState.progressRecords]
  );

  const updatePersonalData = <K extends keyof PersonalData>(
    field: K,
    value: PersonalData[K]
  ) => {
    setProfileState((previousState) => ({
      ...previousState,
      personalData: {
        ...previousState.personalData,
        [field]: value,
      },
    }));
  };

  const updateLifestyleData = <K extends keyof LifestyleData>(
    field: K,
    value: LifestyleData[K]
  ) => {
    setProfileState((previousState) => ({
      ...previousState,
      lifestyleData: {
        ...previousState.lifestyleData,
        [field]: value,
      },
    }));
  };

  const addProgressRecord = () => {
    const weight = Number(recordWeight);

    if (!Number.isFinite(weight) || weight <= 0 || !recordDate) {
      return;
    }

    setProfileState((previousState) => {
      const nextRecord: ProgressRecord = {
        id: crypto.randomUUID(),
        date: recordDate,
        weight,
      };

      const recordsWithoutSameDate = previousState.progressRecords.filter(
        (record) => record.date !== recordDate
      );

      return {
        ...previousState,
        progressRecords: [...recordsWithoutSameDate, nextRecord].sort(
          (left, right) =>
            new Date(right.date).getTime() - new Date(left.date).getTime()
        ),
      };
    });

    setRecordWeight("");
    setRecordDate(getTodayInputValue());
  };

  const removeProgressRecord = (recordId: string) => {
    setProfileState((previousState) => ({
      ...previousState,
      progressRecords: previousState.progressRecords.filter(
        (record) => record.id !== recordId
      ),
    }));
  };

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          {displayName ? `${displayName} - Mi Perfil` : "Mi Perfil"}
        </h1>
        <p className={styles.pageSubtitle}>
          Desde aqui podras actualizar tus datos personales, registrar tu
          progreso y seguir una prediccion de avance.
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBar} />
          <h2>Datos del Usuario</h2>
        </div>

        <div className={styles.sectionRail}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelIcon}>
                  <UserRound size={18} />
                </span>
                <div>
                  <h3>Datos Personales y Fisicos</h3>
                  <p>
                    Ingresa tu informacion basica para personalizar tu experiencia.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span className={styles.label}>Edad</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={14}
                    max={100}
                    value={profileState.personalData.age}
                    onChange={(event) =>
                      updatePersonalData("age", event.target.value)
                    }
                    placeholder="25"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Genero</span>
                  <select
                    className={styles.select}
                    value={profileState.personalData.gender}
                    onChange={(event) =>
                      updatePersonalData(
                        "gender",
                        event.target.value as PersonalData["gender"]
                      )
                    }
                  >
                    <option value="">Seleccionar</option>
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                    <option value="other">Otro</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Altura (metros)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    max={2.5}
                    step="0.01"
                    value={profileState.personalData.height}
                    onChange={(event) =>
                      updatePersonalData("height", event.target.value)
                    }
                    placeholder="1.75"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Peso Inicial (kg)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={30}
                    max={300}
                    step="0.1"
                    value={profileState.personalData.initialWeight}
                    onChange={(event) =>
                      updatePersonalData("initialWeight", event.target.value)
                    }
                    placeholder="80"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Peso Objetivo (kg)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={30}
                    max={300}
                    step="0.1"
                    value={profileState.personalData.targetWeight}
                    onChange={(event) =>
                      updatePersonalData("targetWeight", event.target.value)
                    }
                    placeholder="70"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Fecha de Inicio</span>
                  <input
                    className={styles.input}
                    type="date"
                    value={profileState.personalData.startDate}
                    onChange={(event) =>
                      updatePersonalData("startDate", event.target.value)
                    }
                  />
                </label>
              </div>
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelIcon}>
                  <Dumbbell size={18} />
                </span>
                <div>
                  <h3>Estilo de Vida y Entrenamiento</h3>
                  <p>
                    Informacion sobre tus habitos de ejercicio y nutricion.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGridTriple}>
                <label className={styles.field}>
                  <span className={styles.label}>Asistencia Semanal al Gimnasio</span>
                  <select
                    className={styles.select}
                    value={profileState.lifestyleData.weeklyAttendance}
                    onChange={(event) =>
                      updateLifestyleData("weeklyAttendance", event.target.value)
                    }
                  >
                    <option value="">Dias por semana</option>
                    {Array.from({ length: 7 }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={String(day)}>
                        {day} {day === 1 ? "dia" : "dias"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Ingesta Calorica Diaria</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={1000}
                    max={5000}
                    step="10"
                    value={profileState.lifestyleData.dailyCalories}
                    onChange={(event) =>
                      updateLifestyleData("dailyCalories", event.target.value)
                    }
                    placeholder="2000"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Objetivo Fitness</span>
                  <select
                    className={styles.select}
                    value={profileState.lifestyleData.fitnessGoal}
                    onChange={(event) =>
                      updateLifestyleData(
                        "fitnessGoal",
                        event.target.value as FitnessGoalOption
                      )
                    }
                  >
                    <option value="">Seleccionar objetivo</option>
                    <option value="lose">Perder peso</option>
                    <option value="maintain">Mantener peso</option>
                    <option value="gain">Ganar masa muscular</option>
                  </select>
                </label>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBar} />
          <h2>Seguimiento y Predicciones</h2>
        </div>

        <div className={styles.sectionRail}>
          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelIcon}>
                  <Weight size={18} />
                </span>
                <div>
                  <h3>Seguimiento de Progreso</h3>
                  <p>
                    Registra tu peso regularmente para construir tu historial.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGridTracker}>
                <label className={styles.field}>
                  <span className={styles.label}>Peso Actual (kg)</span>
                  <input
                    className={styles.input}
                    type="number"
                    min={30}
                    max={300}
                    step="0.1"
                    value={recordWeight}
                    onChange={(event) => setRecordWeight(event.target.value)}
                    placeholder="75.5"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Fecha</span>
                  <input
                    className={styles.input}
                    type="date"
                    value={recordDate}
                    onChange={(event) => setRecordDate(event.target.value)}
                  />
                </label>

                <div className={styles.recordActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={addProgressRecord}
                    disabled={!recordWeight || !recordDate}
                  >
                    <CalendarClock size={16} />
                    Agregar Registro
                  </button>
                </div>
              </div>

              {displayRecords.length > 0 ? (
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Peso (kg)</th>
                        <th>Cambio</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {displayRecords.map((record) => (
                        <tr key={record.id}>
                          <td>{formatRecordDate(record.date)}</td>
                          <td>{record.weight.toFixed(1)}</td>
                          <td>
                            <span
                              className={`${styles.changeCell} ${getChangeClassName(record.change)}`}
                            >
                              {record.change === null ? (
                                <Minus size={14} />
                              ) : (
                                <LineChartIcon size={14} />
                              )}
                              {getChangeLabel(record.change)}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.iconButton}
                              onClick={() => removeProgressRecord(record.id)}
                              aria-label={`Eliminar registro del ${record.date}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Weight size={28} />
                  <strong>No hay registros aun</strong>
                  <span>
                    Agrega tu primer registro de peso para comenzar el
                    seguimiento.
                  </span>
                </div>
              )}
            </div>
          </article>

          <article className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitleRow}>
                <span className={styles.panelIcon}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3>Panel de Prediccion</h3>
                  <p>
                    Visualiza tu progreso y obten estimaciones basadas en tus
                    datos.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.statusRow}>
                <span
                  className={`${styles.statusBadge} ${getStatusClassName(
                    summary.statusTone
                  )}`}
                >
                  <Sparkles size={14} />
                  {summary.statusLabel}
                </span>
                <span className={styles.statusMeta}>{summary.goalLabel}</span>
              </div>

              <div className={styles.statsGrid}>
                <article className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Target size={16} />
                  </div>
                  <div className={styles.statTitle}>Distancia al objetivo</div>
                  <div className={styles.statValue}>
                    {formatDistance(summary.distanceToGoal)}
                  </div>
                  <div className={styles.statHint}>
                    Diferencia entre el peso actual y tu meta.
                  </div>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <LineChartIcon size={16} />
                  </div>
                  <div className={styles.statTitle}>Ritmo proyectado</div>
                  <div className={styles.statValue}>
                    {formatRate(summary.projectedRate)}
                  </div>
                  <div className={styles.statHint}>
                    Estimado semanal usando registros y habitos.
                  </div>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <Scale size={16} />
                  </div>
                  <div className={styles.statTitle}>IMC estimado</div>
                  <div className={styles.statValue}>
                    {formatBmi(summary.bmi, summary.bmiLabel)}
                  </div>
                  <div className={styles.statHint}>
                    Fecha sugerida: {formatGoalDate(summary.estimatedGoalDate)}
                  </div>
                </article>
              </div>

              {summary.chartPoints.length > 0 ? (
                <div className={styles.chartPanel}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={summary.chartPoints}
                      margin={{ top: 18, right: 12, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#ece7ea" />
                      <XAxis
                        dataKey="label"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 12, fill: "#7d7380" }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        width={42}
                        tick={{ fontSize: 12, fill: "#7d7380" }}
                      />
                      <Tooltip
                        formatter={(value: number | string) => {
                          const numericValue = Number(value);
                          return [`${numericValue.toFixed(1)} kg`, "Peso"];
                        }}
                        labelFormatter={(label) => `Fecha: ${label}`}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid #ece7ea",
                          boxShadow: "0 18px 34px rgba(31, 23, 32, 0.08)",
                        }}
                      />
                      {summary.targetWeight !== null && (
                        <ReferenceLine
                          y={summary.targetWeight}
                          stroke="#ff1f2d"
                          strokeDasharray="6 6"
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="#ff1f2d"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#ff1f2d", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#ff1f2d" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <LineChartIcon size={28} />
                  <strong>Sin datos para visualizar</strong>
                  <span>
                    Agrega registros de peso para ver la grafica y generar una
                    tendencia.
                  </span>
                </div>
              )}

              <div className={styles.predictionFooter}>
                <strong style={{ display: "block", marginBottom: 6 }}>
                  Recomendacion actual
                </strong>
                <div>{summary.recommendation}</div>
                <div className={styles.predictionMeta}>
                  Ritmo observado: {formatRate(summary.observedRate)} | Peso
                  actual: {formatWeight(summary.currentWeight)} | Meta estimada:{" "}
                  {summary.weeksToGoal === null
                    ? "--"
                    : `${summary.weeksToGoal} semanas`}
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </section>
  );
}
