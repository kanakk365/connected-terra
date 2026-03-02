// Terra API unified data types based on Terra's normalized data models
// Reference: https://docs.tryterra.co/reference/health-and-fitness-api/data-models

export interface TerraUser {
  user_id: string;
  provider: string;
  last_webhook_update: string | null;
  scopes: string | null;
  reference_id: string | null;
  active: boolean;
}

export interface DeviceData {
  activation_timestamp: string | null;
  hardware_version: string | null;
  software_version: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  name: string | null;
}

// ─── Daily ───────────────────────────────────────────────
export interface DailyData {
  metadata: {
    start_time: string;
    end_time: string;
    upload_type: number;
  };
  device_data?: DeviceData;
  distance_data?: {
    steps?: number;
    distance_meters?: number;
    floors_climbed?: number;
    elevation?: {
      gain_actual_meters?: number;
    };
  };
  calories_data?: {
    total_burned_calories?: number;
    net_activity_calories?: number;
    BMR_calories?: number;
  };
  heart_rate_data?: {
    summary?: {
      avg_hr_bpm?: number;
      max_hr_bpm?: number;
      min_hr_bpm?: number;
      resting_hr_bpm?: number;
      avg_hrv_rmssd?: number;
      avg_hrv_sdnn?: number;
    };
  };
  active_durations_data?: {
    activity_seconds?: number;
    low_intensity_seconds?: number;
    moderate_intensity_seconds?: number;
    vigorous_intensity_seconds?: number;
    rest_seconds?: number;
  };
  oxygen_data?: {
    avg_saturation_percentage?: number;
    vo2max_ml_per_min_per_kg?: number;
  };
  scores?: {
    activity?: number;
    recovery?: number;
    sleep?: number;
  };
  stress_data?: {
    avg_stress_level?: number;
    max_stress_level?: number;
  };
}

// ─── Sleep ───────────────────────────────────────────────
export interface SleepData {
  metadata: {
    start_time: string;
    end_time: string;
    summary_id?: string;
    is_nap?: boolean;
    upload_type: number;
  };
  device_data?: DeviceData;
  sleep_durations_data?: {
    asleep?: {
      duration_asleep_state_seconds?: number;
      duration_deep_sleep_state_seconds?: number;
      duration_light_sleep_state_seconds?: number;
      duration_REM_sleep_state_seconds?: number;
      num_REM_events?: number;
    };
    awake?: {
      duration_awake_state_seconds?: number;
      num_wakeup_events?: number;
      sleep_latency_seconds?: number;
    };
    sleep_efficiency?: number;
    other?: {
      duration_in_bed_seconds?: number;
    };
  };
  heart_rate_data?: {
    summary?: {
      avg_hr_bpm?: number;
      min_hr_bpm?: number;
      max_hr_bpm?: number;
      resting_hr_bpm?: number;
    };
  };
  scores?: {
    sleep?: number;
  };
  temperature_data?: {
    delta?: number;
  };
}

// ─── Body ────────────────────────────────────────────────
export interface BodyData {
  metadata: {
    start_time: string;
    end_time: string;
  };
  device_data?: DeviceData;
  measurements_data?: {
    measurements?: Array<{
      measurement_time?: string;
      BMI?: number;
      weight_kg?: number;
      height_cm?: number;
      body_fat_percentage?: number;
      bone_mass_g?: number;
      muscle_mass_g?: number;
    }>;
  };
  heart_data?: {
    heart_rate_data?: {
      summary?: {
        resting_hr_bpm?: number;
      };
    };
  };
  oxygen_data?: {
    avg_saturation_percentage?: number;
  };
  temperature_data?: {
    body_temperature_samples?: Array<{
      timestamp?: string;
      temperature_celsius?: number;
    }>;
  };
  glucose_data?: {
    day_avg_blood_glucose_mg_per_dL?: number;
  };
}

// ─── Activity ────────────────────────────────────────────
export interface ActivityData {
  metadata: {
    start_time: string;
    end_time: string;
    name?: string;
    type?: number;
    summary_id?: string;
  };
  device_data?: DeviceData;
  distance_data?: {
    summary?: {
      distance_meters?: number;
      steps?: number;
    };
  };
  calories_data?: {
    total_burned_calories?: number;
    net_activity_calories?: number;
  };
  heart_rate_data?: {
    summary?: {
      avg_hr_bpm?: number;
      max_hr_bpm?: number;
    };
  };
  movement_data?: {
    avg_speed_meters_per_second?: number;
    max_speed_meters_per_second?: number;
    avg_pace_minutes_per_kilometer?: number;
  };
}

// ─── Parsed data for frontend ────────────────────────────
export interface ParsedMetrics {
  calories: number | null;
  steps: number | null;
  sleepHours: number | null;
  heartRate: number | null;
  weight: number | null;
  spo2: number | null;
  temperature: number | null;
  distance: number | null;
}

export interface ParsedSleepBreakdown {
  deepHours: number;
  lightHours: number;
  remHours: number;
  awakeHours: number;
  totalHours: number;
  efficiency: number | null;
  sleepScore: number | null;
}

export interface ParsedDailyEntry {
  date: string;
  steps: number;
  calories: number;
  distance: number;
  heartRate: number | null;
  activeMinutes: number;
  spo2: number | null;
}

export interface ConnectedDevice {
  userId: string;
  provider: string;
  active: boolean;
  referenceId: string | null;
  lastWebhookUpdate: string | null;
}
