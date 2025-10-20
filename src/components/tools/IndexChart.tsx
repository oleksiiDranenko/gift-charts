"use client";

import useVibrate from "@/hooks/useVibrate";
import { IndexDataInterface } from "@/interfaces/IndexDataInterface";
import { IndexInterface } from "@/interfaces/IndexInterface";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import { useAppSelector } from "@/redux/hooks";
import { useTheme } from "next-themes";
import { IndexMonthDataInterface } from "@/interfaces/IndexMonthDataInterface";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface PropsInterface {
  index: IndexInterface;
  indexData: IndexDataInterface[];
  indexMonthData: IndexMonthDataInterface[];
}

export default function IndexChart({
  index,
  indexData,
  indexMonthData,
}: PropsInterface) {
  const vibrate = useVibrate();
  const giftsList = useAppSelector((state) => state.giftsList);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);

  const [selectedPrice, setSelectedPrice] = useState<"ton" | "usd">("ton");
  const [percentChange, setPercentChange] = useState<number>(0);

  const [list, setList] = useState<IndexDataInterface[]>(indexData);

  const [listType, setListType] = useState<
    "1d" | "3d" | "1w" | "1m" | "3m" | "all"
  >("1d");
  const [low, setLow] = useState<number>();
  const [high, setHigh] = useState<number>();
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  const { resolvedTheme } = useTheme();

  // Prevent scroll when interacting with chart
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();

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

  // Create gradient when percentChange changes
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

  // ✅ FIX #2: keep latest document always at end of list
  // ✅ update list based on listType and handle "VOL" differently
  useEffect(() => {
    if (!indexMonthData || indexMonthData.length === 0) return;

    const latestDoc = indexMonthData[indexMonthData.length - 1]; // newest doc

    // Helper to sum the last 48 month docs for VOL
    const getSummedDoc = (): IndexDataInterface => {
      const last48 = indexMonthData.slice(-48);
      const totalTon = last48.reduce(
        (acc, item) => acc + (item.priceTon || 0),
        0
      );
      const totalUsd = last48.reduce(
        (acc, item) => acc + (item.priceUsd || 0),
        0
      );

      return {
        ...latestDoc,
        priceTon: totalTon,
        priceUsd: totalUsd,
        date: latestDoc.date,
      };
    };

    const ensureUnique = (arr: IndexDataInterface[]) =>
      arr.filter(
        (v, i, a) =>
          a.findIndex((t) => t.date === v.date && t.priceTon === v.priceTon) ===
          i
      );

    let newList: IndexDataInterface[] = [];

    switch (listType) {
      case "1d":
        newList = [...indexMonthData.slice(-48), latestDoc];
        break;

      case "3d":
        newList = [...indexMonthData.slice(-144), latestDoc];
        break;

      case "1w":
        newList = [...indexMonthData.slice(-7 * 48), latestDoc];
        break;

      case "1m":
        newList =
          index.shortName === "VOL"
            ? [...indexData.slice(-30), getSummedDoc()]
            : [...indexData.slice(-30), latestDoc];
        break;

      case "3m":
        newList =
          index.shortName === "VOL"
            ? [...indexData.slice(-90), getSummedDoc()]
            : [...indexData.slice(-90), latestDoc];
        break;

      case "all":
        newList =
          index.shortName === "VOL"
            ? [...indexData, getSummedDoc()]
            : [...indexData, latestDoc];
        break;
    }

    setList(ensureUnique(newList));
  }, [listType, indexData, indexMonthData, index.shortName]);

  // Calculate change
  useEffect(() => {
    if (!list || list.length === 0) return;

    const prices = list.map((item) =>
      selectedPrice === "ton" ? item.priceTon : item.priceUsd
    );
    const first = prices[0];
    const last = prices[prices.length - 1];
    const pct =
      first === 0 ? 0 : parseFloat((((last - first) / first) * 100).toFixed(2));
    setPercentChange(pct);
    setLow(Math.min(...prices));
    setHigh(Math.max(...prices));
  }, [selectedPrice, list]);

  const formatNumber = (num: number) =>
    num >= 1_000_000
      ? `${(num / 1_000_000).toFixed(1)}M`
      : num >= 1_000
      ? `${(num / 1_000).toFixed(1)}K`
      : num.toString();

  const formatNumberWithDots = (value: number, type: string) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    if (type === "price") {
      // two decimal places, comma thousands separator, dot decimal
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    if (type === "amount") {
      // integer style with thousands separator, no decimals
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(value));
    }

    if (type === "percent") {
      // percent display - show two decimals
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    // fallback
    return new Intl.NumberFormat("en-US").format(value);
  };

  const data = {
    labels: list.map((item) => item.date.slice(0, 5)),
    datasets: [
      {
        label: "Index Price",
        data: list.map((item) =>
          selectedPrice === "ton" ? item.priceTon : item.priceUsd
        ),
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
      },
    ],
  };

  // ✅ FIX #3: move Math.max/min inside safe guards
  const yData = data.datasets[0].data as number[];

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => list[tooltipItems[0].dataIndex].date,
          label: (tooltipItem) =>
            `Value: ${formatNumberWithDots(tooltipItem.raw as number, "price")}
            `,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
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
          autoSkip: true,
          maxTicksLimit: 3,
        },
      },
      y: {
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
          callback: (v) => formatNumber(Number(v)),
        },
        position: "right",
        suggestedMax: yData.length ? Math.max(...yData) * 1.1 : undefined,
        suggestedMin: yData.length ? Math.min(...yData) * 0.9 : undefined,
      },
    },
  };

  return (
    <div className='h-auto w-full pl-3 pr-3'>
      {/* Header */}
      <div className='w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center'>
        <div className='w-3/5 h-full flex items-center'>
          <h1 className='flex flex-col ml-3'>
            <span className='text-lg font-bold'>{index.name}</span>
            <span className='text-secondaryText text-sm flex justify-start'>
              Index
            </span>
          </h1>
        </div>

        <div className='w-2/5 h-14 pr-3 flex flex-col items-end justify-center'>
          <div className='flex flex-row items-center'>
            {selectedPrice == "ton" ? (
              <Image
                alt='ton logo'
                src='/images/toncoin.webp'
                width={14}
                height={14}
                className='mr-1'
              />
            ) : (
              <span className='text-base font-extrabold mr-1'>$</span>
            )}
            <span className='text-base font-extrabold'>
              {selectedPrice == "ton"
                ? formatNumberWithDots(
                    Number(list[list.length - 1]?.priceTon),
                    "price"
                  )
                : formatNumberWithDots(
                    Number(list[list.length - 1]?.priceUsd),
                    "price"
                  )}
            </span>
          </div>

          <span
            className={`text-sm font-bold ${
              percentChange >= 0 ? "text-green-500" : "text-red-500"
            }`}>
            {(percentChange > 0 ? "+" : "") + percentChange + "%"}
          </span>
        </div>
      </div>

      {index.valueType === "price" && (
        <div className='w-full mb-2 mt-5 flex flex-row justify-between'>
          <div className='flex flex-row box-border bg-secondaryTransparent rounded-xl gap-x-1'>
            <button
              className={`text-xs h-8 px-3 ${
                selectedPrice == "ton"
                  ? "rounded-xl bg-primary font-bold text-white"
                  : ""
              }`}
              onClick={() => {
                setSelectedPrice("ton");
                vibrate();
              }}>
              Ton
            </button>
            <button
              className={`text-xs h-8 px-3 ${
                selectedPrice == "usd"
                  ? "rounded-xl bg-primary font-bold text-white"
                  : ""
              }`}
              onClick={() => {
                setSelectedPrice("usd");
                vibrate();
              }}>
              Usd
            </button>
          </div>
        </div>
      )}

      <div
        className={
          resolvedTheme === "dark"
            ? "relative w-full"
            : "w-full relative bg-secondaryTransparent rounded-xl"
        }
        ref={chartContainerRef}>
        <Line ref={chartRef} data={data} options={options} />
      </div>

      <div className='w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-xl'>
        {["all", "3m", "1m", "1w", "3d", "1d"].map((type) => (
          <button
            key={type}
            className={`w-full px-1 text-sm h-8 ${
              listType === type
                ? "rounded-xl bg-secondary font-bold"
                : "text-secondaryText"
            }`}
            onClick={() => {
              setListType(type as any);
              vibrate();
            }}>
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
