"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ChartBarDefault } from "@/components/ui/bar-chart";
import { ChartPieDonut } from "@/components/ui/pie-chart";
import { HeartRateLineChart } from "@/components/ui/heart-rate-line-chart";
import { WeightLineChart } from "@/components/ui/weight-line-chart";
import { SleepDurationBarChart } from "@/components/ui/sleep-duration-bar-chart";
import { CaloriesBarChart } from "@/components/ui/calories-bar-chart";
import { DistanceLineChart } from "@/components/ui/distance-line-chart";
import { ActiveZoneMinutesBarChart } from "@/components/ui/active-zone-minutes-bar-chart";
import { SpO2LineChart } from "@/components/ui/spo2-line-chart";
import { BodyMetricsLineChart } from "@/components/ui/body-metrics-line-chart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import type {
  DailyData,
  SleepData,
  BodyData,
  ConnectedDevice,
} from "@/lib/terra/types";
import {
  parseDailyMetrics,
  parseSleepBreakdown,
  parseBodyMetrics,
  parseDailyTimeSeries,
  parseSleepTimeSeries,
} from "@/lib/terra/parse";

type MetricCard = {
  title: string;
  value: string;
  unit: string;
  image: string;
  color: string;
};

export default function HealthCharts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);

  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: "Calories",
      value: "—",
      unit: "Kcal",
      image: "/calories.png",
      color: "#dc767c",
    },
    {
      title: "Step Count",
      value: "—",
      unit: "Steps",
      image: "/step.png",
      color: "#547aff",
    },
    {
      title: "Sleep",
      value: "—",
      unit: "Hours",
      image: "/sleep.png",
      color: "#6f73e2",
    },
    {
      title: "Heart Rate",
      value: "—",
      unit: "BPM",
      image: "/heart.png",
      color: "#9161ff",
    },
    {
      title: "Weight",
      value: "—",
      unit: "kg",
      image: "/heart.png",
      color: "#6366f1",
    },
    {
      title: "SpO2",
      value: "—",
      unit: "%",
      image: "/heart.png",
      color: "#06b6d4",
    },
    {
      title: "Temperature",
      value: "—",
      unit: "°C",
      image: "/heart.png",
      color: "#ec4899",
    },
    {
      title: "Distance",
      value: "—",
      unit: "km",
      image: "/step.png",
      color: "#8b5cf6",
    },
  ]);

  const [weeklySteps, setWeeklySteps] = useState<
    Array<{ day: string; steps: number }>
  >([]);
  const [sleepDonut, setSleepDonut] = useState<
    Array<{ name: string; value: number; fill: string }>
  >([]);
  const [heartRateData, setHeartRateData] = useState<
    Array<{ date: string; heartRate: number }>
  >([]);
  const [weightData, setWeightData] = useState<
    Array<{ date: string; weight: number }>
  >([]);
  const [sleepData, setSleepData] = useState<
    Array<{ date: string; hours: number }>
  >([]);
  const [caloriesData, setCaloriesData] = useState<
    Array<{ date: string; calories: number }>
  >([]);
  const [distanceData, setDistanceData] = useState<
    Array<{ date: string; distance: number }>
  >([]);
  const [activeZoneMinutesData, setActiveZoneMinutesData] = useState<
    Array<{ date: string; minutes: number }>
  >([]);
  const [spo2Data, setSpo2Data] = useState<
    Array<{ date: string; spo2: number }>
  >([]);
  const [bodyMetricsData, setBodyMetricsData] = useState<
    Array<{ date: string; weight?: number; bmi?: number; bodyFat?: number }>
  >([]);

  const onConnectTerra = async () => {
    try {
      setError(null);
      const res = await fetch("/api/terra/generate-widget", { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate widget session");
      const data = await res.json();
      if (data.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("No URL returned from Terra widget");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  // Fetch all connected devices and their data
  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch all connected Terra users (devices)
        const usersRes = await fetch("/api/terra/users");
        const usersJson = await usersRes.json();
        const users: any[] = usersJson.users || [];

        const connectedDevices: ConnectedDevice[] = users.map((u) => ({
          userId: u.user_id,
          provider: u.provider,
          active: u.active,
          referenceId: u.reference_id,
          lastWebhookUpdate: u.last_webhook_update,
        }));
        setDevices(connectedDevices);

        if (connectedDevices.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Fetch data from all devices and aggregate
        let allDaily: DailyData[] = [];
        let allSleep: SleepData[] = [];
        let allBody: BodyData[] = [];

        await Promise.all(
          connectedDevices.map(async (device) => {
            try {
              const [dailyRes, sleepRes, bodyRes] = await Promise.all([
                fetch(`/api/terra/data?user_id=${device.userId}&type=daily`),
                fetch(`/api/terra/data?user_id=${device.userId}&type=sleep`),
                fetch(`/api/terra/data?user_id=${device.userId}&type=body`),
              ]);

              const dailyJson = await dailyRes.json();
              const sleepJson = await sleepRes.json();
              const bodyJson = await bodyRes.json();

              if (dailyJson.data) allDaily = [...allDaily, ...dailyJson.data];
              if (sleepJson.data) allSleep = [...allSleep, ...sleepJson.data];
              if (bodyJson.data) allBody = [...allBody, ...bodyJson.data];
            } catch (e) {
              console.warn(
                `Failed to fetch data for device ${device.provider}:`,
                e,
              );
            }
          }),
        );

        // Sort by date
        allDaily.sort(
          (a, b) =>
            new Date(a.metadata.start_time).getTime() -
            new Date(b.metadata.start_time).getTime(),
        );
        allSleep.sort(
          (a, b) =>
            new Date(a.metadata.start_time).getTime() -
            new Date(b.metadata.start_time).getTime(),
        );

        // 3. Parse aggregated metrics
        const dailyMetrics = parseDailyMetrics(allDaily);
        const sleepBreakdown = parseSleepBreakdown(allSleep);
        const bodyMetricsParsed = parseBodyMetrics(allBody);

        setMetrics([
          {
            title: "Calories",
            value: dailyMetrics.calories?.toLocaleString() ?? "—",
            unit: "Kcal",
            image: "/calories.png",
            color: "#dc767c",
          },
          {
            title: "Step Count",
            value: dailyMetrics.steps?.toLocaleString() ?? "—",
            unit: "Steps",
            image: "/step.png",
            color: "#547aff",
          },
          {
            title: "Sleep",
            value:
              sleepBreakdown.totalHours > 0
                ? sleepBreakdown.totalHours.toFixed(1)
                : "—",
            unit: "Hours",
            image: "/sleep.png",
            color: "#6f73e2",
          },
          {
            title: "Heart Rate",
            value: dailyMetrics.heartRate?.toString() ?? "—",
            unit: "BPM",
            image: "/heart.png",
            color: "#9161ff",
          },
          {
            title: "Weight",
            value: bodyMetricsParsed.weight?.toFixed(1) ?? "—",
            unit: "kg",
            image: "/heart.png",
            color: "#6366f1",
          },
          {
            title: "SpO2",
            value: dailyMetrics.spo2?.toFixed(1) ?? "—",
            unit: "%",
            image: "/heart.png",
            color: "#06b6d4",
          },
          {
            title: "Temperature",
            value: bodyMetricsParsed.temperature?.toFixed(1) ?? "—",
            unit: "°C",
            image: "/heart.png",
            color: "#ec4899",
          },
          {
            title: "Distance",
            value: dailyMetrics.distance?.toFixed(2) ?? "—",
            unit: "km",
            image: "/step.png",
            color: "#8b5cf6",
          },
        ]);

        // 4. Parse chart time series
        const dailyTimeSeries = parseDailyTimeSeries(allDaily);
        const sleepTimeSeries = parseSleepTimeSeries(allSleep);

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        setWeeklySteps(
          dailyTimeSeries.map((d) => ({
            day: days[new Date(d.date).getDay()] || d.date,
            steps: d.steps,
          })),
        );
        setSleepDonut([
          {
            name: "Deep Sleep",
            value: sleepBreakdown.deepHours,
            fill: "#6366f1",
          },
          {
            name: "Light Sleep",
            value: sleepBreakdown.lightHours,
            fill: "#ec4899",
          },
          {
            name: "REM Sleep",
            value: sleepBreakdown.remHours,
            fill: "#8b5cf6",
          },
          { name: "Awake", value: sleepBreakdown.awakeHours, fill: "#a78bfa" },
        ]);
        setHeartRateData(
          dailyTimeSeries
            .filter((d) => d.heartRate !== null)
            .map((d) => ({ date: d.date, heartRate: d.heartRate! })),
        );
        setCaloriesData(
          dailyTimeSeries.map((d) => ({ date: d.date, calories: d.calories })),
        );
        setDistanceData(
          dailyTimeSeries.map((d) => ({ date: d.date, distance: d.distance })),
        );
        setActiveZoneMinutesData(
          dailyTimeSeries.map((d) => ({
            date: d.date,
            minutes: d.activeMinutes,
          })),
        );
        setSpo2Data(
          dailyTimeSeries
            .filter((d) => d.spo2 !== null)
            .map((d) => ({ date: d.date, spo2: d.spo2! })),
        );
        setSleepData(sleepTimeSeries);

        if (allBody.length > 0) {
          const bm = allBody
            .map((b) => {
              const m = b.measurements_data?.measurements?.[0];
              if (!m) return null;
              return {
                date: new Date(b.metadata.start_time).toLocaleDateString(
                  undefined,
                  { month: "short", day: "numeric" },
                ),
                weight: m.weight_kg,
                bmi: m.BMI,
                bodyFat: m.body_fat_percentage,
              };
            })
            .filter(Boolean) as Array<{
            date: string;
            weight?: number;
            bmi?: number;
            bodyFat?: number;
          }>;
          setBodyMetricsData(bm);
          setWeightData(
            bm
              .filter((b) => b.weight)
              .map((b) => ({ date: b.date, weight: b.weight! })),
          );
        }
      } catch (err: any) {
        console.error("Error fetching Terra data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, []);

  // Handle redirect from Terra widget
  useEffect(() => {
    const status = searchParams.get("terra_status");
    if (status === "success") {
      router.replace("/dashboard");
    } else if (status === "failure") {
      setError("Device connection failed. Please try again.");
      router.replace("/dashboard");
    }
  }, [searchParams, router]);

  return (
    <div className="space-y-6">
      {/* Connect Device Banner */}
      <div className="flex items-center justify-between rounded-md border p-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {devices.length > 0
              ? `${devices.length} device(s) connected via Terra`
              : "Connect your wearable device using Terra."}
          </p>
        </div>
        <button
          onClick={onConnectTerra}
          className="inline-flex items-center rounded bg-blue-600 px-3 py-2 text-white text-sm hover:bg-blue-700 transition-colors"
        >
          {devices.length > 0 ? "Connect Another Device" : "Connect Device"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Connected Devices List */}
      {devices.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Connected Devices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {devices.map((d) => (
              <Link
                key={d.userId}
                href={`/dashboard/device/${d.userId}`}
                className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors"
              >
                <div
                  className={`w-2 h-2 rounded-full ${d.active ? "bg-green-500" : "bg-red-500"}`}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {d.provider}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to view details →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading data from Terra...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {metrics.map(({ title, value, unit, image, color }) => (
              <Card
                key={title}
                className="relative overflow-hidden border-0 p-0 text-white"
                style={{ backgroundColor: color }}
              >
                <CardContent className="relative flex h-full flex-col justify-center p-6">
                  <div>
                    <p className="text-sm font-medium text-white/70">{title}</p>
                    <p className="mt-3 text-3xl font-semibold leading-none">
                      {value}
                    </p>
                    <p className="text-xs font-medium text-white/60">{unit}</p>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <Image
                      src={image}
                      alt={title}
                      width={
                        title === "Sleep" || title === "Heart Rate" ? 60 : 40
                      }
                      height={
                        title === "Sleep" || title === "Heart Rate" ? 60 : 40
                      }
                      className="object-contain"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <ChartBarDefault data={weeklySteps} />
              <ChartPieDonut data={sleepDonut} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <HeartRateLineChart data={heartRateData} />
              <WeightLineChart data={weightData} />
              <SpO2LineChart data={spo2Data} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <SleepDurationBarChart data={sleepData} />
              <CaloriesBarChart data={caloriesData} />
              <DistanceLineChart data={distanceData} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ActiveZoneMinutesBarChart data={activeZoneMinutesData} />
              <BodyMetricsLineChart data={bodyMetricsData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
