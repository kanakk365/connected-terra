import type {
  DailyData,
  SleepData,
  BodyData,
  ParsedMetrics,
  ParsedSleepBreakdown,
  ParsedDailyEntry,
} from "./types";

/**
 * Parse today's metrics from a Daily payload array.
 * Falls back to the last entry in the array if today isn't found.
 */
export function parseDailyMetrics(dailyData: DailyData[]): ParsedMetrics {
  if (!dailyData || dailyData.length === 0) {
    return {
      calories: null,
      steps: null,
      sleepHours: null,
      heartRate: null,
      weight: null,
      spo2: null,
      temperature: null,
      distance: null,
    };
  }

  // Take the most recent daily entry
  const latest = dailyData[dailyData.length - 1];

  return {
    calories: latest.calories_data?.total_burned_calories ?? null,
    steps: latest.distance_data?.steps ?? null,
    sleepHours: null, // sleep comes from sleep payload
    heartRate:
      latest.heart_rate_data?.summary?.resting_hr_bpm ??
      latest.heart_rate_data?.summary?.avg_hr_bpm ??
      null,
    weight: null, // weight comes from body payload
    spo2: latest.oxygen_data?.avg_saturation_percentage ?? null,
    temperature: null, // temperature comes from body payload
    distance: latest.distance_data?.distance_meters
      ? +(latest.distance_data.distance_meters / 1000).toFixed(2)
      : null,
  };
}

/**
 * Parse sleep breakdown from the latest sleep payload.
 */
export function parseSleepBreakdown(
  sleepData: SleepData[],
): ParsedSleepBreakdown {
  const empty: ParsedSleepBreakdown = {
    deepHours: 0,
    lightHours: 0,
    remHours: 0,
    awakeHours: 0,
    totalHours: 0,
    efficiency: null,
    sleepScore: null,
  };

  if (!sleepData || sleepData.length === 0) return empty;

  // Filter out naps and get the most recent main sleep
  const mainSleep = sleepData.filter((s) => !s.metadata?.is_nap);
  const latest =
    mainSleep.length > 0
      ? mainSleep[mainSleep.length - 1]
      : sleepData[sleepData.length - 1];

  const asleep = latest.sleep_durations_data?.asleep;
  const awake = latest.sleep_durations_data?.awake;

  const deepSec = asleep?.duration_deep_sleep_state_seconds ?? 0;
  const lightSec = asleep?.duration_light_sleep_state_seconds ?? 0;
  const remSec = asleep?.duration_REM_sleep_state_seconds ?? 0;
  const awakeSec = awake?.duration_awake_state_seconds ?? 0;
  const totalSec =
    asleep?.duration_asleep_state_seconds ?? deepSec + lightSec + remSec;

  return {
    deepHours: +(deepSec / 3600).toFixed(2),
    lightHours: +(lightSec / 3600).toFixed(2),
    remHours: +(remSec / 3600).toFixed(2),
    awakeHours: +(awakeSec / 3600).toFixed(2),
    totalHours: +(totalSec / 3600).toFixed(2),
    efficiency: latest.sleep_durations_data?.sleep_efficiency ?? null,
    sleepScore: latest.scores?.sleep ?? null,
  };
}

/**
 * Parse body metrics from the latest body payload.
 */
export function parseBodyMetrics(bodyData: BodyData[]): {
  weight: number | null;
  bmi: number | null;
  bodyFat: number | null;
  temperature: number | null;
} {
  if (!bodyData || bodyData.length === 0) {
    return { weight: null, bmi: null, bodyFat: null, temperature: null };
  }

  const latest = bodyData[bodyData.length - 1];
  const measurement = latest.measurements_data?.measurements?.[0];
  const tempSample = latest.temperature_data?.body_temperature_samples?.[0];

  return {
    weight: measurement?.weight_kg ?? null,
    bmi: measurement?.BMI ?? null,
    bodyFat: measurement?.body_fat_percentage ?? null,
    temperature: tempSample?.temperature_celsius ?? null,
  };
}

/**
 * Convert an array of DailyData into chart-friendly entries (one per day).
 */
export function parseDailyTimeSeries(
  dailyData: DailyData[],
): ParsedDailyEntry[] {
  if (!dailyData || dailyData.length === 0) return [];

  return dailyData.map((day) => {
    const date = new Date(day.metadata.start_time);
    const dateStr = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

    const activeSeconds =
      (day.active_durations_data?.moderate_intensity_seconds ?? 0) +
      (day.active_durations_data?.vigorous_intensity_seconds ?? 0);

    return {
      date: dateStr,
      steps: day.distance_data?.steps ?? 0,
      calories: day.calories_data?.total_burned_calories ?? 0,
      distance: day.distance_data?.distance_meters
        ? +(day.distance_data.distance_meters / 1000).toFixed(2)
        : 0,
      heartRate:
        day.heart_rate_data?.summary?.resting_hr_bpm ??
        day.heart_rate_data?.summary?.avg_hr_bpm ??
        null,
      activeMinutes: Math.round(activeSeconds / 60),
      spo2: day.oxygen_data?.avg_saturation_percentage ?? null,
    };
  });
}

/**
 * Parse sleep time series from SleepData array — one entry per night.
 */
export function parseSleepTimeSeries(
  sleepData: SleepData[],
): Array<{ date: string; hours: number }> {
  if (!sleepData || sleepData.length === 0) return [];

  return sleepData
    .filter((s) => !s.metadata?.is_nap)
    .map((s) => {
      const date = new Date(s.metadata.start_time);
      const dateStr = date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const totalSec =
        s.sleep_durations_data?.asleep?.duration_asleep_state_seconds ??
        (s.sleep_durations_data?.asleep?.duration_deep_sleep_state_seconds ??
          0) +
          (s.sleep_durations_data?.asleep?.duration_light_sleep_state_seconds ??
            0) +
          (s.sleep_durations_data?.asleep?.duration_REM_sleep_state_seconds ??
            0);

      return {
        date: dateStr,
        hours: +(totalSec / 3600).toFixed(2),
      };
    });
}
