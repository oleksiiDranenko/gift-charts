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
import useVibrate from "@/hooks/useVibrate";

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
      percentChange >= 0 ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)";
    const bottomColor =
      percentChange >= 0 ? "rgba(34,197,94,0)" : "rgba(239,68,68,0)";
    g.addColorStop(0, topColor);
    g.addColorStop(1, bottomColor);
    setGradient(g);
  }, [resolvedTheme, percentChange, data, currency]);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const buttonContainer = chartContainer.querySelector(
      ".time-gap-buttons"
    ) as HTMLElement;

    const preventScroll = (e: TouchEvent) => {
      if (buttonContainer && buttonContainer.contains(e.target as Node)) {
        return;
      }
      e.preventDefault();
    };

    chartContainer.addEventListener("touchstart", preventScroll, {
      passive: false,
    });
    chartContainer.addEventListener("touchmove", preventScroll, {
      passive: false,
    });
    chartContainer.addEventListener("touchend", preventScroll, {
      passive: false,
    });

    const handleClickOutside = (e: MouseEvent) => {
      const chartCanvas = chartContainer.querySelector("canvas");
      if (chartCanvas && !chartCanvas.contains(e.target as Node)) {
        const chartInstance = ChartJS.getChart(chartCanvas);
        if (chartInstance) {
          chartInstance.setActiveElements([]);
          chartInstance.tooltip?.setActiveElements([], { x: 0, y: 0 });
          chartInstance.update();
        }
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      chartContainer.removeEventListener("touchstart", preventScroll);
      chartContainer.removeEventListener("touchmove", preventScroll);
      chartContainer.removeEventListener("touchend", preventScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
    maintainAspectRatio: false,
    // onHover: function (event, elements) {
    //   if (elements.length > 0) {
    //     const newIndex = elements[0].index;
    //     if (newIndex !== activeIndex) {
    //       setActiveIndex(newIndex);
    //       vibrate();
    //     }
    //   } else if (activeIndex !== null) {
    //     setActiveIndex(null);
    //   }
    // },
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
        external: function (context) {
          const { chart, tooltip } = context;
          const ctx = chart.ctx;

          if (!tooltip || !tooltip.opacity) {
            return;
          }

          const tooltipX = tooltip.caretX;
          const tooltipY = tooltip.caretY;

          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.lineWidth = 1;
          ctx.strokeStyle =
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(0, 0, 0, 0.5)";

          ctx.moveTo(tooltipX, chart.chartArea.top);
          ctx.lineTo(tooltipX, chart.chartArea.bottom);

          ctx.moveTo(chart.chartArea.left, tooltipY);
          ctx.lineTo(chart.chartArea.right, tooltipY);

          ctx.stroke();
          ctx.restore();
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
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
    <div
      className={
        resolvedTheme === "dark"
          ? "relative"
          : "relative bg-secondaryTransparent rounded-2xl p-4"
      }
      ref={chartContainerRef}>
      <Line
        ref={chartRef as any}
        data={chartData}
        options={options}
        height={150}
      />
    </div>
  );
}
