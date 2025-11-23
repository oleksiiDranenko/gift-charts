import * as Slider from "@radix-ui/react-slider";
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useVibrate from "@/hooks/useVibrate";

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BUCKETS = 25;
const BUCKET_SIZE = 4;

export default function DoubleSliderWithChart() {
  const [values, setValues] = React.useState([0, 100]);
  const vibrate = useVibrate();

  // Replace with real data in production
  const rawData = React.useMemo(() => {
    return Array.from({ length: 1000 }, () => Math.floor(Math.random() * 101));
  }, []);

  const buckets = React.useMemo(() => {
    const counts = Array(BUCKETS).fill(0);
    rawData.forEach((val) => {
      const idx = Math.min(Math.floor(val / BUCKET_SIZE), BUCKETS - 1);
      counts[idx]++;
    });
    return counts;
  }, [rawData]);

  // Vibration: only when the set of highlighted bars changes
  const prevKeyRef = React.useRef("");

  React.useEffect(() => {
    const key = Array.from({ length: BUCKETS }, (_, i) => {
      const bucketMin = i * BUCKET_SIZE;
      const bucketMax = bucketMin + BUCKET_SIZE;
      const [min, max] = values;
      return bucketMax > min && bucketMin < max ? "1" : "0";
    }).join("");

    if (key !== prevKeyRef.current) {
      vibrate();
      prevKeyRef.current = key;
    }
  }, [values, vibrate]);

  // Bar colors – pure function of current range
  const backgroundColors = React.useMemo(() => {
    return buckets.map((_, i) => {
      const bucketMin = i * BUCKET_SIZE;
      const bucketMax = bucketMin + BUCKET_SIZE;
      const [min, max] = values;
      return bucketMax > min && bucketMin < max
        ? "rgb(59, 130, 246)"
        : "rgba(156, 163, 175, 0.25)";
    });
  }, [buckets, values]);

  const chartData = {
    labels: Array(BUCKETS).fill(""),
    datasets: [
      {
        data: buckets,
        backgroundColor: backgroundColors,
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.92,
        categoryPercentage: 0.95,
        // These prevent any hover/click visual feedback
        hoverBackgroundColor: backgroundColors,
        hoverBorderColor: backgroundColors,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 80 },
    events: [], // This disables ALL mouse/touch events (click, hover, etc.)
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false, grid: { display: false } },
      y: { display: false, grid: { display: false } },
    },
  };

  const handleChange = (newValues: number[]) => {
    let [a, b] = newValues.sort((x, y) => x - y);
    const minGap = 1;
    if (b - a < minGap) {
      if (a !== values[0]) a = b - minGap;
      else b = a + minGap;
    }
    setValues([a, b]);
  };

  const selectedCount = rawData.filter(
    (v) => v >= values[0] && v <= values[1]
  ).length;

  return (
    <div className='w-full'>
      {/* Pure visual histogram – no interaction */}
      <div className='h-32 mb-7'>
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Slider */}
      <div className='relative'>
        <Slider.Root
          value={values}
          onValueChange={handleChange}
          min={0}
          max={100}
          step={1}
          className='relative flex items-center select-none touch-none'>
          <Slider.Track className='bg-secondary relative grow h-[2px] rounded'>
            <Slider.Range className='absolute h-full bg-primary rounded' />
          </Slider.Track>
          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full shadow-md focus:outline-none' />
          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full shadow-md focus:outline-none' />
        </Slider.Root>
      </div>

      {/* Text */}
      <div className='mt-3 text-center'>
        <div className='text-2xl font-light'>
          <span className='font-bold'>{values[0]}</span>
          <span className='mx-2 text-secondaryText'>–</span>
          <span className='font-bold'>{values[1]}</span>
        </div>
        <div className='text-sm text-secondaryText mt-2'>
          {selectedCount} items selected
        </div>
      </div>
    </div>
  );
}
