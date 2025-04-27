'use client'

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
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useEffect, useRef, useState } from "react";
import useVibrate from "@/hooks/useVibrate";

ChartJS.register(LineElement, PointElement, LinearScale, Tooltip, CategoryScale, Filler);

interface PropsInterface {
    gifts: GiftInterface[] | null;
    weekData: (GiftWeekDataInterface[])[];
    lifeData: (GiftLifeDataInterface[])[];
    isInfoHidden: boolean
}

interface DatasetInterface {
  label: string;
  data: (number | null)[];
  borderColor: string;
  borderWidth: number;
  tension: number;
  pointRadius: number;
  pointHoverRadius: number;
  fill: boolean;
  pointBackgroundColor: string;
  backgroundColor: string | CanvasGradient;
}

export default function CompareCharts({ gifts, weekData, lifeData, isInfoHidden }: PropsInterface) {
  const vibrate = useVibrate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);

  const [selectedPrice, setSelectedPrice] = useState<'ton' | 'usd'>('ton');
  const [listType, setListType] = useState<'1m' | 'all'>('1m');
  const [list, setList] = useState<(GiftLifeDataInterface[] | GiftWeekDataInterface[])[]>([]);
  const [datasets, setDatasets] = useState<DatasetInterface[]>([]);

  // Prevent scroll when interacting with chart
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    chartContainer.addEventListener("touchstart", preventScroll, { passive: false });
    chartContainer.addEventListener("touchmove", preventScroll, { passive: false });
    chartContainer.addEventListener("touchend", preventScroll, { passive: false });

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

  // Update list based on listType
  useEffect(() => {
    console.log("weekData:", weekData);
    console.log("lifeData:", lifeData);
    console.log("gifts:", gifts);
  
    if (!weekData.length && !lifeData.length) {
      setList([]);
      return;
    }
  
    let newList: (GiftLifeDataInterface[] | GiftWeekDataInterface[])[] = [];
    switch (listType) {
      case '1m':
        newList = lifeData.map((data, index) => [...data.slice(-30), ...(weekData[index]?.slice(-1) || [])]);
        break;
      case 'all':
        newList = lifeData.map((data, index) => [...data, ...(weekData[index]?.slice(-1) || [])]);
        break;
    }
  
    // Find the longest dataset length
    const maxLength = Math.max(...newList.map(data => data.length));
  
    // Pad shorter datasets with null at the beginning to align ends
    newList = newList.map(data => {
      const paddingLength = maxLength - data.length;
      const padding = Array(paddingLength).fill(null); // Create padding array
      return [...padding, ...data]; // Prepend padding to align the end
    });
  
    console.log("newList:", newList);
    setList(newList);
  }, [listType, weekData, lifeData]);

  // Update datasets based on list and selectedPrice
  useEffect(() => {
    console.log("list:", list);
    console.log("gifts:", gifts);
  
    if (!list.length || !gifts?.length) {
      setDatasets([]);
      return;
    }
  
    const colors = [
      "#22c55e", // Green
      "#0098EA", // Blue
      "#f43f5e", // Rose
      "#d946ef", // Fuchsia
      "#f59e0b", // Amber
    ];
  
    const newDatasets: DatasetInterface[] = list.map((data, index) => {
      const color = colors[index % colors.length];
      let backgroundColor: string | CanvasGradient = `${color}20`; // Fallback to original plain color
  
      // Create gradient if chart is initialized
      if (chartRef.current) {
        const chart = chartRef.current;
        const ctx = chart.ctx;
        const chartArea = chart.chartArea;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, `${color}80`); // Start with 50% opacity
        gradient.addColorStop(1, `${color}00`); // End with 0% opacity
        backgroundColor = gradient;
      }
  
      return {
        label: gifts[index]?.name || `Gift ${index + 1}`,
        data: data.map((item: any) =>
          item === null ? null : parseFloat((selectedPrice === 'ton' ? item.priceTon : item.priceUsd).toFixed(1))
        ),
        borderColor: color,
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        pointBackgroundColor: color,
        backgroundColor,
      };
    });
  
    console.log("newDatasets:", newDatasets);
    setDatasets(newDatasets);
  }, [list, selectedPrice, gifts]);

  // Find index of subarray where ALL items are non-null and have date
let index = list.findIndex(subArray =>
  subArray.every(item => item !== null && item.date !== undefined && typeof item.date === 'string')
);

  
  

  // Generate labels for x-axis using date or time from first array in list
  const labels = list[index]?.map((item: any) => item.date.slice(0, 5)) || [];


  const formatNumber = (number: number) => {
    if (number >= 1000) {
      const shortNumber = (number / 1000).toFixed(1);
      return `${shortNumber}K`;
    }
    return number.toFixed(1); // Ensure one decimal place
  };

  const data = {
    labels,
    datasets,
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (tooltipItem) {
            const value = parseFloat(tooltipItem.raw as string).toFixed(1);
            return `${tooltipItem.dataset.label}: ${value} ${selectedPrice === 'ton' ? 'TON' : 'USD'}`;
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
          ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";

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
        grid: { color: "rgba(255, 255, 255, 0.05)" },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          padding: 0,
          autoSkip: true,
          maxTicksLimit: 5,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.05)",
          drawTicks: true,
          tickLength: 10,
        },
        ticks: {
          color: "rgba(255, 255, 255, 0.6)",
          padding: 10,
          callback: (value) => formatNumber(value as number),
        },
        position: "right",
      },
    },
  };

  return (
    <div className="h-auto w-full">
      {!isInfoHidden &&
        <div className="w-full mb-2 mt-5 flex flex-row justify-between">
            <div className="w-1/2 flex flex-row box-border">
                <button
                    className={`w-2/5 text-sm h-10 box-border ${selectedPrice === 'ton' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                    onClick={() => {
                      setSelectedPrice('ton');
                      vibrate();
                    }}
                >
                    TON
                </button>
                <button
                    className={`w-2/5 text-sm h-10 box-border ${selectedPrice === 'usd' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
                    onClick={() => {
                      setSelectedPrice('usd');
                      vibrate();
                    }}
                >
                    USD
                </button>
            </div>
        </div>
        }

      <div className="relative" ref={chartContainerRef}>
        {datasets.length === 0 ? (
          <div>No data available</div>
        ) : (
          <Line ref={chartRef} data={data} options={options} />
        )}
      </div>

        {!isInfoHidden && 
        <div className="mb-1 mt-5 flex flex-col">
        <div className="w-full flex flex-row justify-between gap-x-3">
          <button
            className={`w-full text-sm h-10 ${listType === 'all' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
            onClick={() => {
              if (lifeData.length > 0) setListType('all');
              vibrate();
            }}
          >
            All
          </button>
          <button
            className={`w-full text-sm h-10 ${listType === '1m' ? 'rounded-lg bg-[#0098EA] font-bold' : ''}`}
            onClick={() => {
              if (lifeData.length > 0) setListType('1m');
              vibrate();
            }}
          >
            1m
          </button>
          
          </div>
        </div>
        }
    </div>
  );
}