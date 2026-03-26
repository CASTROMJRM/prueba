const STORAGE_PREFIX = "titanium_client_profile_prediction";
const DAY_IN_MS = 1000 * 60 * 60 * 24;
const MAX_FORECAST_WEEKS = 52;

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
  actualWeight: number | null;
  projectedWeight: number | null;
}

export interface WeeklyForecastPoint {
  week: number;
  projectedDate: string;
  estimatedWeight: number;
  distanceToGoal: number | null;
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
  paceTowardsGoal: number | null;
  elapsedWeeks: number | null;
  modelK: number | null;
  modelEquation: string | null;
  chartPoints: PredictionChartPoint[];
  weeklyForecast: WeeklyForecastPoint[];
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
  const date = normalizeCalendarDate(normalizeString(candidate.date));
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

function getStorageKey(storageScope: string) {
  return `${STORAGE_PREFIX}:${storageScope}`;
}

function getGoalDirection(currentWeight: number, targetWeight: number) {
  if (targetWeight < currentWeight - 0.2) return -1;
  if (targetWeight > currentWeight + 0.2) return 1;
  return 0;
}

function formatShortDate(date: string) {
  return toCalendarDate(date).toLocaleDateString("es-MX", {
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
  const records = sortRecordsAscending([...state.progressRecords]);

  if (records.length > 0) {
    const oldestRecord = records[0];

    if (baselineWeight === null || !baselineDate) {
      return records;
    }

    const daysBetweenBaselineAndFirstRecord =
      (toCalendarDate(oldestRecord.date).getTime() -
        toCalendarDate(baselineDate).getTime()) /
      DAY_IN_MS;

    // Cuando ya existe historial real, solo se agrega la linea base si la fecha
    // inicial representa una semana completa distinta. Asi evitamos puntos
    // "fantasma" uno o pocos dias antes del corte semanal real.
    if (
      daysBetweenBaselineAndFirstRecord >= 7 &&
      !records.some((record) => record.date === baselineDate)
    ) {
      return sortRecordsAscending([
        ...records,
        {
          id: "baseline",
          date: baselineDate,
          weight: baselineWeight,
        },
      ]);
    }

    return records;
  }

  if (
    baselineWeight !== null &&
    baselineDate &&
    !records.some((record) => record.date === baselineDate)
  ) {
    return [
      {
      id: "baseline",
      date: baselineDate,
      weight: baselineWeight,
      },
    ];
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

  return records;
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
  paceTowardsGoal: number | null,
  hasValidModel: boolean,
  distanceToGoal: number | null
) {
  if (!hasRequiredProfile) {
    return "Completa tu peso meta y registra tu historial con fechas para estimar el tiempo de llegada.";
  }

  if (!hasEnoughData) {
    return "Registra al menos dos pesos en fechas distintas para calcular k con el modelo exponencial puro.";
  }

  if (distanceToGoal !== null && distanceToGoal <= 0) {
    return "Ya alcanzaste ese peso objetivo o incluso estas por debajo de el.";
  }

  if (goalDirection >= 0) {
    return "Para este modelo de decrecimiento, el peso objetivo debe ser menor que tu peso actual.";
  }

  if (!hasValidModel) {
    return "Aun no hay una disminucion valida entre tu primer y ultimo peso para ajustar k. Verifica que el ultimo registro sea menor al inicial y que exista tiempo transcurrido.";
  }

  if (paceTowardsGoal === null || paceTowardsGoal <= 0.05) {
    return "La curva proyectada avanza muy lento hacia la meta. Revisa tus registros y vuelve a calcular con nuevos datos.";
  }

  return "La proyeccion se calculo con P(t) = P0 * e^(-k*t), usando tu primer y ultimo peso reales.";
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

interface ExponentialWeightModel {
  startDate: string;
  initialWeight: number;
  knownWeight: number;
  elapsedWeeks: number;
  k: number;
  equation: string;
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addWeeks(baseDate: string, weeks: number) {
  const nextDate = new Date(baseDate);
  nextDate.setTime(nextDate.getTime() + weeks * 7 * DAY_IN_MS);
  return toIsoDate(nextDate);
}

function getElapsedWeeksBetween(startDate: string, endDate: string) {
  return (
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
    DAY_IN_MS /
    7
  );
}

function buildModelEquation(initialWeight: number, k: number) {
  return `P(t) = ${initialWeight.toFixed(1)} * e^(-${k.toFixed(4)}*t)`;
}

function calculateExponentialModel(
  timelineRecords: ProgressRecord[]
): ExponentialWeightModel | null {
  if (timelineRecords.length < 2) {
    return null;
  }

  const firstRecord = timelineRecords[0];
  const lastRecord = timelineRecords[timelineRecords.length - 1];
  const initialWeight = firstRecord.weight;
  const knownWeight = lastRecord.weight;
  const elapsedWeeks = getElapsedWeeksBetween(firstRecord.date, lastRecord.date);

  if (
    !Number.isFinite(elapsedWeeks) ||
    elapsedWeeks <= 0 ||
    initialWeight <= 0 ||
    knownWeight <= 0
  ) {
    return null;
  }

  const ratio = knownWeight / initialWeight;

  if (!Number.isFinite(ratio) || ratio <= 0 || ratio >= 1) {
    return null;
  }

  // Ajuste del modelo de decrecimiento puro: k = -(1 / t) * ln(P(t) / P0)
  const k = -(1 / elapsedWeeks) * Math.log(ratio);

  if (!Number.isFinite(k) || k <= 0) {
    return null;
  }

  return {
    startDate: firstRecord.date,
    initialWeight,
    knownWeight,
    elapsedWeeks,
    k,
    equation: buildModelEquation(initialWeight, k),
  };
}

function estimateWeightFromModel(
  model: ExponentialWeightModel,
  weekFromStart: number
) {
  // Proyeccion exponencial pura: P(t) = P0 * e^(-k*t)
  return model.initialWeight * Math.exp(-model.k * weekFromStart);
}

function estimateGoalTotalWeeks(
  model: ExponentialWeightModel,
  targetWeight: number | null
) {
  if (targetWeight === null || targetWeight <= 0 || targetWeight >= model.initialWeight) {
    return null;
  }

  const ratio = targetWeight / model.initialWeight;

  if (!Number.isFinite(ratio) || ratio <= 0 || ratio >= 1) {
    return null;
  }

  const totalWeeks = -(1 / model.k) * Math.log(ratio);

  return Number.isFinite(totalWeeks) && totalWeeks >= 0 ? totalWeeks : null;
}

function getForecastLastWeek(
  model: ExponentialWeightModel,
  targetWeight: number | null
) {
  const firstFutureWeek = Math.floor(model.elapsedWeeks) + 1;
  const goalTotalWeeks = estimateGoalTotalWeeks(model, targetWeight);
  const goalWeek = goalTotalWeeks === null ? null : Math.ceil(goalTotalWeeks);
  const baseLastWeek =
    goalWeek === null ? firstFutureWeek + 11 : Math.max(firstFutureWeek, goalWeek);

  return Math.min(MAX_FORECAST_WEEKS, baseLastWeek);
}

function buildWeeklyForecast(
  model: ExponentialWeightModel | null,
  targetWeight: number | null
): WeeklyForecastPoint[] {
  if (!model) {
    return [];
  }

  const firstFutureWeek = Math.floor(model.elapsedWeeks) + 1;
  const lastWeek = getForecastLastWeek(model, targetWeight);
  const forecast: WeeklyForecastPoint[] = [];

  for (let week = firstFutureWeek; week <= lastWeek; week += 1) {
    const estimatedWeight = estimateWeightFromModel(model, week);

    forecast.push({
      week,
      projectedDate: addWeeks(model.startDate, week),
      estimatedWeight,
      distanceToGoal:
        targetWeight === null ? null : Math.max(estimatedWeight - targetWeight, 0),
    });
  }

  return forecast;
}

function buildPredictionChartPoints(
  timelineRecords: ProgressRecord[],
  model: ExponentialWeightModel | null,
  targetWeight: number | null
) {
  const chartPointMap = new Map<string, PredictionChartPoint>();

  for (const record of timelineRecords) {
    const elapsedWeeks = model
      ? Math.max(0, getElapsedWeeksBetween(model.startDate, record.date))
      : null;

    chartPointMap.set(record.date, {
      isoDate: record.date,
      label: formatShortDate(record.date),
      actualWeight: record.weight,
      projectedWeight:
        model && elapsedWeeks !== null
          ? estimateWeightFromModel(model, elapsedWeeks)
          : null,
    });
  }

  if (!model) {
    return [...chartPointMap.values()].sort((left, right) =>
      left.isoDate.localeCompare(right.isoDate)
    );
  }

  const lastWeek = getForecastLastWeek(model, targetWeight);

  for (let week = 0; week <= lastWeek; week += 1) {
    const projectionDate = addWeeks(model.startDate, week);
    const existingPoint = chartPointMap.get(projectionDate);

    chartPointMap.set(projectionDate, {
      isoDate: projectionDate,
      label: formatShortDate(projectionDate),
      actualWeight: existingPoint?.actualWeight ?? null,
      projectedWeight: estimateWeightFromModel(model, week),
    });
  }

  return [...chartPointMap.values()].sort((left, right) =>
    left.isoDate.localeCompare(right.isoDate)
  );
}

export function buildPredictionSummary(
  state: ProfilePredictionState
): PredictionSummary {
  const sortedRecords = sortRecordsDescending(state.progressRecords);
  const latestRecordedWeight = sortedRecords[0]?.weight ?? null;
  const initialWeightInput = parseOptionalNumber(state.personalData.initialWeight);
  const targetWeight = parseOptionalNumber(state.personalData.targetWeight);
  const height = parseOptionalNumber(state.personalData.height);
  const goal = state.lifestyleData.fitnessGoal;
  const currentWeight = latestRecordedWeight ?? initialWeightInput;
  const timelineRecords = buildTimelineRecords(state, currentWeight);
  const timelineInitialWeight = timelineRecords[0]?.weight ?? initialWeightInput;
  const latestTimelineRecord =
    timelineRecords.length > 0 ? timelineRecords[timelineRecords.length - 1] : null;
  const hasRequiredProfile =
    currentWeight !== null && targetWeight !== null && timelineRecords.length > 0;
  const observedRate = getObservedRate(timelineRecords);
  const hasEnoughData = timelineRecords.length >= 2;
  const exponentialModel = calculateExponentialModel(timelineRecords);

  let goalDirection = 0;
  let projectedRate: number | null = null;
  let distanceToGoal: number | null = null;
  let weeksToGoal: number | null = null;
  let estimatedGoalDate: string | null = null;
  let paceTowardsGoal: number | null = null;
  let elapsedWeeks: number | null = exponentialModel?.elapsedWeeks ?? null;
  let modelK: number | null = exponentialModel?.k ?? null;
  let modelEquation: string | null = exponentialModel?.equation ?? null;
  let statusLabel = "Completa tu perfil";
  let statusTone: PredictionSummary["statusTone"] = "neutral";

  if (hasRequiredProfile && currentWeight !== null && targetWeight !== null) {
    goalDirection = getGoalDirection(currentWeight, targetWeight);

    distanceToGoal = Math.max(currentWeight - targetWeight, 0);

    if (distanceToGoal <= 0) {
      statusLabel = "Objetivo alcanzado";
      statusTone = "success";
      weeksToGoal = 0;
      estimatedGoalDate = latestTimelineRecord?.date ?? null;
    } else if (!hasEnoughData) {
      statusLabel = "Necesitas mas registros";
      statusTone = "warning";
    } else if (goalDirection >= 0) {
      statusLabel = "Meta no compatible";
      statusTone = "warning";
    } else if (!exponentialModel) {
      statusLabel = "Modelo no disponible";
      statusTone = "danger";
      modelK = null;
      modelEquation = null;
      elapsedWeeks = null;
    } else {
      const goalTotalWeeks = estimateGoalTotalWeeks(exponentialModel, targetWeight);
      const nextWeekWeight = estimateWeightFromModel(
        exponentialModel,
        exponentialModel.elapsedWeeks + 1
      );
      const remainingWeeksRaw =
        goalTotalWeeks === null
          ? null
          : Math.max(0, goalTotalWeeks - exponentialModel.elapsedWeeks);

      projectedRate = nextWeekWeight - currentWeight;
      paceTowardsGoal = currentWeight - nextWeekWeight;

      if (paceTowardsGoal <= 0.15) {
        statusLabel = "Curva lenta";
        statusTone = "warning";
      } else if (paceTowardsGoal >= 0.45) {
        statusLabel = "Buen ajuste";
        statusTone = "success";
      } else {
        statusLabel = "Modelo exponencial activo";
        statusTone = "success";
      }

      if (remainingWeeksRaw !== null) {
        weeksToGoal = remainingWeeksRaw;
      }

      if (goalTotalWeeks !== null) {
        estimatedGoalDate = addWeeks(exponentialModel.startDate, goalTotalWeeks);
      }
    }
  }

  const bmi =
    currentWeight !== null && height !== null && height > 0
      ? currentWeight / (height * height)
      : null;
  const chartPoints = buildPredictionChartPoints(
    timelineRecords,
    exponentialModel,
    targetWeight
  );
  const weeklyForecast = buildWeeklyForecast(exponentialModel, targetWeight);

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
      paceTowardsGoal,
      Boolean(exponentialModel),
      distanceToGoal
    ),
    currentWeight,
    initialWeight: timelineInitialWeight,
    targetWeight,
    bmi,
    bmiLabel: getBmiLabel(bmi),
    observedRate,
    projectedRate,
    distanceToGoal,
    weeksToGoal,
    estimatedGoalDate,
    paceTowardsGoal,
    elapsedWeeks,
    modelK,
    modelEquation,
    chartPoints,
    weeklyForecast,
  };
}
