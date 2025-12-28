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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

interface Props {
  percentChange: number | "no data";
}

const GiftItemChart = ({ percentChange }: Props) => {
  const labels = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  // generate 48 random data points
  const values = Array.from(
    { length: 48 },
    () => Math.floor(Math.random() * 50) + 10
  );
  const data = {
    labels,
    datasets: [
      {
        label: "",
        data: values,
        borderColor:
          percentChange !== "no data"
            ? percentChange >= 0
              ? "#22c55e"
              : percentChange < 0
              ? "#ef4444"
              : "#64748b"
            : "#64748b",
        borderWidth: 2,
        fill: false, // remove area shading
        pointRadius: 0, // ❌ removes dots
        pointHoverRadius: 0, // ❌ removes hover dots
        tension: 0.2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false }, // ❌ no legend
      title: { display: false }, // ❌ no title
      tooltip: { enabled: false }, // ❌ no tooltip
    },
    scales: {
      x: { display: false }, // hide X axis
      y: { display: false }, // hide Y axis
    },
  };

  return <Line data={data} options={options} height={80} width={80} />;
};

export default GiftItemChart;
