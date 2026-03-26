/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CalendarClock,
  Dumbbell,
  Flame,
  LineChart as LineChartIcon,
  Minus,
  Pencil,
  Scale,
  Sparkles,
  Target,
  Trash2,
  UserRound,
  Weight,
  X,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
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
  type FitnessGoalOption,
  type LifestyleData,
  type PersonalData,
  type PredictionChartPoint,
  type ProfilePredictionState,
} from "../../../../services/client/profilePredictionService";

import {
  createDailyCalories,
  createWeeklyWeight,
  deleteLatestWeight,
  getMyProfileDashboard,
  updateWeightRecord,
  updateMyProfile,
  type ActivityLevelOption,
  type CalorieRecordDTO,
  type UserProfileDTO,
  type WeightRecordDTO,
} from "../../../../services/client/profileService";

interface ProfilePredictionPanelProps {
  displayName?: string;
  storageScope?: string;
}

type ProfileView = "client" | "prediction";

type DisplayCalorieRecord = CalorieRecordDTO & {
  change: number | null;
};

type WeightBarPoint = {
  label: string;
  fullLabel: string;
  weight: number;
  kind: "real" | "projected";
};

type ForecastChartPoint = {
  week: number;
  label: string;
  fullLabel: string;
  estimatedWeight: number;
  distanceToGoal: number;
};

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

function normalizeCalendarDate(value: string) {
  const normalizedValue = value.trim();
  const matchedDate = normalizedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (matchedDate) {
    return `${matchedDate[1]}-${matchedDate[2]}-${matchedDate[3]}`;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return normalizedValue;
  }

  return parsedDate.toISOString().slice(0, 10);
}

function toCalendarDate(value: string) {
  const normalizedDate = normalizeCalendarDate(value);
  const matchedDate = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (matchedDate) {
    return new Date(
      Number(matchedDate[1]),
      Number(matchedDate[2]) - 1,
      Number(matchedDate[3])
    );
  }

  return new Date(normalizedDate);
}

function formatGoalDate(value: string | null) {
  if (!value) return "--";

  return toCalendarDate(value).toLocaleDateString("es-MX", {
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
  return toCalendarDate(recordDate).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCompactDate(recordDate: string) {
  return toCalendarDate(recordDate).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function getBarChartDomain(points: WeightBarPoint[]): [number, number] {
  if (points.length === 0) {
    return [0, 100];
  }

  const weights = points.map((point) => point.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const spread = maxWeight - minWeight;
  const padding = spread < 1 ? 0.8 : Math.max(0.6, spread * 0.3);

  let lowerBound = Number((minWeight - padding).toFixed(1));
  let upperBound = Number((maxWeight + padding).toFixed(1));

  if (lowerBound < 0) {
    lowerBound = 0;
  }

  if (upperBound - lowerBound < 2) {
    upperBound = Number((lowerBound + 2).toFixed(1));
  }

  return [lowerBound, upperBound];
}

function getNumericChartDomain(values: number[], minimumRange = 2): [number, number] {
  if (values.length === 0) {
    return [0, 100];
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const spread = maxValue - minValue;
  const padding = spread < 1 ? 0.6 : Math.max(0.4, spread * 0.2);

  let lowerBound = Number((minValue - padding).toFixed(1));
  let upperBound = Number((maxValue + padding).toFixed(1));

  if (lowerBound < 0) {
    lowerBound = 0;
  }

  if (upperBound - lowerBound < minimumRange) {
    upperBound = Number((lowerBound + minimumRange).toFixed(1));
  }

  return [lowerBound, upperBound];
}

function getPredictionChartDomain(
  points: PredictionChartPoint[],
  targetWeight: number | null,
  showActualSeries: boolean,
  showProjectedSeries: boolean
): [number, number] {
  const values: number[] = [];

  if (showActualSeries) {
    values.push(
      ...points
        .map((point) => point.actualWeight)
        .filter((value): value is number => value !== null)
    );
  }

  if (showProjectedSeries) {
    values.push(
      ...points
        .map((point) => point.projectedWeight)
        .filter((value): value is number => value !== null)
    );
  }

  if (targetWeight !== null) {
    values.push(targetWeight);
  }

  if (values.length === 0) {
    return [0, 100];
  }

  const minWeight = Math.min(...values);
  const maxWeight = Math.max(...values);
  const spread = maxWeight - minWeight;
  const padding = spread < 1 ? 0.8 : Math.max(0.6, spread * 0.25);

  let lowerBound = Number((minWeight - padding).toFixed(1));
  let upperBound = Number((maxWeight + padding).toFixed(1));

  if (lowerBound < 0) {
    lowerBound = 0;
  }

  if (upperBound - lowerBound < 2) {
    upperBound = Number((lowerBound + 2).toFixed(1));
  }

  return [lowerBound, upperBound];
}

function formatWeeksToGoal(value: number | null) {
  if (value === null) return "--";
  const roundedValue = value.toFixed(1);
  const numericValue = Number(roundedValue);
  return `${roundedValue} ${numericValue === 1 ? "semana" : "semanas"}`;
}

function formatWeekValue(value: number | null) {
  if (value === null) return "--";
  return value.toFixed(1);
}

function renderPredictionTooltip({
  active,
  label,
  payload,
}: {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<any>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const uniqueEntries = payload.filter(
    (entry, index, entries) =>
      entries.findIndex((candidate) => candidate?.dataKey === entry?.dataKey) === index
  );

  const rows = uniqueEntries
    .map((entry) => {
      const numericValue = Number(entry?.value);

      if (!Number.isFinite(numericValue)) {
        return null;
      }

      const labelText =
        entry?.dataKey === "actualWeight" ? "Peso real" : "Peso proyectado";
      const color =
        entry?.dataKey === "actualWeight" ? "#ff3342" : "#171717";

      return {
        labelText,
        color,
        value: `${numericValue.toFixed(1)} kg`,
      };
    })
    .filter(Boolean) as Array<{
    labelText: string;
    color: string;
    value: string;
  }>;

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={styles.chartTooltip}>
      <strong className={styles.chartTooltipTitle}>Fecha: {label}</strong>
      <div className={styles.chartTooltipList}>
        {rows.map((row) => (
          <div key={row.labelText} className={styles.chartTooltipRow}>
            <span
              className={styles.chartTooltipDot}
              style={{ background: row.color }}
            />
            <span className={styles.chartTooltipLabel}>{row.labelText}</span>
            <strong className={styles.chartTooltipValue}>{row.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderForecastTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: ReadonlyArray<any>;
}) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload as ForecastChartPoint | undefined;

  if (!point) {
    return null;
  }

  return (
    <div className={styles.forecastTooltip}>
      <strong className={styles.forecastTooltipTitle}>
        Semana {point.week} · {point.fullLabel}
      </strong>
      <div className={styles.forecastTooltipList}>
        <div className={styles.forecastTooltipRow}>
          <span
            className={styles.forecastTooltipSwatch}
            style={{ background: "#171717" }}
          />
          <span className={styles.forecastTooltipLabel}>Peso posible</span>
          <strong className={styles.forecastTooltipValue}>
            {point.estimatedWeight.toFixed(1)} kg
          </strong>
        </div>
        <div className={styles.forecastTooltipRow}>
          <span
            className={styles.forecastTooltipSwatch}
            style={{ background: "#ff6671" }}
          />
          <span className={styles.forecastTooltipLabel}>Falta para meta</span>
          <strong className={styles.forecastTooltipValue}>
            {point.distanceToGoal.toFixed(1)} kg
          </strong>
        </div>
      </div>
    </div>
  );
}

function formatCalories(value: number | null) {
  if (value === null) return "--";

  return `${new Intl.NumberFormat("es-MX").format(Math.round(value))} kcal`;
}

function getCalorieChangeLabel(change: number | null) {
  if (change === null) return "-";
  if (change === 0) return "0 kcal";
  const sign = change > 0 ? "+" : "";

  return `${sign}${Math.round(change)} kcal`;
}

function buildDisplayCalorieRecords(
  records: CalorieRecordDTO[]
): DisplayCalorieRecord[] {
  const sortedRecords = [...records].sort(
    (left, right) =>
      new Date(right.recordDate).getTime() - new Date(left.recordDate).getTime()
  );

  return sortedRecords.map((record, index) => {
    const previousRecord = sortedRecords[index + 1];

    return {
      ...record,
      change: previousRecord
        ? record.dailyCalories - previousRecord.dailyCalories
        : null,
    };
  });
}

function toPersonalData(profile: UserProfileDTO | null): PersonalData {
  return {
    age: profile?.age ? String(profile.age) : "",
    gender: (profile?.gender || "") as PersonalData["gender"],
    height: profile?.height ? String(profile.height) : "",
    initialWeight: profile?.initialWeight ? String(profile.initialWeight) : "",
    targetWeight: profile?.targetWeight ? String(profile.targetWeight) : "",
    startDate: profile?.startDate ? normalizeCalendarDate(profile.startDate) : "",
  };
}

function toLifestyleData(
  profile: UserProfileDTO | null,
  latestCalories: CalorieRecordDTO | null
): LifestyleData {
  return {
    weeklyAttendance: profile?.weeklyGymDays ? String(profile.weeklyGymDays) : "",
    dailyCalories: latestCalories?.dailyCalories
      ? String(latestCalories.dailyCalories)
      : "",
    fitnessGoal: (profile?.fitnessGoal || "") as FitnessGoalOption,
  };
}

function buildProfileStateFromApi(
  profile: UserProfileDTO | null,
  latestCalories: CalorieRecordDTO | null,
  weightHistory: WeightRecordDTO[]
): ProfilePredictionState {
  return {
    personalData: toPersonalData(profile),
    lifestyleData: toLifestyleData(profile, latestCalories),
    progressRecords: weightHistory.map((record) => ({
      id: record.id,
      date: normalizeCalendarDate(record.recordDate),
      weight: Number(record.weight),
    })),
  };
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.error === "string"
  ) {
    return (error as any).response.data.error;
  }

  return "Ocurrió un error inesperado.";
}

export default function ProfilePredictionPanel({
  displayName,
  storageScope: _storageScope,
}: ProfilePredictionPanelProps) {
  void _storageScope;

  const [profileState, setProfileState] = useState<ProfilePredictionState>({
    personalData: {
      age: "",
      gender: "",
      height: "",
      initialWeight: "",
      targetWeight: "",
      startDate: "",
    },
    lifestyleData: {
      weeklyAttendance: "",
      dailyCalories: "",
      fitnessGoal: "",
    },
    progressRecords: [],
  });

  const [recordWeight, setRecordWeight] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingWeight, setIsSavingWeight] = useState(false);
  const [isSavingCalories, setIsSavingCalories] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [calorieHistory, setCalorieHistory] = useState<CalorieRecordDTO[]>([]);
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [editingWeightValue, setEditingWeightValue] = useState("");
  const [savingWeightId, setSavingWeightId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ProfileView>("client");
  const [showActualSeries, setShowActualSeries] = useState(true);
  const [showProjectedSeries, setShowProjectedSeries] = useState(true);

  const displayRecords = useMemo(
    () => buildDisplayProgressRecords(profileState.progressRecords),
    [profileState.progressRecords]
  );

  const displayCalorieRecords = useMemo(
    () => buildDisplayCalorieRecords(calorieHistory),
    [calorieHistory]
  );

  const calorieSummary = useMemo(() => {
    if (calorieHistory.length === 0) {
      return {
        totalRecords: 0,
        latestCalories: null,
        averageCalories: null,
        trackedDays: 0,
      };
    }

    const uniqueDailyRecords: CalorieRecordDTO[] = [];
    const seenDates = new Set<string>();

    for (const record of calorieHistory) {
      const normalizedDate = normalizeCalendarDate(record.recordDate);

      if (seenDates.has(normalizedDate)) {
        continue;
      }

      seenDates.add(normalizedDate);
      uniqueDailyRecords.push({
        ...record,
        recordDate: normalizedDate,
      });
    }

    const weeklyRecords = uniqueDailyRecords.slice(0, 7);
    const totalCalories = weeklyRecords.reduce(
      (accumulator, record) => accumulator + Number(record.dailyCalories || 0),
      0
    );

    return {
      totalRecords: calorieHistory.length,
      latestCalories: calorieHistory[0]?.dailyCalories ?? null,
      averageCalories:
        weeklyRecords.length > 0 ? totalCalories / weeklyRecords.length : null,
      trackedDays: weeklyRecords.length,
    };
  }, [calorieHistory]);

  const summary = useMemo(
    () => buildPredictionSummary(profileState),
    [profileState]
  );

  const latestSixWeightRecords = useMemo(
    () => [...displayRecords].slice(0, 6).reverse(),
    [displayRecords]
  );

  const registeredWeightBarData = useMemo<WeightBarPoint[]>(
    () =>
      latestSixWeightRecords.map((record) => ({
        label: formatCompactDate(record.date),
        fullLabel: formatRecordDate(record.date),
        weight: record.weight,
        kind: "real",
      })),
    [latestSixWeightRecords]
  );

  const projectedWeightBarData = useMemo<WeightBarPoint[]>(
    () => {
      if (summary.weeklyForecast.length < 2) {
        return [];
      }

      return [
        ...latestSixWeightRecords.map((record) => ({
          label: formatCompactDate(record.date),
          fullLabel: formatRecordDate(record.date),
          weight: record.weight,
          kind: "real" as const,
        })),
        ...summary.weeklyForecast.slice(0, 2).map((forecast) => ({
          label: formatCompactDate(forecast.projectedDate),
          fullLabel: `${formatRecordDate(forecast.projectedDate)} · Semana ${forecast.week}`,
          weight: forecast.estimatedWeight,
          kind: "projected" as const,
        })),
      ];
    },
    [latestSixWeightRecords, summary.weeklyForecast]
  );

  const registeredWeightBarDomain = useMemo(
    () => getBarChartDomain(registeredWeightBarData),
    [registeredWeightBarData]
  );

  const projectedWeightBarDomain = useMemo(
    () => getBarChartDomain(projectedWeightBarData),
    [projectedWeightBarData]
  );

  const forecastChartData = useMemo<ForecastChartPoint[]>(
    () =>
      summary.weeklyForecast.map((forecast) => ({
        week: forecast.week,
        label: `S${forecast.week}`,
        fullLabel: formatRecordDate(forecast.projectedDate),
        estimatedWeight: forecast.estimatedWeight,
        distanceToGoal: forecast.distanceToGoal ?? 0,
      })),
    [summary.weeklyForecast]
  );

  const forecastWeightDomain = useMemo(
    () =>
      getNumericChartDomain(
        forecastChartData.map((point) => point.estimatedWeight),
        1.8
      ),
    [forecastChartData]
  );

  const forecastDistanceDomain = useMemo(
    () =>
      getNumericChartDomain(
        forecastChartData.map((point) => point.distanceToGoal),
        1.2
      ),
    [forecastChartData]
  );

  const predictionChartDomain = useMemo(
    () =>
      getPredictionChartDomain(
        summary.chartPoints,
        summary.targetWeight,
        showActualSeries,
        showProjectedSeries
      ),
    [summary.chartPoints, summary.targetWeight, showActualSeries, showProjectedSeries]
  );

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const data = await getMyProfileDashboard();

      const nextState = buildProfileStateFromApi(
        data.profile,
        data.latestCalories,
        data.weightHistory
      );

      setProfileState(nextState);
      setCalorieHistory(data.calorieHistory);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

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

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      setMessage(null);
      setErrorMessage(null);

      await updateMyProfile({
        age: profileState.personalData.age
          ? Number(profileState.personalData.age)
          : null,
        gender: (profileState.personalData.gender || "") as
          | ""
          | "male"
          | "female"
          | "other",
        height: profileState.personalData.height
          ? Number(profileState.personalData.height)
          : null,
        initialWeight: profileState.personalData.initialWeight
          ? Number(profileState.personalData.initialWeight)
          : null,
        targetWeight: profileState.personalData.targetWeight
          ? Number(profileState.personalData.targetWeight)
          : null,
        startDate: profileState.personalData.startDate || null,
        weeklyGymDays: profileState.lifestyleData.weeklyAttendance
          ? Number(profileState.lifestyleData.weeklyAttendance)
          : null,
        activityLevel: "moderate" as ActivityLevelOption,
        fitnessGoal: (profileState.lifestyleData.fitnessGoal || "") as
          | ""
          | "lose"
          | "maintain"
          | "gain",
      });

      setMessage("Perfil actualizado correctamente.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCreateWeight = async () => {
    try {
      const numericWeight = Number(recordWeight);

      if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
        setErrorMessage("Ingresa un peso válido.");
        return;
      }

      setIsSavingWeight(true);
      setMessage(null);
      setErrorMessage(null);

      await createWeeklyWeight({
        weight: numericWeight,
      });

      setRecordWeight("");
      setMessage("Peso semanal registrado correctamente.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingWeight(false);
    }
  };

  const handleStartEditWeight = (record: (typeof displayRecords)[number]) => {
    setEditingWeightId(record.id);
    setEditingWeightValue(record.weight.toFixed(1));
    setMessage(null);
    setErrorMessage(null);
  };

  const handleCancelEditWeight = () => {
    setEditingWeightId(null);
    setEditingWeightValue("");
  };

  const handleSaveEditedWeight = async (recordId: string) => {
    try {
      const numericWeight = Number(editingWeightValue);

      if (!Number.isFinite(numericWeight) || numericWeight <= 0) {
        setErrorMessage("Ingresa un peso válido para actualizar.");
        return;
      }

      setSavingWeightId(recordId);
      setMessage(null);
      setErrorMessage(null);

      await updateWeightRecord(recordId, {
        weight: numericWeight,
      });

      setEditingWeightId(null);
      setEditingWeightValue("");
      setMessage("Registro de peso actualizado correctamente.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSavingWeightId(null);
    }
  };

  const handleDeleteWeight = async (recordId: string) => {
    try {
      setMessage(null);
      setErrorMessage(null);

      await deleteLatestWeight(recordId);

      setMessage("Último registro de peso eliminado correctamente.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  };

  const handleSaveDailyCalories = async () => {
    try {
      const numericCalories = Number(profileState.lifestyleData.dailyCalories);

      if (!Number.isFinite(numericCalories) || numericCalories <= 0) {
        setErrorMessage("Ingresa una cantidad válida de calorías.");
        return;
      }

      setIsSavingCalories(true);
      setMessage(null);
      setErrorMessage(null);

      await createDailyCalories({
        dailyCalories: numericCalories,
      });

      setMessage("Calorías diarias registradas correctamente.");
      await loadDashboard();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSavingCalories(false);
    }
  };

  const latestRecordId = displayRecords.length > 0 ? displayRecords[0].id : null;

  if (isLoading) {
    return (
      <section className={styles.page}>
        <div className={styles.emptyState}>
          <Sparkles size={28} />
          <strong>Cargando perfil...</strong>
          <span>Estamos obteniendo tu información guardada.</span>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <header className={styles.pageHeader}>
        <span className={styles.pageEyebrow}>Portal cliente / seguimiento corporal</span>
        <h1 className={styles.pageTitle}>Mi perfil y prediccion semanal</h1>
        <p className={styles.pageSubtitle}>
          {displayName ? `${displayName}, ` : ""}
          desde aqui podras actualizar tus datos personales, registrar tu
          progreso y consultar una proyeccion de peso construida con tu
          historial real.
        </p>
      </header>

      {message ? <div className={styles.successMessage}>{message}</div> : null}
      {errorMessage ? <div className={styles.errorMessage}>{errorMessage}</div> : null}

      <div className={styles.viewTabs}>
        <button
          type="button"
          className={`${styles.viewTab} ${
            activeView === "client" ? styles.viewTabActive : ""
          }`}
          onClick={() => setActiveView("client")}
        >
          <UserRound size={16} />
          Datos del cliente
        </button>
        <button
          type="button"
          className={`${styles.viewTab} ${
            activeView === "prediction" ? styles.viewTabActive : ""
          }`}
          onClick={() => setActiveView("prediction")}
        >
          <Sparkles size={16} />
          Predicción semanal
        </button>
      </div>

      {activeView === "client" ? (
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBar} />
          <span className={styles.sectionHeadingIcon}>
            <UserRound size={18} />
          </span>
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
                  <h3>Datos Personales y Físicos</h3>
                  <p>
                    Ingresa tu información básica para personalizar tu experiencia.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span className={styles.labelWithIcon}>
                    <UserRound size={14} />
                    <span className={styles.label}>Edad</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <UserRound size={14} />
                    <span className={styles.label}>Género</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <Scale size={14} />
                    <span className={styles.label}>Altura (metros)</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <Weight size={14} />
                    <span className={styles.label}>Peso Inicial (kg)</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <Target size={14} />
                    <span className={styles.label}>Peso Objetivo (kg)</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <CalendarClock size={14} />
                    <span className={styles.label}>Fecha de Inicio</span>
                  </span>
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

              <div className={styles.recordActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                >
                  <UserRound size={16} />
                  {isSavingProfile ? "Guardando..." : "Guardar perfil"}
                </button>
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
                    Información sobre tus hábitos de ejercicio y nutrición.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGridTriple}>
                <label className={styles.field}>
                  <span className={styles.labelWithIcon}>
                    <Dumbbell size={14} />
                    <span className={styles.label}>Asistencia Semanal al Gimnasio</span>
                  </span>
                  <select
                    className={styles.select}
                    value={profileState.lifestyleData.weeklyAttendance}
                    onChange={(event) =>
                      updateLifestyleData("weeklyAttendance", event.target.value)
                    }
                  >
                    <option value="">Días por semana</option>
                    {Array.from({ length: 7 }, (_, index) => index + 1).map((day) => (
                      <option key={day} value={String(day)}>
                        {day} {day === 1 ? "día" : "días"}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span className={styles.labelWithIcon}>
                    <Flame size={14} />
                    <span className={styles.label}>Calorías consumidas hoy</span>
                  </span>
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
                  <span className={styles.labelWithIcon}>
                    <Sparkles size={14} />
                    <span className={styles.label}>Objetivo Fitness</span>
                  </span>
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

              <div className={styles.recordHelper}>
                <span>
                  Registra tus calorías todos los días. El botón queda libre y
                  el panel resume tu promedio semanal con los últimos 7 días
                  registrados.
                </span>
              </div>

              <div className={styles.recordActions}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={handleSaveDailyCalories}
                  disabled={isSavingCalories}
                >
                  <CalendarClock size={16} />
                  {isSavingCalories ? "Guardando..." : "Guardar calorías de hoy"}
                </button>
              </div>

              <div className={styles.historyStatsGrid}>
                <article className={styles.historyStatCard}>
                  <span className={styles.historyStatIcon}>
                    <Flame size={16} />
                  </span>
                  <strong>{formatCalories(calorieSummary.latestCalories)}</strong>
                  <span>Último consumo registrado</span>
                </article>

                <article className={styles.historyStatCard}>
                  <span className={styles.historyStatIcon}>
                    <LineChartIcon size={16} />
                  </span>
                  <strong>{formatCalories(calorieSummary.averageCalories)}</strong>
                  <span>
                    Promedio semanal ({calorieSummary.trackedDays}{" "}
                    {calorieSummary.trackedDays === 1 ? "día" : "días"})
                  </span>
                </article>

                <article className={styles.historyStatCard}>
                  <span className={styles.historyStatIcon}>
                    <CalendarClock size={16} />
                  </span>
                  <strong>{calorieSummary.totalRecords}</strong>
                  <span>Registros diarios guardados</span>
                </article>
              </div>

              <div className={styles.historyBlock}>
                <div className={styles.historyBlockHeader}>
                  <div className={styles.historyBlockTitle}>
                    <span className={styles.historyBadge}>
                      <Flame size={16} />
                    </span>
                    <div>
                      <strong>Consumo histórico</strong>
                      <p>Consulta tu historial diario y el promedio reciente usado en la proyección.</p>
                    </div>
                  </div>
                </div>

                {displayCalorieRecords.length > 0 ? (
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Consumo</th>
                          <th>Cambio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayCalorieRecords.map((record) => (
                          <tr key={record.id}>
                            <td>{formatRecordDate(record.recordDate)}</td>
                            <td>{formatCalories(record.dailyCalories)}</td>
                            <td>
                              <span
                                className={`${styles.changeCell} ${getChangeClassName(record.change)}`}
                              >
                                {record.change === null ? (
                                  <Minus size={14} />
                                ) : (
                                  <LineChartIcon size={14} />
                                )}
                                {getCalorieChangeLabel(record.change)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className={styles.emptyStateCompact}>
                    <Flame size={22} />
                    <div>
                      <strong>Sin consumo histórico aún</strong>
                      <span>
                        Cuando guardes calorías diarias, aparecerán aquí igual que
                        tu historial de peso.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
      ) : null}

      {activeView === "prediction" ? (
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <span className={styles.sectionBar} />
          <span className={styles.sectionHeadingIcon}>
            <Sparkles size={18} />
          </span>
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
                    Registra tu peso semanal para construir tu historial.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.panelBody}>
              <div className={styles.formGridTracker}>
                <label className={styles.field}>
                  <span className={styles.labelWithIcon}>
                    <Weight size={14} />
                    <span className={styles.label}>Peso Actual (kg)</span>
                  </span>
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

                <div className={styles.recordHelper}>
                  <span>
                    Registra tu peso idealmente una vez por semana para mantener
                    un historial más claro.
                  </span>
                </div>

                <div className={styles.recordActions}>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleCreateWeight}
                    disabled={!recordWeight || isSavingWeight}
                  >
                    <CalendarClock size={16} />
                    {isSavingWeight ? "Guardando..." : "Guardar registro semanal"}
                  </button>
                </div>
              </div>

              <div className={styles.historyBlockHeader}>
                <div className={styles.historyBlockTitle}>
                  <span className={styles.historyBadge}>
                    <Weight size={16} />
                  </span>
                  <div>
                    <strong>Historial de peso</strong>
                    <p>Tu evolución semanal registrada dentro del sistema.</p>
                  </div>
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
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRecords.map((record) => {
                        const isLatest = record.id === latestRecordId;
                        const isEditing = record.id === editingWeightId;
                        const isSavingThisRow = record.id === savingWeightId;

                        return (
                          <tr key={record.id}>
                            <td>{formatRecordDate(record.date)}</td>
                            <td>
                              {isEditing ? (
                                <input
                                  className={styles.tableInput}
                                  type="number"
                                  min={30}
                                  max={300}
                                  step="0.1"
                                  value={editingWeightValue}
                                  onChange={(event) =>
                                    setEditingWeightValue(event.target.value)
                                  }
                                />
                              ) : (
                                record.weight.toFixed(1)
                              )}
                            </td>
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
                              <div className={styles.tableActions}>
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      className={`${styles.iconButton} ${styles.iconButtonSuccess}`}
                                      onClick={() => handleSaveEditedWeight(record.id)}
                                      disabled={isSavingThisRow}
                                      aria-label={`Guardar cambios del ${record.date}`}
                                      title="Guardar cambios"
                                    >
                                      <Check size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      className={`${styles.iconButton} ${styles.iconButtonNeutral}`}
                                      onClick={handleCancelEditWeight}
                                      disabled={isSavingThisRow}
                                      aria-label={`Cancelar edición del ${record.date}`}
                                      title="Cancelar edición"
                                    >
                                      <X size={15} />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      className={`${styles.iconButton} ${styles.iconButtonNeutral}`}
                                      onClick={() => handleStartEditWeight(record)}
                                      aria-label={`Editar registro del ${record.date}`}
                                      title="Editar registro"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.iconButton}
                                      onClick={() => handleDeleteWeight(record.id)}
                                      disabled={!isLatest}
                                      aria-label={`Eliminar registro del ${record.date}`}
                                      title={
                                        isLatest
                                          ? "Eliminar último registro"
                                          : "Solo puedes eliminar el último registro"
                                      }
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Weight size={28} />
                  <strong>No hay registros aún</strong>
                  <span>
                    Agrega tu primer registro de peso para comenzar el seguimiento.
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
                  <h3>Panel de Predicción</h3>
                  <p>
                    Visualiza tu progreso y obtén estimaciones basadas en tus datos.
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

              <div className={styles.goalSpotlight}>
                <div className={styles.goalSpotlightMain}>
                  <span className={styles.goalSpotlightEyebrow}>
                    Tiempo estimado para llegar al peso objetivo
                  </span>
                  <div className={styles.goalSpotlightValue}>
                    {formatWeekValue(summary.weeksToGoal)}
                  </div>
                  <div className={styles.goalSpotlightLabel}>
                    {summary.weeksToGoal === null
                      ? "Aun no hay una estimacion estable"
                      : Number(summary.weeksToGoal.toFixed(1)) === 1
                        ? "semana más"
                        : "semanas más"}
                  </div>
                  <p className={styles.goalSpotlightDescription}>
                    {summary.estimatedGoalDate
                      ? `Con la formula de la ley de crecimiento y decrecimiento, la llegada estimada seria para ${formatGoalDate(
                          summary.estimatedGoalDate
                        )}.`
                      : "Registra mas datos para calcular una llegada estimada con mejor soporte."}
                  </p>
                </div>

                <div className={styles.goalSpotlightAside}>
                  <div className={styles.goalSpotlightMetric}>
                    <span>Peso actual</span>
                    <strong>{formatWeight(summary.currentWeight)}</strong>
                  </div>
                  <div className={styles.goalSpotlightMetric}>
                    <span>Peso meta</span>
                    <strong>{formatWeight(summary.targetWeight)}</strong>
                  </div>
                  <div className={styles.goalSpotlightMetric}>
                    <span>Tiempo total</span>
                    <strong>
                      {summary.elapsedWeeks !== null && summary.weeksToGoal !== null
                        ? `${(summary.elapsedWeeks + summary.weeksToGoal).toFixed(1)} sem`
                        : "--"}
                    </strong>
                  </div>
                  <div className={styles.goalSpotlightMetric}>
                    <span>Distancia restante</span>
                    <strong>{formatDistance(summary.distanceToGoal)}</strong>
                  </div>
                </div>
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
                    Cambio esperado en una semana segun P(t) = P0 * e^(-k*t).
                  </div>
                </article>

                <article className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <CalendarClock size={16} />
                  </div>
                  <div className={styles.statTitle}>Constante k</div>
                  <div className={styles.statValue}>
                    {summary.modelK === null ? "--" : summary.modelK.toFixed(4)}
                  </div>
                  <div className={styles.statHint}>
                    Obtenida con la formula de la ley de crecimiento y
                    decrecimiento: k = -(1/t) * ln(P(t) / P0).
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
                    Estado corporal basado en tu peso actual y altura.
                  </div>
                </article>
              </div>

              {summary.chartPoints.length > 0 ? (
                <div className={styles.chartPanel}>
                  <div className={styles.chartHeader}>
                    <div className={styles.chartTitleBlock}>
                      <strong>Evolución del peso</strong>
                      <p>
                        Activa o desactiva cada serie para comparar solo tus
                        pesos reales, solo la proyección o ambas a la vez.
                      </p>
                    </div>

                    <div className={styles.chartControls}>
                      <button
                        type="button"
                        className={`${styles.chartToggle} ${
                          showActualSeries
                            ? styles.chartToggleActive
                            : styles.chartToggleInactive
                        }`}
                        aria-pressed={showActualSeries}
                        onClick={() => setShowActualSeries((current) => !current)}
                      >
                        <span className={styles.chartToggleMarker} />
                        Peso real
                      </button>

                      <button
                        type="button"
                        className={`${styles.chartToggle} ${
                          showProjectedSeries
                            ? styles.chartToggleActive
                            : styles.chartToggleInactive
                        }`}
                        aria-pressed={showProjectedSeries}
                        onClick={() => setShowProjectedSeries((current) => !current)}
                      >
                        <span
                          className={`${styles.chartToggleMarker} ${styles.chartToggleMarkerProjected}`}
                        />
                        Proyección semanal
                      </button>

                      {summary.targetWeight !== null ? (
                        <span className={styles.chartGoalPill}>
                          <span className={styles.chartGoalPillLine} />
                          Meta objetivo
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className={styles.chartMetrics}>
                    <div className={styles.chartMetricCard}>
                      <span>Último peso</span>
                      <strong>{formatWeight(summary.currentWeight)}</strong>
                    </div>
                    <div className={styles.chartMetricCard}>
                      <span>Meta</span>
                      <strong>{formatWeight(summary.targetWeight)}</strong>
                    </div>
                    <div className={styles.chartMetricCard}>
                      <span>Registros</span>
                      <strong>{displayRecords.length}</strong>
                    </div>
                    <div className={styles.chartMetricCard}>
                      <span>Tiempo restante</span>
                      <strong>{formatWeeksToGoal(summary.weeksToGoal)}</strong>
                    </div>
                  </div>

                  <div className={styles.chartPanelCanvas}>
                    {showActualSeries || showProjectedSeries ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={summary.chartPoints}
                          margin={{ top: 18, right: 18, left: 6, bottom: 8 }}
                        >
                          <defs>
                            <linearGradient id="actualWeightFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ff3342" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#ff3342" stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="projectedWeightFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#171717" stopOpacity={0.16} />
                              <stop offset="100%" stopColor="#171717" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="rgba(144, 132, 147, 0.18)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            minTickGap={12}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <YAxis
                            domain={predictionChartDomain}
                            tickLine={false}
                            axisLine={false}
                            width={46}
                            tickFormatter={(value) => Number(value).toFixed(1)}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <Tooltip
                            cursor={{
                              stroke: "rgba(29, 25, 30, 0.12)",
                              strokeWidth: 1.5,
                            }}
                            content={renderPredictionTooltip}
                          />
                          {summary.targetWeight !== null && (
                            <ReferenceLine
                              y={summary.targetWeight}
                              stroke="#ff1f2d"
                              strokeWidth={1.5}
                              strokeDasharray="6 6"
                            />
                          )}
                          <Area
                            type="monotone"
                            dataKey="actualWeight"
                            hide={!showActualSeries}
                            connectNulls
                            stroke="none"
                            fill="url(#actualWeightFill)"
                            isAnimationActive={false}
                          />
                          <Area
                            type="monotone"
                            dataKey="projectedWeight"
                            hide={!showProjectedSeries}
                            connectNulls
                            stroke="none"
                            fill="url(#projectedWeightFill)"
                            isAnimationActive={false}
                          />
                          <Line
                            type="monotone"
                            name="Peso real"
                            dataKey="actualWeight"
                            hide={!showActualSeries}
                            stroke="#ff3342"
                            strokeWidth={3.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            connectNulls
                            dot={{ r: 4.5, fill: "#ff3342", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 7, fill: "#ff3342", stroke: "#fff", strokeWidth: 2.5 }}
                          />
                          <Line
                            type="monotone"
                            name="Peso proyectado"
                            dataKey="projectedWeight"
                            hide={!showProjectedSeries}
                            stroke="#171717"
                            strokeWidth={3}
                            strokeDasharray="8 6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            dot={{ r: 3.5, fill: "#171717", stroke: "#fff", strokeWidth: 1.5 }}
                            activeDot={{ r: 6, fill: "#171717", stroke: "#fff", strokeWidth: 2 }}
                            connectNulls
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className={styles.chartDisabledState}>
                        <LineChartIcon size={26} />
                        <strong>Activa al menos una serie</strong>
                        <span>
                          Puedes encender Peso real o Proyeccion semanal para
                          volver a visualizar la grafica.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <LineChartIcon size={28} />
                  <strong>Sin datos para visualizar</strong>
                  <span>
                    Agrega registros de peso para ver la gráfica y generar una
                    tendencia.
                  </span>
                </div>
              )}

              <div className={styles.chartGrid}>
                <article className={styles.barChartCard}>
                  <div className={styles.barChartHeader}>
                    <strong>Peso registrado</strong>
                    <p>
                      Aquí se muestran solamente tus pesos ya registrados. En
                      este momento deberían verse tus 6 semanas guardadas con
                      una escala ajustada para notar mejor el descenso.
                    </p>
                  </div>

                  {registeredWeightBarData.length > 0 ? (
                    <div className={styles.barChartPanel}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={registeredWeightBarData}
                          margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ece7ea" />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <YAxis
                            domain={registeredWeightBarDomain}
                            tickLine={false}
                            axisLine={false}
                            width={42}
                            tickFormatter={(value) => Number(value).toFixed(1)}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <Tooltip
                            formatter={(value) => [`${Number(value).toFixed(1)} kg`, "Peso registrado"]}
                            labelFormatter={(_, payload) =>
                              payload?.[0]?.payload?.fullLabel
                                ? `Fecha: ${payload[0].payload.fullLabel}`
                                : "Peso registrado"
                            }
                            contentStyle={{
                              borderRadius: "14px",
                              border: "1px solid #ece7ea",
                              boxShadow: "0 18px 34px rgba(31, 23, 32, 0.08)",
                            }}
                          />
                          <Bar dataKey="weight" radius={[10, 10, 0, 0]} fill="#ff5a66" maxBarSize={58}>
                            <LabelList
                              dataKey="weight"
                              position="top"
                              formatter={(value) => Number(value ?? 0).toFixed(1)}
                              className={styles.barValueLabel}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className={styles.emptyStateCompact}>
                      <Weight size={22} />
                      <div>
                        <strong>Sin pesos registrados aún</strong>
                        <span>Cuando guardes tu historial semanal, esta gráfica se llenará.</span>
                      </div>
                    </div>
                  )}
                </article>

                <article className={styles.barChartCard}>
                  <div className={styles.barChartHeader}>
                    <strong>Próximas 2 semanas</strong>
                    <p>
                      Esta barra mezcla tus 6 pesos registrados más las 2 semanas
                      siguientes proyectadas después del último registro, con
                      escala recortada para que el cambio sí se note.
                    </p>
                  </div>

                  {projectedWeightBarData.length > 0 ? (
                    <div className={styles.barChartPanel}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={projectedWeightBarData}
                          margin={{ top: 8, right: 10, left: 0, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#ece7ea" />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <YAxis
                            domain={projectedWeightBarDomain}
                            tickLine={false}
                            axisLine={false}
                            width={42}
                            tickFormatter={(value) => Number(value).toFixed(1)}
                            tick={{ fontSize: 12, fill: "#7d7380" }}
                          />
                          <Tooltip
                            formatter={(value, _name, item) => [
                              `${Number(value).toFixed(1)} kg`,
                              item?.payload?.kind === "projected"
                                ? "Peso proyectado"
                                : "Peso registrado",
                            ]}
                            labelFormatter={(_, payload) =>
                              payload?.[0]?.payload?.fullLabel
                                ? `Referencia: ${payload[0].payload.fullLabel}`
                                : "Peso"
                            }
                            contentStyle={{
                              borderRadius: "14px",
                              border: "1px solid #ece7ea",
                              boxShadow: "0 18px 34px rgba(31, 23, 32, 0.08)",
                            }}
                          />
                          <Bar dataKey="weight" radius={[10, 10, 0, 0]} maxBarSize={54}>
                            {projectedWeightBarData.map((entry, index) => (
                              <Cell
                                key={`${entry.label}-${index}`}
                                fill={entry.kind === "projected" ? "#171717" : "#ff8089"}
                              />
                            ))}
                            <LabelList
                              dataKey="weight"
                              position="top"
                              formatter={(value) => Number(value ?? 0).toFixed(1)}
                              className={styles.barValueLabel}
                            />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className={styles.emptyStateCompact}>
                      <LineChartIcon size={22} />
                      <div>
                        <strong>Sin proyección inmediata</strong>
                        <span>Necesitas historial suficiente para calcular las 2 semanas siguientes.</span>
                      </div>
                    </div>
                  )}
                </article>
              </div>

              {summary.weeklyForecast.length > 0 ? (
                <div className={styles.forecastSection}>
                  <div className={styles.forecastHeader}>
                    <div>
                      <strong>Proyección semanal de peso</strong>
                      <p>
                        Cada fila se obtiene con la formula de la ley de
                        crecimiento y decrecimiento P(t) = P0 * e^(-k*t),
                        usando t como las semanas transcurridas desde tu primer
                        registro. La tabla se detiene en la primera semana en la
                        que el modelo ya alcanza o rebasa tu peso objetivo.
                      </p>
                    </div>
                    <span className={styles.forecastPill}>
                      {summary.weeksToGoal === null
                        ? "Sigue registrando para estimar tu llegada"
                        : `Peso objetivo en ${formatWeeksToGoal(summary.weeksToGoal)}`}
                    </span>
                  </div>

                  <div className={styles.forecastChartPanel}>
                    <div className={styles.forecastLegend}>
                      <span className={styles.forecastLegendItem}>
                        <span className={styles.forecastLegendLine} />
                        Peso posible
                      </span>
                      <span className={styles.forecastLegendItem}>
                        <span className={styles.forecastLegendBar} />
                        Falta para meta
                      </span>
                      <span className={styles.forecastLegendText}>
                        Semana, peso y distancia se leen juntos en esta grafica.
                      </span>
                    </div>

                    <div className={styles.forecastChartCanvas}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                          data={forecastChartData}
                          margin={{ top: 18, right: 18, left: 8, bottom: 4 }}
                        >
                          <defs>
                            <linearGradient id="forecastDistanceFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ff8891" stopOpacity={0.95} />
                              <stop offset="100%" stopColor="#ffd3d7" stopOpacity={0.85} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="4 4"
                            stroke="rgba(144, 132, 147, 0.18)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            tick={{ fontSize: 12, fill: "#7d7380", fontWeight: 700 }}
                          />
                          <YAxis
                            yAxisId="weight"
                            domain={forecastWeightDomain}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                            tickFormatter={(value) => `${Number(value).toFixed(1)}`}
                            tick={{ fontSize: 12, fill: "#171717" }}
                          />
                          <YAxis
                            yAxisId="distance"
                            orientation="right"
                            domain={forecastDistanceDomain}
                            tickLine={false}
                            axisLine={false}
                            width={48}
                            tickFormatter={(value) => `${Number(value).toFixed(1)}`}
                            tick={{ fontSize: 12, fill: "#b31520" }}
                          />
                          <Tooltip
                            cursor={{
                              stroke: "rgba(29, 25, 30, 0.12)",
                              strokeWidth: 1.5,
                            }}
                            content={renderForecastTooltip}
                          />
                          <Bar
                            yAxisId="distance"
                            dataKey="distanceToGoal"
                            fill="url(#forecastDistanceFill)"
                            radius={[10, 10, 0, 0]}
                            maxBarSize={34}
                          >
                            <LabelList
                              dataKey="distanceToGoal"
                              position="top"
                              formatter={(value) => `${Number(value ?? 0).toFixed(1)} kg`}
                              className={styles.forecastBarLabel}
                            />
                          </Bar>
                          <Line
                            yAxisId="weight"
                            type="monotone"
                            dataKey="estimatedWeight"
                            stroke="#171717"
                            strokeWidth={3}
                            dot={{ r: 4.5, fill: "#171717", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: "#171717", stroke: "#fff", strokeWidth: 2 }}
                          >
                            <LabelList
                              dataKey="estimatedWeight"
                              position="top"
                              formatter={(value) => `${Number(value ?? 0).toFixed(1)} kg`}
                              className={styles.forecastLineLabel}
                            />
                          </Line>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Semana desde inicio</th>
                          <th>Fecha estimada</th>
                          <th>Peso posible</th>
                          <th>Falta para meta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.weeklyForecast.map((forecast) => (
                          <tr key={forecast.week}>
                            <td>Semana {forecast.week}</td>
                            <td>{formatRecordDate(forecast.projectedDate)}</td>
                            <td>{formatWeight(forecast.estimatedWeight)}</td>
                            <td>{formatDistance(forecast.distanceToGoal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className={styles.predictionFooter}>
                <div className={styles.predictionFooterHeader}>
                  <span className={styles.predictionFooterBadge}>
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <strong>Lectura actual del modelo</strong>
                    <p>
                      Resultado obtenido con la formula de la ley de crecimiento
                      y decrecimiento aplicada a tus pesos reales.
                    </p>
                  </div>
                </div>

                <div className={styles.predictionFooterLead}>
                  {summary.recommendation}
                </div>

                <div className={styles.predictionInsightGrid}>
                  <article className={styles.predictionInsightCard}>
                    <span>Ritmo observado</span>
                    <strong>{formatRate(summary.observedRate)}</strong>
                    <small>Promedio real entre los registros que ya guardaste.</small>
                  </article>

                  <article className={styles.predictionInsightCard}>
                    <span>Tiempo restante</span>
                    <strong>{formatWeeksToGoal(summary.weeksToGoal)}</strong>
                    <small>Tiempo estimado para tocar tu peso meta actual.</small>
                  </article>

                  <article className={styles.predictionInsightCard}>
                    <span>Semanas analizadas</span>
                    <strong>
                      {summary.elapsedWeeks === null
                        ? "--"
                        : `${summary.elapsedWeeks.toFixed(1)} semanas`}
                    </strong>
                    <small>Tramo historico usado para ajustar la curva.</small>
                  </article>

                  <article className={styles.predictionInsightCard}>
                    <span>Peso actual</span>
                    <strong>{formatWeight(summary.currentWeight)}</strong>
                    <small>Punto mas reciente tomado para leer tu avance.</small>
                  </article>
                </div>

                <div className={styles.predictionEquation}>
                  <span>Formula aplicada</span>
                  <strong>{summary.modelEquation ?? "P(t) = P0 * e^(-k*t)"}</strong>
                  <small>
                    {summary.modelK === null
                      ? "Aun faltan datos para despejar k con estabilidad."
                      : `Constante k mostrada: ${summary.modelK.toFixed(4)}`}
                  </small>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
      ) : null}
    </section>
  );
}
