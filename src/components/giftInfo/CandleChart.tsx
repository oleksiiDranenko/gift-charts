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
  percentChange: number;
  setPercentChange: (value: number) => void;
  onDataUpdate?: (data: { currentValue: number | null }) => void;
}

export default function CandleChart({
  data,
  weekData,
  percentChange,
  setPercentChange,
  onDataUpdate,
}: PropsInterface) {
  const chartRef = useRef<
    Chart<"candlestick", CandlestickData[], unknown> | null | undefined
  >(null);
  const [listType, setListType] = useState<"2w" | "1m" | "2m" | "3m" | "all">("2w");
  const [list, setList] = useState<GiftLifeDataInterface[]>(data);
  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();

  // Update data based on listType and append today's data if applicable
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
          const prices = sortedTodayData
            .map((item) => item.priceTon)
            .filter((v): v is number => v !== undefined && v !== null);
          const openTon = sortedTodayData[0].priceTon;
          const closeTon = sortedTodayData[sortedTodayData.length - 1].priceTon;
          const highTon = prices.length > 0 ? Math.max(...prices) : openTon;
          const lowTon = prices.length > 0 ? Math.min(...prices) : openTon;

          // Create new data item for today
          const newDataItem: GiftLifeDataInterface = {
            _id: `temp-${todayStr}`,
            name: sortedTodayData[0].name,
            date: todayStr,
            priceTon: closeTon,
            priceUsd: 0,
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
        setList(updatedData.slice(-14));
        break;
      case "1m":
        setList(updatedData.slice(-30));
        break;
      case "2m":
        setList(updatedData.slice(-60));
        break;
      case "3m":
        setList(updatedData.slice(-90));
        break;
      case "all":
        setList(updatedData);
        break;
    }
  }, [listType, data, weekData]);

  // Calculate percent change from first openTon to last closeTon
  useEffect(() => {
    if (list.length === 0) {
      setPercentChange(0);
      if (onDataUpdate) onDataUpdate({ currentValue: null });
      return;
    }

    const firstOpen = list[0].openTon;
    const lastClose = list[list.length - 1].closeTon;
    let calculatedPercentChange = 0;
    let currentValue: number | null = null;

    if (typeof firstOpen === "number" && typeof lastClose === "number" && firstOpen !== 0) {
      calculatedPercentChange = parseFloat(
        (((lastClose - firstOpen) / firstOpen) * 100).toFixed(2)
      );
      currentValue = lastClose;
    }

    setPercentChange(calculatedPercentChange);
    if (onDataUpdate) {
      onDataUpdate({ currentValue });
    }
  }, [list, setPercentChange, onDataUpdate]);

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
          source: "data",
          autoSkip: true,
          maxTicksLimit: 10,
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          padding: 0,
          maxRotation: 0,
          minRotation: 0,
          callback: (value, index, ticks) => {
            const tickInterval = 5;
            if (index % tickInterval === 0) {
              return format(new Date(value), "dd-MM");
            }
            return null;
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
        className={resolvedTheme === "dark" ? "" : "bg-secondaryTransparent rounded-lg"}
      />
      <div className="w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-xl">
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "all"
              ? "rounded-xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            if (data.length > 0) setListType("all");
            vibrate();
          }}
        >
          All
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "3m"
              ? "rounded-xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            if (data.length > 0) setListType("3m");
            vibrate();
          }}
        >
          3m
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "2m"
              ? "rounded-xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            setListType("2m");
            vibrate();
          }}
        >
          2m
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "1m"
              ? "rounded-xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            setListType("1m");
            vibrate();
          }}
        >
          1m
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "2w"
              ? "rounded-xl bg-secondary font-bold"
              : "text-secondaryText"
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
  );
}