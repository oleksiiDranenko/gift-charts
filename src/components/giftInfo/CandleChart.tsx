"use client";

import { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import { Chart as ReactChart, ChartProps } from "react-chartjs-2";
import { parse, addDays, format } from "date-fns";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { useTheme } from "next-themes";
import useVibrate from "@/hooks/useVibrate";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

Chart.register(...registerables, CandlestickController, CandlestickElement);

type CandlestickData = {
  x: number;
  o: number;
  h: number;
  l: number;
  c: number;
};

interface PropsInterface {
  data: GiftLifeDataInterface[];
  weekData: GiftWeekDataInterface[];
}

export default function CandleChart({ data, weekData }: PropsInterface) {
  const chartRef = useRef<
    Chart<"candlestick", CandlestickData[], unknown> | null | undefined
  >(null);

  const [listType, setListType] = useState<"2w" | "1m" | "3m" | "all">("2w");
  const [list, setList] = useState<GiftLifeDataInterface[]>(data);
  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();

  useEffect(() => {
    const today = new Date();
    const todayStr = format(today, "dd-MM-yyyy");
    const lastDataDate = data.length > 0 ? data[data.length - 1].date : null;
    let updatedData = [...data];

    if (lastDataDate) {
      const lastDate = parse(lastDataDate, "dd-MM-yyyy", new Date());
      const nextDay = addDays(lastDate, 1);
      const nextDayStr = format(nextDay, "dd-MM-yyyy");

      if (nextDayStr === todayStr) {
        // Filter weekData for today's entries
        const todayWeekData = weekData.filter(
          (item) => item.date === todayStr
        );

        if (todayWeekData.length > 0) {
          // Sort by time to ensure correct order for open/close
          const sortedTodayData = [...todayWeekData].sort((a, b) =>
            a.time.localeCompare(b.time)
          );

          // Calculate open, high, low, close for today
          const prices = sortedTodayData.map((item) => item.priceTon);
          const openTon = sortedTodayData[0].priceTon;
          const closeTon = sortedTodayData[sortedTodayData.length - 1].priceTon;
          const highTon = Math.max(...prices);
          const lowTon = Math.min(...prices);

          // Create new data item for today
          const newDataItem: GiftLifeDataInterface = {
            _id: `temp-${todayStr}`,
            name: sortedTodayData[0].name,
            date: todayStr,
            priceTon: closeTon, // Use close price as the representative price
            priceUsd: 0, // Not used as per request
            openTon,
            closeTon,
            highTon,
            lowTon,
          };

          updatedData = [...data, newDataItem];
        }
      }
    }

    // Apply listType filtering
    switch (listType) {
      case "2w":
        setList([...updatedData.slice(-14)]);
        break;
      case "1m":
        setList([...updatedData.slice(-30)]);
        break;
      case "3m":
        setList([...updatedData.slice(-90)]);
        break;
      case "all":
        setList([...updatedData]);
        break;
      default:
        break;
    }
  }, [listType, data, weekData]);

  const chartData: ChartProps<
    "candlestick",
    CandlestickData[],
    unknown
  >["data"] = {
    datasets: [
      {
        label: "Price (TON)",
        data: list.map((item) => {
          const parsedDate = parse(item.date, "dd-MM-yyyy", new Date());
          return {
            x: parsedDate.getTime(),
            o: item.openTon || 0,
            h: item.highTon || 0,
            l: item.lowTon || 0,
            c: item.closeTon || 0,
          };
        }),
        borderColor: "#ffffff",
        upColor: "#14cc00",
        downColor: "#ff0303",
      } as any,
    ],
  };

  const prices = list
    .map((item) => [item.openTon, item.highTon, item.lowTon, item.closeTon])
    .flat()
    .filter((v): v is number => typeof v === "number");
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;

  const options: ChartProps<
    "candlestick",
    CandlestickData[],
    unknown
  >["options"] = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => {
            const item = list[tooltipItems[0].dataIndex];
            return item.date;
          },
          label: (tooltipItem) => {
            const item = list[tooltipItem.dataIndex];
            return `Open: ${item.openTon} TON, Close: ${item.closeTon} TON`;
          },
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day",
          displayFormats: {
            day: "dd-MM",
          },
        },
        ticks: {
          source: "data", // Align ticks with data points
          autoSkip: true, // Prevent overlap
          maxTicksLimit: 10, // Allow up to 10 ticks (adjust as needed)
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          padding: 0,
          maxRotation: 0,
          minRotation: 0,
          callback: (value, index, ticks) => {
            // Show ticks every 5 days based on data index
            const tickInterval = 5; // Adjust interval (e.g., 5 for every 5 days)
            if (index % tickInterval === 0) {
              return format(new Date(value), "dd-MM");
            }
            return null; // Skip ticks that don't match the interval
          },
        },
        title: {
          display: false,
        },
        grid: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        type: "linear" as const,
        position: "right",
        title: {
          display: false,
        },
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
        suggestedMax: maxPrice * 1.1,
        suggestedMin: minPrice * 0.9,
      },
    },
  };

  return (
    <div className="h-auto w-full">
      <ReactChart
        ref={chartRef}
        type="candlestick"
        data={chartData}
        options={options}
      />
      <div className="mb-1 mt-5 flex flex-col border border-secondary bg-secondaryTransparent rounded-lg">
        <div className="w-full flex flex-row justify-between gap-x-3">
          <button
            className={`w-full text-sm h-8 ${
              listType == "all"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              data.length > 0 ? setListType("all") : null;
              vibrate();
            }}
          >
            All
          </button>
          <button
            className={`w-full text-sm h-8 ${
              listType == "3m"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              data.length > 0 ? setListType("3m") : null;
              vibrate();
            }}
          >
            3m
          </button>
          <button
            className={`w-full text-sm h-8 ${
              listType == "1m"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setListType("1m");
              vibrate();
            }}
          >
            1m
          </button>
          <button
            className={`w-full text-sm h-8 ${
              listType == "2w"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setListType("2w");
              vibrate();
            }}
          >
            2w
          </button>
        </div>
      </div>
    </div>
  );
}
