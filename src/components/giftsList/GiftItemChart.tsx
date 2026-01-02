"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { GiftListItemInterface } from "@/interfaces/GiftListItemInterface";
import { useRef, useEffect, useState } from "react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface GiftItemChartProps {
  gift: GiftListItemInterface;
}

const GiftItemChart = ({ gift }: GiftItemChartProps) => {
  const chartRef = useRef<any>(null);
  const [gradient, setGradient] = useState<string | CanvasGradient>("");

  const chartDataPoints = gift.chartData || [];
  const labels = chartDataPoints.map((_, i) => (i + 1).toString());
  const values = chartDataPoints.map((point) => point.price);
  const priceChange =
    values.length > 0 ? values[values.length - 1] - values[0] : 0;
  const borderColor =
    priceChange >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)";

  // Hooks are safe here
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || chartDataPoints.length === 0) return;

    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    if (!chartArea) return;

    const grad = ctx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom
    );

    const topColor =
      priceChange >= 0 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)";
    const bottomColor =
      priceChange >= 0 ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)";

    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);

    setGradient(grad);
  }, [priceChange, chartDataPoints]);

  if (chartDataPoints.length === 0) return null;

  const data = {
    labels,
    datasets: [
      {
        label: gift.name,
        data: values,
        borderColor,
        borderWidth: 1.5,
        fill: true,
        backgroundColor: gradient,
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  return (
    <Line
      ref={chartRef}
      data={data}
      options={options}
      height={50}
      width={80}
      className='rounded-b-md'
    />
  );
};

export default GiftItemChart;
