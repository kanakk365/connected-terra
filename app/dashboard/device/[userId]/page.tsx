"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import Layout from "@/components/layout";
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

export default function DevicePage() {
  const params = useParams();
  const userId = params.userId as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<ConnectedDevice | null>(null);

  // Metric cards
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

  // Chart data
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

  useEffect(() => {
    if (!userId) return;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch device info
        const usersRes = await fetch("/api/terra/users");
        const usersJson = await usersRes.json();
        const users = usersJson.users || [];
        const found = users.find((u: any) => u.user_id === userId);
        if (found) {
          setDevice({
            userId: found.user_id,
            provider: found.provider,
            active: found.active,
            referenceId: found.reference_id,
            lastWebhookUpdate: found.last_webhook_update,
          });
        }

        // 2. Fetch daily, sleep, body data from Terra REST API
        const [dailyRes, sleepRes, bodyRes] = await Promise.all([
          fetch(`/api/terra/data?user_id=${userId}&type=daily`),
          fetch(`/api/terra/data?user_id=${userId}&type=sleep`),
          fetch(`/api/terra/data?user_id=${userId}&type=body`),
        ]);

        const dailyJson = await dailyRes.json();
        const sleepJson = await sleepRes.json();
        const bodyJson = await bodyRes.json();

        const dailyArr: DailyData[] = dailyJson.data || [];
        const sleepArr: SleepData[] = sleepJson.data || [];
        const bodyArr: BodyData[] = bodyJson.data || [];

        // 3. Parse top-level metrics
        const dailyMetrics = parseDailyMetrics(dailyArr);
        const sleepBreakdown = parseSleepBreakdown(sleepArr);
        const bodyMetricsParsed = parseBodyMetrics(bodyArr);

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

        // 4. Parse chart data
        const dailyTimeSeries = parseDailyTimeSeries(dailyArr);
        const sleepTimeSeries = parseSleepTimeSeries(sleepArr);

        // Weekly steps (bar chart)
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        setWeeklySteps(
          dailyTimeSeries.map((d) => ({
            day: days[new Date(d.date).getDay()] || d.date,
            steps: d.steps,
          })),
        );

        // Sleep donut
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

        // Heart rate line chart
        setHeartRateData(
          dailyTimeSeries
            .filter((d) => d.heartRate !== null)
            .map((d) => ({ date: d.date, heartRate: d.heartRate! })),
        );

        // Calories bar chart
        setCaloriesData(
          dailyTimeSeries.map((d) => ({ date: d.date, calories: d.calories })),
        );

        // Distance line chart
        setDistanceData(
          dailyTimeSeries.map((d) => ({ date: d.date, distance: d.distance })),
        );

        // Active zone minutes
        setActiveZoneMinutesData(
          dailyTimeSeries.map((d) => ({
            date: d.date,
            minutes: d.activeMinutes,
          })),
        );

        // SpO2
        setSpo2Data(
          dailyTimeSeries
            .filter((d) => d.spo2 !== null)
            .map((d) => ({ date: d.date, spo2: d.spo2! })),
        );

        // Sleep duration bar chart
        setSleepData(sleepTimeSeries);

        // Body metrics (weight, bmi, bodyFat) from body data
        if (bodyArr.length > 0) {
          const bm = bodyArr
            .map((b) => {
              const m = b.measurements_data?.measurements?.[0];
              if (!m) return null;
              const date = new Date(b.metadata.start_time).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric" },
              );
              return {
                date,
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
        console.error("Error fetching device data:", err);
        setError(err.message || "Failed to load device data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h2 className="text-2xl font-bold text-foreground mt-1">
              {device ? `${device.provider} Device` : "Device Details"}
            </h2>
            {device && (
              <p className="text-sm text-muted-foreground">
                User ID: {device.userId} • Status:{" "}
                {device.active ? "Active" : "Inactive"}
                {device.lastWebhookUpdate &&
                  ` • Last update: ${new Date(device.lastWebhookUpdate).toLocaleString()}`}
              </p>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-muted-foreground">
              Loading data from Terra...
            </div>
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
                      <p className="text-sm font-medium text-white/70">
                        {title}
                      </p>
                      <p className="mt-3 text-3xl font-semibold leading-none">
                        {value}
                      </p>
                      <p className="text-xs font-medium text-white/60">
                        {unit}
                      </p>
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
    </Layout>
  );
}
