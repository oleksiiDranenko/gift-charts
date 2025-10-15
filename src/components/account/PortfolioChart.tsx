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
import axios from "axios";
import { useQuery } from "react-query";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

export default function PortfolioChart() {
  const chartRef = useRef<ChartJS<"line">>(null);
  const { resolvedTheme } = useTheme();
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  async function fetchLifeData(name: string) {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_API}/lifeChart`,
      {
        params: { name },
      }
    );
    return data;
  }

  const {
    data: lifeList = [],
    isLoading: isLifeLoading,
    isError: isLifeError,
  } = useQuery<GiftLifeDataInterface[], Error>(
    ["lifeData", "Heart Locket"],
    () => fetchLifeData("Heart Locket")
  );

  // Extract chart data safely
  const labels = lifeList.map((item) => item.date.slice(0, 5));

  const values = lifeList.map((item) => item.priceUsd);

  // Filter numeric values for chart scaling
  const numericValues = values.filter((v): v is number => v !== null);

  // Calculate % change for color indication
  const percentChange =
    numericValues.length > 1
      ? ((numericValues[numericValues.length - 1] - numericValues[0]) /
          numericValues[0]) *
        100
      : 0;

  // 🎨 Create gradient dynamically when theme or chart area changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const { chartArea } = chart;
    if (!chartArea) return;

    const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    const topColor =
      percentChange >= 0 ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)";
    const bottomColor = "rgba(34, 197, 94, 0)";
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    setGradient(g);
  }, [resolvedTheme, percentChange, lifeList]);

  const data = {
    labels,
    datasets: [
      {
        label: "Portfolio Value ($)",
        data: values,
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1.5,
        tension: 0,
        pointRadius: 0,
        fill: true,
        backgroundColor:
          gradient ||
          (percentChange >= 0
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(239, 68, 68, 0.2)"),
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
          label: (tooltipItem) => `$${tooltipItem.raw}`,
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
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          maxTicksLimit: 3,
        },
      },
      y: {
        position: "right",
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
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

  if (isLifeLoading) return <div>Loading chart...</div>;
  if (isLifeError) return <div>Failed to load chart data.</div>;

  return (
    <div
      className={
        resolvedTheme === "dark"
          ? "relative"
          : "relative bg-secondaryTransparent rounded-xl p-4"
      }>
      <Line ref={chartRef as any} data={data} options={options} height={150} />
    </div>
  );
}
