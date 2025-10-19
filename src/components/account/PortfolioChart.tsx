"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useTheme } from "next-themes";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface PortfolioChartProps {
  data: GiftWeekDataInterface[];
  currency: "ton" | "usd";
}

export default function PortfolioChart({
  data,
  currency,
}: PortfolioChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const { resolvedTheme } = useTheme();
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  // 🧩 Determine which value array to use based on currency
  const values =
    currency === "ton"
      ? data.map((item) => item.priceTon)
      : data.map((item) => item.priceUsd);

  const labels = data.map((item) => item.time);

  // Filter numeric values
  const numericValues = values.filter((v): v is number => v !== null);

  // 🧮 Calculate percent change (first vs last)
  const percentChange =
    numericValues.length > 1
      ? ((numericValues[numericValues.length - 1] - numericValues[0]) /
          numericValues[0]) *
        100
      : 0;

  // 🎨 Create gradient when theme, currency, or data changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const { chartArea } = chart;
    if (!chartArea) return;

    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    const topColor =
      percentChange >= 0 ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)";
    const bottomColor =
      percentChange >= 0 ? "rgba(34,197,94,0)" : "rgba(239,68,68,0)";
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    setGradient(g);
  }, [resolvedTheme, percentChange, data, currency]);

  const chartData = {
    labels,
    datasets: [
      {
        label:
          currency === "usd" ? "Portfolio Value ($)" : "Portfolio Value (TON)",
        data: values,
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1.5,
        tension: 0,
        pointRadius: 0,
        fill: true,
        backgroundColor:
          gradient ||
          (percentChange >= 0 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"),
        pointBackgroundColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: (tooltipItem) =>
            currency === "usd"
              ? `$${(tooltipItem.raw as number).toFixed(2)}`
              : `${(tooltipItem.raw as number).toFixed(2)} TON`,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        ticks: {
          display: false, // 👈 hides tick labels completely
        },
      },
      y: {
        position: "right",
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255,255,255,0.6)"
              : "rgba(0,0,0,0.6)",
          padding: 3,
        },
        suggestedMax:
          numericValues.length > 0
            ? Math.max(...numericValues) * 1.05
            : undefined,
        suggestedMin:
          numericValues.length > 0
            ? Math.min(...numericValues) * 0.9
            : undefined,
      },
    },
  };
  return (
    <div
      className={
        resolvedTheme === "dark"
          ? "relative"
          : "relative bg-secondaryTransparent rounded-xl p-4"
      }>
      <Line
        ref={chartRef as any}
        data={chartData}
        options={options}
        height={150}
      />
    </div>
  );
}
