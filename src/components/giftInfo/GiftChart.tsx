"use client";

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
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import CandleChart from "./CandleChart";
import {
  ChartCandlestick,
  ChartSpline,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "next-themes";
import CalendarHeatmap from "../tools/calendar-heatmap/CalendarHeatmap";
import MarketsModal from "./MarketsModal";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface PropsInterface {
  gift: GiftInterface | null;
  weekData: GiftWeekDataInterface[];
  lifeData: GiftLifeDataInterface[];
}

export default function GiftChart({
  gift,
  weekData,
  lifeData,
}: PropsInterface) {
  const vibrate = useVibrate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);

  const [selectedPrice, setSelectedPrice] = useState<"ton" | "usd">("ton");
  const [percentChange, setPercentChange] = useState<number>(0);
  const [list, setList] = useState<
    (GiftLifeDataInterface | GiftWeekDataInterface)[]
  >(weekData.slice(-24));
  const [listType, setListType] = useState<"24h" | "1w" | "1m" | "all">("24h");
  const [low, setLow] = useState<number>();
  const [high, setHigh] = useState<number>();
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);
  const [candleData, setCandleData] = useState<GiftLifeDataInterface[]>([]);
  const [chartType, setChartType] = useState<"line" | "candle">("line");

  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const { theme, resolvedTheme } = useTheme();

  useEffect(() => {
    const filteredCandleData = lifeData.filter(
      (item) =>
        typeof item.openTon === "number" &&
        typeof item.closeTon === "number" &&
        typeof item.highTon === "number" &&
        typeof item.lowTon === "number"
    );
    setCandleData(filteredCandleData);
  }, [lifeData]);

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

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

  useEffect(() => {
    if (list.length === 0) return;

    const prices = list.map((item) =>
      selectedPrice === "ton" ? item.priceTon : item.priceUsd
    );

    if (selectedPrice === "ton") {
      const firstData = list[0].priceTon;
      const lastData = list[list.length - 1].priceTon;
      const result = parseFloat(
        (((lastData - firstData) / firstData) * 100).toFixed(2)
      );
      setPercentChange(result);
      setLow(Math.min(...prices));
      setHigh(Math.max(...prices));
    } else {
      const firstData = list[0].priceUsd;
      const lastData = list[list.length - 1].priceUsd;
      const result = parseFloat(
        (((lastData - firstData) / firstData) * 100).toFixed(2)
      );
      setPercentChange(result);
      setLow(Math.min(...prices));
      setHigh(Math.max(...prices));
    }
  }, [selectedPrice, list]);

  useEffect(() => {
    const lastPriceIndex = weekData.length - 1;

    switch (listType) {
      case "24h":
        setList(weekData.slice(-48));
        break;
      case "1w":
        setList(weekData);
        break;
      case "1m":
        setList([...lifeData.slice(-30), weekData[lastPriceIndex]]);
        break;
      case "all":
        setList([...lifeData, weekData[lastPriceIndex]]);
        break;
    }
  }, [listType]);

  const formatNumber = (number: number) => {
    if (number >= 1000) {
      const shortNumber = (number / 1000).toFixed(1);
      return `${shortNumber}K`;
    }
    return number.toString();
  };

  const data = {
    labels: list.map((item) => {
      if ("time" in item && listType === "24h") {
        return item.time;
      }
      return item.date.slice(0, 5);
    }),
    datasets: [
      {
        label: "Gift Price",
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

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: function (tooltipItems) {
            const item = list[tooltipItems[0].dataIndex];
            if ("time" in item && (listType === "24h" || listType === "1w")) {
              return `${item.time} ${item.date}`;
            }
            return item.date;
          },
          label: function (tooltipItem) {
            return `Price: ${tooltipItem.raw} ${
              selectedPrice === "ton" ? "TON" : "USD"
            }`;
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
          ctx.strokeStyle =
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(0, 0, 0, 0.5)";

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
          padding: 0,
          autoSkip: true,
          maxTicksLimit: 3,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
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
        position: "right",
        suggestedMax: Math.max(...data.datasets[0].data) * 1.1,
        suggestedMin: Math.min(...data.datasets[0].data) * 0.9,
      },
    },
  };

  return (
    <div className="h-auto w-full pl-3 pr-3">
      <div className="w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center">
        <div className="h-full flex items-center">
          <Image
            alt="gift"
            src={`/gifts/${gift?.image}.webp`}
            width={55}
            height={55}
            className={`mr-3 p-1 rounded-lg  bg-secondaryTransparent `}
          />
          <h1 className="flex flex-col">
            <span className="text-xl font-bold">{gift?.name}</span>
            <span className="text-secondaryText text-sm flex justify-start">
              {gift ? formatNumber(gift?.upgradedSupply) : null}
            </span>
          </h1>
        </div>
        <div className="w-1/3 h-14 pr-3 flex flex-col items-end justify-center">
          <div className="flex flex-row items-center">
            {selectedPrice == "ton" ? (
              <Image
                alt="ton logo"
                src="/images/toncoin.webp"
                width={14}
                height={14}
                className="mr-1"
              />
            ) : (
              <span className="text-base font-extrabold mr-1">$</span>
            )}
            <span className="text-xl font-extrabold">
              {selectedPrice == "ton"
                ? list[list.length - 1]?.priceTon
                : list[list.length - 1]?.priceUsd}
            </span>
          </div>

          <span
            className={`text-sm ${
              percentChange >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {(percentChange > 0 ? "+" : "") + percentChange + "%"}
          </span>
        </div>
      </div>

      <div className="w-full h-fit mb-3 mt-5 flex flex-row gap-x-3">
        <div className="flex flex-row box-border bg-secondaryTransparent rounded-lg gap-x-1">
          <button
            className={`text-xs h-8 px-3 box-border ${
              selectedPrice == "ton"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setSelectedPrice("ton");
              vibrate();
            }}
          >
            Ton
          </button>
          <button
            className={`text-xs h-8 px-3  box-border ${
              selectedPrice == "usd"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setSelectedPrice("usd");
              vibrate();
            }}
          >
            Usd
          </button>
        </div>

        <div className="flex flex-row box-border bg-secondaryTransparent rounded-lg gap-x-1">
          <button
            className={`text-xs h-8 px-3 box-border  ${
              chartType == "line"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setChartType("line");
              vibrate();
            }}
          >
            <ChartSpline size={16} />
          </button>
          <button
            className={`text-xs h-8 px-3 box-border ${
              chartType == "candle"
                ? "rounded-lg bg-primary font-bold text-white"
                : null
            }`}
            onClick={() => {
              setChartType("candle");
              vibrate();
            }}
          >
            <ChartCandlestick size={16} />
          </button>
        </div>
      </div>

      {chartType === "line" ? (
        <>
          <div className="relative" ref={chartContainerRef}>
            <Line ref={chartRef} data={data} options={options} />
          </div>

          <div className="mb-1 mt-5 flex flex-col border border-secondary bg-secondaryTransparent rounded-lg">
            <div className="w-full flex flex-row justify-between gap-x-3">
              <button
                className={`w-full text-sm h-8 ${
                  listType == "all"
                    ? "rounded-lg bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  lifeData.length > 0 ? setListType("all") : null;
                  vibrate();
                }}
              >
                All
              </button>
              <button
                className={`w-full text-sm h-8 ${
                  listType == "1m"
                    ? "rounded-lg bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  lifeData.length > 0 ? setListType("1m") : null;
                  vibrate();
                }}
              >
                1m
              </button>
              <button
                className={`w-full text-sm h-8 ${
                  listType == "1w"
                    ? "rounded-lg bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  setListType("1w");
                  vibrate();
                }}
              >
                1w
              </button>
              <button
                className={`w-full text-sm h-8 ${
                  listType == "24h"
                    ? "rounded-lg bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  setListType("24h");
                  vibrate();
                }}
              >
                24h
              </button>
            </div>
          </div>
        </>
      ) : (
        <CandleChart data={candleData} weekData={weekData} />
      )}

      <div className="w-full flex flex-row gap-x-3 mt-5">
        <MarketsModal
          trigger={
            <button className="w-full h-10 bg-red-600 rounded-lg" onClick={() => vibrate()}>Sell</button>
          }
        />
        <MarketsModal
          trigger={
            <button className="w-full h-10 bg-green-600 rounded-lg" onClick={() => vibrate()}>Buy</button>
          }
        />
      </div>

      <div className="mt-5">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <h2 className="text-lg font-bold">Yearly Performance</h2>
          </div>
          <div>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex flex-row items-center py-2 px-3 gap-1 text-sm bg-secondaryTransparent rounded-lg"
            >
              {showCalendar ? (
                <>
                  Hide
                  <ChevronUp size={18} />
                </>
              ) : (
                <>
                  Show
                  <ChevronDown size={18} />
                </>
              )}
            </button>
          </div>
        </div>
        <div className={showCalendar ? "visible" : "hidden"}>
          <CalendarHeatmap lifeData={lifeData} />
        </div>
      </div>
    </div>
  );
}
