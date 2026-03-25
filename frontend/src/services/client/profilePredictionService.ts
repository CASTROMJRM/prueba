const STORAGE_PREFIX = "titanium_client_profile_prediction";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

export type GenderOption = "" | "male" | "female" | "other";
export type FitnessGoalOption = "" | "lose" | "maintain" | "gain";

export interface PersonalData {
  age: string;
  gender: GenderOption;
  height: string;
  initialWeight: string;
  targetWeight: string;
  startDate: string;
}

export interface LifestyleData {
  weeklyAttendance: string;
  dailyCalories: string;
  fitnessGoal: FitnessGoalOption;
}

export interface ProgressRecord {
  id: string;
  date: string;
  weight: number;
}

export interface ProfilePredictionState {
  personalData: PersonalData;
  lifestyleData: LifestyleData;
  progressRecords: ProgressRecord[];
}

export interface DisplayProgressRecord extends ProgressRecord {
  change: number | null;
}

export interface PredictionChartPoint {
  isoDate: string;
  label: string;
  weight: number;
}

export interface PredictionSummary {
  hasRequiredProfile: boolean;
  hasEnoughData: boolean;
  goalLabel: string;
  statusLabel: string;
  statusTone: "success" | "warning" | "danger" | "neutral";
  recommendation: string;
  currentWeight: number | null;
  initialWeight: number | null;
  targetWeight: number | null;
  bmi: number | null;
  bmiLabel: string;
  observedRate: number | null;
  projectedRate: number | null;
  distanceToGoal: number | null;
  weeksToGoal: number | null;
  estimatedGoalDate: string | null;
  chartPoints: PredictionChartPoint[];
}

export function createEmptyProfilePredictionState(): ProfilePredictionState {
  return {
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
  };
}

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function normalizeNumber(value: unknown) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function normalizeRecord(record: unknown): ProgressRecord | null {
  if (!record || typeof record !== "object") {
    return null;
  }

  const candidate = record as Record<string, unknown>;
  const id = normalizeString(candidate.id);
  const date = normalizeString(candidate.date);
  const weight = normalizeNumber(candidate.weight);

  if (!id || !date || weight === null) {
    return null;
  }

  return { id, date, weight };
}

function sortRecordsDescending(records: ProgressRecord[]) {
  return [...records].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime()
  );
}

function sortRecordsAscending(records: ProgressRecord[]) {
  return [...records].sort(
    (left, right) => new Date(left.date).getTime() - new Date(right.date).getTime()
  );
}

function parseOptionalNumber(rawValue: string) {
  const numericValue = Number(rawValue);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getStorageKey(storageScope: string) {
  return `${STORAGE_PREFIX}:${storageScope}`;
}

function estimateLifestyleRate(
  goal: FitnessGoalOption,
  weeklyAttendance: number | null,
  dailyCalories: number | null
) {
  const attendance = clamp(weeklyAttendance ?? 0, 0, 7);
  const calories = dailyCalories ?? 2200;

  if (goal === "lose") {
    const weeklyLoss =
      0.22 +
      attendance * 0.07 +
      clamp((2100 - calories) / 900, -0.12, 0.25);

    return -clamp(weeklyLoss, 0.12, 1);
  }

  if (goal === "gain") {
    const weeklyGain =
      0.1 +
      attendance * 0.03 +
      clamp((calories - 2200) / 1200, -0.05, 0.2);

    return clamp(weeklyGain, 0.06, 0.45);
  }

  return 0;
}

function getGoalDirection(currentWeight: number, targetWeight: number) {
  if (targetWeight < currentWeight - 0.2) return -1;
  if (targetWeight > currentWeight + 0.2) return 1;
  return 0;
}

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
  });
}

function buildTimelineRecords(
  state: ProfilePredictionState,
  latestWeight: number | null
) {
  const baselineWeight = parseOptionalNumber(state.personalData.initialWeight);
  const baselineDate = state.personalData.startDate;
  const records = [...state.progressRecords];

  if (
    baselineWeight !== null &&
    baselineDate &&
    !records.some((record) => record.date === baselineDate)
  ) {
    records.push({
      id: "baseline",
      date: baselineDate,
      weight: baselineWeight,
    });
  }

  if (records.length === 0 && latestWeight !== null) {
    return [
      {
        id: "current",
        date: new Date().toISOString().slice(0, 10),
        weight: latestWeight,
      },
    ];
  }

  return sortRecordsAscending(records);
}

function getObservedRate(timelineRecords: ProgressRecord[]) {
  if (timelineRecords.length < 2) {
    return null;
  }

  const firstRecord = timelineRecords[0];
  const lastRecord = timelineRecords[timelineRecords.length - 1];
  const elapsedDays = Math.max(
    1,
    Math.round(
      (new Date(lastRecord.date).getTime() - new Date(firstRecord.date).getTime()) /
        DAY_IN_MS
    )
  );
  const elapsedWeeks = Math.max(elapsedDays / 7, 1 / 7);

  return (lastRecord.weight - firstRecord.weight) / elapsedWeeks;
}

function getBmiLabel(bmi: number | null) {
  if (bmi === null) return "Sin datos";
  if (bmi < 18.5) return "Bajo";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Alto";
  return "Muy alto";
}

function getGoalLabel(goal: FitnessGoalOption) {
  if (goal === "lose") return "Perder peso";
  if (goal === "gain") return "Ganar masa";
  if (goal === "maintain") return "Mantener peso";
  return "Sin objetivo";
}

function getRecommendation(
  hasRequiredProfile: boolean,
  hasEnoughData: boolean,
  goalDirection: number,
  paceTowardsGoal: number | null
) {
  if (!hasRequiredProfile) {
    return "Completa altura, peso inicial y peso objetivo para activar la proyeccion.";
  }

  if (!hasEnoughData) {
    return "Registra al menos dos pesos en fechas distintas para calcular una tendencia confiable.";
  }

  if (goalDirection === 0) {
    return "Tu objetivo actual esta muy cerca del peso registrado. Mantener constancia sera la clave.";
  }

  if (paceTowardsGoal === null || paceTowardsGoal <= 0.05) {
    return "La tendencia actual no te acerca al objetivo. Revisa asistencia, alimentacion y constancia.";
  }

  if (paceTowardsGoal >= 0.45) {
    return "Vas a buen ritmo. Prioriza recuperacion y consistencia para sostener ese avance.";
  }

  return "Tu avance es estable. Sigue registrando peso para ajustar mejor la estimacion.";
}

export function loadProfilePredictionState(
  storageScope: string
): ProfilePredictionState {
  const emptyState = createEmptyProfilePredictionState();
  const rawValue = localStorage.getItem(getStorageKey(storageScope));

  if (!rawValue) {
    return emptyState;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<ProfilePredictionState>;
    const progressRecords = Array.isArray(parsed.progressRecords)
      ? parsed.progressRecords
          .map(normalizeRecord)
          .filter((record): record is ProgressRecord => Boolean(record))
      : [];

    return {
      personalData: {
        ...emptyState.personalData,
        age: normalizeString(parsed.personalData?.age),
        gender: normalizeString(parsed.personalData?.gender) as GenderOption,
        height: normalizeString(parsed.personalData?.height),
        initialWeight: normalizeString(parsed.personalData?.initialWeight),
        targetWeight: normalizeString(parsed.personalData?.targetWeight),
        startDate: normalizeString(parsed.personalData?.startDate),
      },
      lifestyleData: {
        ...emptyState.lifestyleData,
        weeklyAttendance: normalizeString(parsed.lifestyleData?.weeklyAttendance),
        dailyCalories: normalizeString(parsed.lifestyleData?.dailyCalories),
        fitnessGoal: normalizeString(
          parsed.lifestyleData?.fitnessGoal
        ) as FitnessGoalOption,
      },
      progressRecords: sortRecordsDescending(progressRecords),
    };
  } catch {
    return emptyState;
  }
}

export function saveProfilePredictionState(
  storageScope: string,
  state: ProfilePredictionState
) {
  localStorage.setItem(getStorageKey(storageScope), JSON.stringify(state));
}

export function buildDisplayProgressRecords(records: ProgressRecord[]) {
  const sortedRecords = sortRecordsDescending(records);

  return sortedRecords.map((record, index): DisplayProgressRecord => {
    const previousRecord = sortedRecords[index + 1];

    return {
      ...record,
      change: previousRecord ? record.weight - previousRecord.weight : null,
    };
  });
}

export function buildPredictionSummary(
  state: ProfilePredictionState
): PredictionSummary {
  const sortedRecords = sortRecordsDescending(state.progressRecords);
  const latestRecordedWeight = sortedRecords[0]?.weight ?? null;
  const initialWeight = parseOptionalNumber(state.personalData.initialWeight);
  const targetWeight = parseOptionalNumber(state.personalData.targetWeight);
  const height = parseOptionalNumber(state.personalData.height);
  const weeklyAttendance = parseOptionalNumber(state.lifestyleData.weeklyAttendance);
  const dailyCalories = parseOptionalNumber(state.lifestyleData.dailyCalories);
  const goal = state.lifestyleData.fitnessGoal;
  const currentWeight = latestRecordedWeight ?? initialWeight;
  const hasRequiredProfile =
    currentWeight !== null && targetWeight !== null && height !== null;

  const timelineRecords = buildTimelineRecords(state, currentWeight);
  const observedRate = getObservedRate(timelineRecords);
  const estimatedRate = estimateLifestyleRate(goal, weeklyAttendance, dailyCalories);
  const hasEnoughData = timelineRecords.length >= 2;

  let goalDirection = 0;
  let projectedRate: number | null = null;
  let distanceToGoal: number | null = null;
  let weeksToGoal: number | null = null;
  let estimatedGoalDate: string | null = null;
  let statusLabel = "Completa tu perfil";
  let statusTone: PredictionSummary["statusTone"] = "neutral";

  if (hasRequiredProfile && currentWeight !== null && targetWeight !== null) {
    goalDirection = getGoalDirection(currentWeight, targetWeight);

    projectedRate =
      observedRate === null
        ? estimatedRate
        : observedRate * 0.7 + estimatedRate * 0.3;

    distanceToGoal =
      goalDirection === 0
        ? Math.abs(targetWeight - currentWeight)
        : Math.max(0, (targetWeight - currentWeight) * goalDirection);

    const paceTowardsGoal =
      goalDirection === 0 || projectedRate === null
        ? null
        : projectedRate * goalDirection;

    if (distanceToGoal <= 0.25) {
      statusLabel = "Objetivo casi logrado";
      statusTone = "success";
    } else if (!hasEnoughData) {
      statusLabel = "Necesitas mas registros";
      statusTone = "warning";
    } else if (paceTowardsGoal === null || paceTowardsGoal <= 0.05) {
      statusLabel = "Ritmo insuficiente";
      statusTone = "danger";
    } else if (paceTowardsGoal >= 0.45) {
      statusLabel = "Buen ritmo";
      statusTone = "success";
    } else {
      statusLabel = "Progreso constante";
      statusTone = "warning";
    }

    if (
      paceTowardsGoal !== null &&
      paceTowardsGoal > 0.05 &&
      distanceToGoal !== null &&
      distanceToGoal > 0.25
    ) {
      weeksToGoal = Math.ceil(distanceToGoal / paceTowardsGoal);

      const goalDate = new Date();
      goalDate.setDate(goalDate.getDate() + weeksToGoal * 7);
      estimatedGoalDate = goalDate.toISOString().slice(0, 10);
    }
  }

  const bmi =
    currentWeight !== null && height !== null && height > 0
      ? currentWeight / (height * height)
      : null;

  return {
    hasRequiredProfile,
    hasEnoughData,
    goalLabel: getGoalLabel(goal),
    statusLabel,
    statusTone,
    recommendation: getRecommendation(
      hasRequiredProfile,
      hasEnoughData,
      goalDirection,
      goalDirection === 0 || projectedRate === null
        ? null
        : projectedRate * goalDirection
    ),
    currentWeight,
    initialWeight,
    targetWeight,
    bmi,
    bmiLabel: getBmiLabel(bmi),
    observedRate,
    projectedRate,
    distanceToGoal,
    weeksToGoal,
    estimatedGoalDate,
    chartPoints: timelineRecords.map((record) => ({
      isoDate: record.date,
      label: formatShortDate(record.date),
      weight: record.weight,
    })),
  };
}
