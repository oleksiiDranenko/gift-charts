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

const GiftItemChart = () => {
  const labels = Array.from({ length: 48 }, (_, i) => (i + 1).toString());

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
        borderColor: "#22c55e",
        borderWidth: 2,
        fill: false, // remove area shading
        pointRadius: 0, // ❌ removes dots
        pointHoverRadius: 0, // ❌ removes hover dots
        tension: 0,
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

  return <Line data={data} options={options} height={40} width={80} />;
};

export default GiftItemChart;
