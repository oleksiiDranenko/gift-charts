"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  ChartOptions,
  Filler,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface PropsInterface {
  list: (GiftLifeDataInterface | GiftWeekDataInterface)[];
  selectedPrice: "ton" | "usd" | "onSale";
  percentChange: number;
  listType: "24h" | "3d" | "1w" | "1m" | "3m" | "all";
}

export default function LineChart({
  list,
  selectedPrice,
  percentChange,
  listType,
}: PropsInterface) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const preventScroll = (e: TouchEvent) => {
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

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    const gradient = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );

    const topColor =
      percentChange >= 0 ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)";
    const bottomColor =
      percentChange >= 0 ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)";

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    setGradient(gradient);
  }, [percentChange]);

  const values = list.map((item) => {
    if (selectedPrice === "ton") return item.priceTon;
    if (selectedPrice === "usd") return item.priceUsd;
    return typeof item.amountOnSale === "number" ? item.amountOnSale : null;
  });

  const data = {
    labels: list.map((item) => {
      if ("time" in item && listType === "24h") {
        return item.time;
      }
      return item.date.slice(0, 5);
    }),
    datasets: [
      {
        label: selectedPrice === "onSale" ? "Amount On Sale" : "Gift Price",
        data: values,
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        backgroundColor:
          gradient ||
          (percentChange >= 0
            ? "rgba(34, 197, 94, 0.2)"
            : "rgba(239, 68, 68, 0.2)"),
        pointBackgroundColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        spanGaps: false,
      },
    ],
  };

  const numericValues = (data.datasets[0].data as (number | null)[]).filter(
    (v): v is number => v !== null
  );

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (tooltipItems) {
            const item = list[tooltipItems[0].dataIndex];
            if ("time" in item && (listType === "24h" || listType === "1w")) {
              return `${item.time} ${item.date}`;
            }
            return item.date;
          },
          label: function (tooltipItem) {
            if (selectedPrice === "onSale") {
              return tooltipItem.raw === null
                ? "No data"
                : `On Sale: ${tooltipItem.raw}`;
            }
            return `Price: ${tooltipItem.raw} ${
              selectedPrice === "ton" ? "TON" : "USD"
            }`;
          },
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
    scales: {
      x: {
        grid: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          padding: 0,
          autoSkip: true,
          maxTicksLimit: 3,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
          drawTicks: true,
          tickLength: 10,
        },
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          padding: 10,
        },
        position: "right",
        suggestedMax:
          numericValues.length > 0
            ? Math.max(...numericValues) * 1.1
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
          : "relative bg-secondaryTransparent rounded-xl"
      }
      ref={chartContainerRef}
    >
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
}