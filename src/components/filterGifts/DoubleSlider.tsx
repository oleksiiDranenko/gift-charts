// components/DoubleSlider.tsx
import * as Slider from "@radix-ui/react-slider";
import React from "react";
import { Bar } from "react-chartjs-2";
import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BUCKETS = 25;

interface DoubleSliderProps {
  gifts: GiftInterface[];
}

export default function DoubleSlider({ gifts }: DoubleSliderProps) {
  const vibrate = useVibrate();

  const validPrices = React.useMemo(() => {
    return gifts
      .map((g) => g.priceTon)
      .filter((p): p is number => typeof p === "number" && !isNaN(p) && p >= 0)
      .sort((a, b) => a - b);
  }, [gifts]);

  if (validPrices.length === 0) {
    return (
      <div className='w-full text-center py-8 text-secondaryText'>
        No price data available
      </div>
    );
  }

  const maxPrice = validPrices[validPrices.length - 1]; // e.g. 5000
  const CHEAP_THRESHOLD = 60; // 0–60 TON = "cheap"
  const CHEAP_PORTION = 0.85; // 85% of slider for cheap gifts

  // Non-linear normalization: stretch cheap, compress expensive
  const normalize = (price: number): number => {
    if (price <= CHEAP_THRESHOLD) {
      return (price / CHEAP_THRESHOLD) * (CHEAP_PORTION * 100);
    }
    const progress = (price - CHEAP_THRESHOLD) / (maxPrice - CHEAP_THRESHOLD);
    const compressed = Math.sqrt(progress) * (1 - CHEAP_PORTION) * 100;
    return CHEAP_PORTION * 100 + compressed;
  };

  const denormalize = (norm: number): number => {
    if (norm <= CHEAP_PORTION * 100) {
      return (norm / (CHEAP_PORTION * 100)) * CHEAP_THRESHOLD;
    }
    const progress = (norm - CHEAP_PORTION * 100) / ((1 - CHEAP_PORTION) * 100);
    const expanded = progress * progress; // inverse of sqrt
    return CHEAP_THRESHOLD + expanded * (maxPrice - CHEAP_THRESHOLD);
  };

  // Default: show most common range (0 to ~100 TON)
  const defaultMaxNorm = normalize(Math.min(100, maxPrice));
  const [normalizedValues, setNormalizedValues] = React.useState<
    [number, number]
  >([0, defaultMaxNorm]);

  const [minValue, maxValue] = React.useMemo(() => {
    return [
      Number(denormalize(normalizedValues[0]).toFixed(3)),
      Number(denormalize(normalizedValues[1]).toFixed(3)),
    ] as const;
  }, [normalizedValues]);

  // Histogram buckets
  const buckets = React.useMemo(() => {
    const counts = Array(BUCKETS).fill(0);
    validPrices.forEach((price) => {
      const norm = normalize(price);
      const idx = Math.min(Math.floor((norm / 100) * BUCKETS), BUCKETS - 1);
      counts[idx]++;
    });
    return counts;
  }, [validPrices]);

  // Vibration on bucket change
  const prevKeyRef = React.useRef("");
  React.useEffect(() => {
    const key = buckets
      .map((_, i) => {
        const start = (i / BUCKETS) * 100;
        const end = ((i + 1) / BUCKETS) * 100;
        const [nMin, nMax] = normalizedValues;
        return end > nMin && start < nMax ? "1" : "0";
      })
      .join("");

    if (key !== prevKeyRef.current) {
      vibrate();
      prevKeyRef.current = key;
    }
  }, [normalizedValues, buckets, vibrate]);

  // Bar colors
  const backgroundColors = buckets.map((_, i) => {
    const start = (i / BUCKETS) * 100;
    const end = ((i + 1) / BUCKETS) * 100;
    const [nMin, nMax] = normalizedValues;
    return end > nMin && start < nMax
      ? "rgb(59, 130, 246)"
      : "rgba(156, 163, 175, 0.25)";
  });

  const chartData = {
    labels: Array(BUCKETS).fill(""),
    datasets: [
      {
        data: buckets,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors,
        borderWidth: 0,
        borderRadius: 4,
        barPercentage: 0.92,
        categoryPercentage: 0.95,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 80 },
    events: [],
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  const handleChange = (newValues: number[]) => {
    let [a, b] = newValues.sort((x, y) => x - y);
    const minGap = 0.8;
    if (b - a < minGap) {
      if (a !== normalizedValues[0]) a = b - minGap;
      else b = a + minGap;
    }
    setNormalizedValues([a, b]);
  };

  const selectedCount = validPrices.filter(
    (p) => p >= minValue && p <= maxValue
  ).length;

  return (
    <div className='w-full'>
      <div className='h-32 mb-7'>
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className='relative'>
        <Slider.Root
          value={normalizedValues}
          onValueChange={handleChange}
          min={0}
          max={100}
          step={0.1}
          className='relative flex items-center select-none touch-none'>
          <Slider.Track className='bg-secondary relative grow h-[2px] rounded'>
            <Slider.Range className='absolute h-full bg-primary rounded' />
          </Slider.Track>
          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full shadow-md focus:outline-none' />
          <Slider.Thumb className='block w-5 h-5 bg-primary rounded-full shadow-md focus:outline-none' />
        </Slider.Root>
      </div>

      <div className='mt-3 text-center'>
        <div className='text-2xl font-light'>
          <span className='font-bold'>{minValue}</span>
          <span className='mx-2 text-secondaryText'>–</span>
          <span className='font-bold'>{maxValue}</span>
          <span className='text-sm text-secondaryText ml-1'>TON</span>
        </div>
        <div className='text-sm text-secondaryText mt-2'>
          {selectedCount} items selected
          {maxValue > CHEAP_THRESHOLD && (
            <span className='block text-xs mt-1 opacity-70'>
              (expensive items compressed)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
