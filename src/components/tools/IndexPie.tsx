'use client'

import { useAppSelector } from '@/redux/hooks';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { ChartOptions } from 'chart.js';
import { useEffect } from 'react';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function IndexPie() {
  const giftsList = useAppSelector((state) => state.giftsList);

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const labels = giftsList.map((gift) => gift.name || gift._id);
  const values = giftsList.map((gift) => (gift.priceTon || 0) * (gift.supply || 0));
  const backgroundColors = labels.map(() => generateRandomColor());

  useEffect(() => {
    console.log(giftsList);
  }, []);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: backgroundColors,
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-800 bg-opacity-50 rounded-lg">
      <div className="w-full h-full p-6">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
  
}
