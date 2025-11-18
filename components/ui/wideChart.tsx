"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "Revenue by month chart";

// Accepts simple: month + revenue
const chartData = [
  { month: "Jan", revenue: 1200 },
  { month: "Feb", revenue: 980 },
  { month: "Mar", revenue: 1430 },
  { month: "Apr", revenue: 1730 },
  { month: "May", revenue: 1920 },
  { month: "Jun", revenue: 1650 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const [range, setRange] = React.useState("6m");

  const filteredData = React.useMemo(() => {
    if (range === "6m") return chartData;
    if (range === "3m") return chartData.slice(-3);
    if (range === "1m") return chartData.slice(-1);
    return chartData;
  }, [range]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Monthly Revenue</CardTitle>
          <CardDescription>Revenue visualization by month</CardDescription>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="hidden w-40 rounded-lg sm:flex" aria-label="Select range">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="6m">Last 6 months</SelectItem>
            <SelectItem value="3m">Last 3 months</SelectItem>
            <SelectItem value="1m">Last month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="revenue"
              type="natural"
              fill="url(#fillRevenue)"
              stroke="var(--color-revenue)"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
