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

type Invoice = {
  amount: number;
  date: Date;
  type: "SENT" | "RECEIVED"; // sent = expense, received = income
};

const chartConfig = {
  income: {
    label: "Income",
    color: "var(--chart-1)",
  },
  expenses: {
    label: "Expenses",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function RevenueExpenseChart({ invoices }: { invoices: Invoice[] }) {
  const [range, setRange] = React.useState("6m");

  // Group invoices by month (fixed ordering)
  const monthlyData = React.useMemo(() => {
    const map = new Map<
      string,
      { month: string; display: string; income: number; expenses: number }
    >();

    invoices.forEach((inv) => {
      const date = inv.date;

      // normalized YYYY-MM key
      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const display = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });

      if (!map.has(key)) {
        map.set(key, { month: key, display, income: 0, expenses: 0 });
      }

      if (inv.type === "RECEIVED") map.get(key)!.income += inv.amount;
      if (inv.type === "SENT") map.get(key)!.expenses += inv.amount;
    });

    // sort by key (YYYY-MM)
    const sorted = Array.from(map.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    return sorted;
  }, [invoices]);

  // Range filtering
  const filteredData = React.useMemo(() => {
    if (range === "6m") return monthlyData.slice(-6);
    if (range === "3m") return monthlyData.slice(-3);
    if (range === "1m") return monthlyData.slice(-1);
    return monthlyData;
  }, [monthlyData, range]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Income & Expenses</CardTitle>
          <CardDescription>Monthly financial overview</CardDescription>
        </div>

        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="hidden w-40 rounded-lg sm:flex">
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
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-expenses)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-expenses)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="display"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={16}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={(v) => v} indicator="dot" />}
            />

            <Area
              dataKey="income"
              type="monotone"
              fill="url(#fillIncome)"
              stroke="var(--color-income)"
            />

            <Area
              dataKey="expenses"
              type="monotone"
              fill="url(#fillExpenses)"
              stroke="var(--color-expenses)"
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
