"use client";

import { Pie, PieChart, Cell } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A sleep data donut chart";

const chartConfig = {
  deepSleep: {
    label: "Deep Sleep",
    color: "#6366f1",
  },
  lightSleep: {
    label: "Light Sleep",
    color: "#ec4899",
  },
  remSleep: {
    label: "REM Sleep",
    color: "#8b5cf6",
  },
  awake: {
    label: "Awake",
    color: "#a78bfa",
  },
} satisfies ChartConfig;

type SleepSlice = { name: string; value: number; fill: string };

export function ChartPieDonut({ data }: { data?: SleepSlice[] }) {
  const used = data && data.length ? data : [];
  const totalSleep = used.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-start pb-4">
        <CardTitle>Sleep</CardTitle>
        <CardDescription>Last night&#39;s sleep breakdown</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <div className="flex-1 h-full">
            <ChartContainer
              config={chartConfig}
              className="w-full h-full aspect-square"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={used}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={100}
                  outerRadius={140}
                  cx="50%"
                  cy="50%"
                >
                  {used.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-semibold"
                    fill="white"
                  >
                    {totalSleep.toFixed(1)}hr
                  </text>
                </Pie>
              </PieChart>
            </ChartContainer>
          </div>

          {/* Legend on the right */}
          <div className="flex flex-row w-[40%] lg:flex-col justify-start lg:justify-center flex-wrap gap-4 lg:gap-6 ">
            {used.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-2 lg:gap-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div>
                    <p className="text-xs lg:text-sm font-medium text-gray-200 whitespace-nowrap">
                      {item.name}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{item.value}hrs</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
