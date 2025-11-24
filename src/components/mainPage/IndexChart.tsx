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
import { IndexMonthDataInterface } from "@/interfaces/IndexMonthDataInterface";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface IndexChartProps {
  data: IndexMonthDataInterface[];
  currency: "ton" | "usd";
}

export default function IndexChart({ data, currency }: IndexChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  // const [activeIndex, setActiveIndex] = useState<number | null>(null);
  // const vibrate = useVibrate();

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
      percentChange >= 0 ? "rgba(34,197,94,1)" : "rgba(239,68,68,1)";
    const bottomColor =
      percentChange >= 0 ? "rgba(34,197,94,0)" : "rgba(239,68,68,0)";
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    setGradient(g);
  }, [percentChange, data, currency]);

  const chartData = {
    labels,
    datasets: [
      {
        label:
          currency === "usd" ? "Portfolio Value ($)" : "Portfolio Value (TON)",
        data: values,
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1.5,
        tension: 0.2,
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
    maintainAspectRatio: false, // optional — lets it fill container perfectly
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    interaction: {
      mode: undefined,
      intersect: false,
    },
    hover: { mode: undefined },
    events: [],
    layout: {
      padding: 0, // remove internal padding
    },
    scales: {
      x: {
        display: false, // completely remove x-axis visuals and space
      },
      y: {
        display: false, // completely remove y-axis visuals and space
      },
    },
  };

  return (
    <div className='relative' ref={chartContainerRef}>
      <Line
        ref={chartRef as any}
        data={chartData}
        options={options}
        className='w-full max-h-20'
      />
    </div>
  );
}
