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
  ChartNoAxesColumn,
  ChartSpline,
  ChevronDown,
  ChevronUp,
  Component,
  SlidersHorizontal,
  SquareArrowOutUpRight,
  Store,
} from "lucide-react";
import { useTheme } from "next-themes";
import CalendarHeatmap from "../tools/calendar-heatmap/CalendarHeatmap";
import MarketsModal from "./MarketsModal";
import ModelsModal from "./ModelsModal";
import SettingsModal from "./SettingsModal";

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

  const [selectedPrice, setSelectedPrice] = useState<
    "ton" | "usd" | "onSale" | "volume" | "salesCount"
  >("ton");

  const [percentChange, setPercentChange] = useState<number>(0);
  const [list, setList] = useState<
    (GiftLifeDataInterface | GiftWeekDataInterface)[]
  >(weekData.slice(-24));
  const [listType, setListType] = useState<
    "24h" | "3d" | "1w" | "1m" | "3m" | "all"
  >("24h");
  const [low, setLow] = useState<number>();
  const [high, setHigh] = useState<number>();
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);
  const [candleData, setCandleData] = useState<GiftLifeDataInterface[]>([]);
  const [chartType, setChartType] = useState<"line" | "candle">("line");

  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const { resolvedTheme } = useTheme();

  const handleSelectedPrice = (
    value: "ton" | "usd" | "onSale" | "volume" | "salesCount"
  ) => {
    setSelectedPrice(value);
  };

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

    if (selectedPrice === "ton") {
      const prices = list.map((item) => item.priceTon);
      const firstData = list[0].priceTon;
      const lastData = list[list.length - 1].priceTon;
      const result = parseFloat(
        (((lastData - firstData) / firstData) * 100).toFixed(2)
      );
      setPercentChange(result);
      setLow(Math.min(...prices));
      setHigh(Math.max(...prices));
    } else if (selectedPrice === "usd") {
      const prices = list.map((item) => item.priceUsd);
      const firstData = list[0].priceUsd;
      const lastData = list[list.length - 1].priceUsd;
      const result = parseFloat(
        (((lastData - firstData) / firstData) * 100).toFixed(2)
      );
      setPercentChange(result);
      setLow(Math.min(...prices));
      setHigh(Math.max(...prices));
    } else if (selectedPrice === "onSale") {
      // filter out nulls
      const amounts = list
        .map((item) =>
          typeof item.amountOnSale === "number" ? item.amountOnSale : null
        )
        .filter((v): v is number => v !== null);

      if (amounts.length > 1) {
        const firstData = amounts[0];
        const lastData = amounts[amounts.length - 1];
        const result = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        setPercentChange(result);
        setLow(Math.min(...amounts));
        setHigh(Math.max(...amounts));
      } else {
        setPercentChange(0);
        setLow(0);
        setHigh(0);
      }
    } else if (selectedPrice === "volume") {
      const volumes = list
        .map((item) => (typeof item.volume === "number" ? item.volume : null))
        .filter((v): v is number => v !== null);

      if (volumes.length > 1) {
        const firstData = volumes[0];
        const lastData = volumes[volumes.length - 1];
        const result = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        setPercentChange(result);
        setLow(Math.min(...volumes));
        setHigh(Math.max(...volumes));
      } else {
        setPercentChange(0);
        setLow(0);
        setHigh(0);
      }
    } else if (selectedPrice === "salesCount") {
      const counts = list
        .map((item) =>
          typeof item.salesCount === "number" ? item.salesCount : null
        )
        .filter((v): v is number => v !== null);

      if (counts.length > 1) {
        const firstData = counts[0];
        const lastData = counts[counts.length - 1];
        const result = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        setPercentChange(result);
        setLow(Math.min(...counts));
        setHigh(Math.max(...counts));
      } else {
        setPercentChange(0);
        setLow(0);
        setHigh(0);
      }
    }
  }, [selectedPrice, list]);

  useEffect(() => {
    const lastPriceIndex = weekData.length - 1;

    switch (listType) {
      case "24h":
        setList(weekData.slice(-48));
        break;
      case "3d":
        setList(weekData.slice(-144));
        break;
      case "1w":
        setList(weekData);
        break;
      case "1m":
        setList([...lifeData.slice(-30), weekData[lastPriceIndex]]);
        break;
      case "3m":
        setList([...lifeData.slice(-90), weekData[lastPriceIndex]]);
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

  // Always keep the full list, just map values differently
  const values = list.map((item) => {
    if (selectedPrice === "ton") return item.priceTon;
    if (selectedPrice === "usd") return item.priceUsd;
    if (selectedPrice === "onSale")
      return typeof item.amountOnSale === "number" ? item.amountOnSale : null;
    if (selectedPrice === "volume")
      return typeof item.volume === "number" ? item.volume : null;
    if (selectedPrice === "salesCount")
      return typeof item.salesCount === "number" ? item.salesCount : null;
  });

  const data = {
    labels: list.map((item) => {
      if ("time" in item && listType === "24h") {
        return item.time;
      }
      return item.date.slice(0, 5);
    }),
    datasets: [
      {
        label: selectedPrice === "onSale" ? "Amount On Sale" : "Gift Price",
        data: values,
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
        spanGaps: false,
      },
    ],
  };

  const numericValues = (data.datasets[0].data as (number | null)[]).filter(
    (v): v is number => v !== null
  );

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
            if (selectedPrice === "onSale") {
              return tooltipItem.raw === null
                ? "No data"
                : `On Sale: ${tooltipItem.raw}`;
            }
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
        suggestedMax:
          numericValues.length > 0
            ? Math.max(...numericValues) * 1.1
            : undefined,
        suggestedMin:
          numericValues.length > 0
            ? Math.min(...numericValues) * 0.9
            : undefined,
      },
    },
  };

  return (
    <div className="h-auto w-full pl-3 pr-3">
      <div
        className={`w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center ${
          resolvedTheme === "dark"
            ? ""
            : "bg-secondaryTransparent rounded-xl pl-2"
        }`}
      >
        <div className="h-full flex items-center">
          <Image
            alt="gift"
            src={`/gifts/${gift?.image}.webp`}
            width={55}
            height={55}
            className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 rounded-xl ${
              resolvedTheme === "dark"
                ? "bg-secondaryTransparent"
                : "bg-background"
            } `}
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
            {selectedPrice === "ton" ? (
              <Image
                alt="ton logo"
                src="/images/toncoin.webp"
                width={18}
                height={18}
                className="mr-2"
              />
            ) : selectedPrice === "usd" ? (
              <span className="text-xl font-extrabold mr-2">$</span>
            ) : selectedPrice === "onSale" ? (
              <Store size={18} className="mr-2 font-bold" />
            ) : (
              <ChartNoAxesColumn size={18} className="mr-2 font-bold" />
            )}

            <span className="text-xl font-extrabold">
              {selectedPrice === "ton"
                ? list[list.length - 1]?.priceTon
                : selectedPrice === "usd"
                ? list[list.length - 1]?.priceUsd
                : selectedPrice === "onSale"
                ? list[list.length - 1]?.amountOnSale
                : selectedPrice === "volume"
                ? list[list.length - 1]?.volume
                : selectedPrice === "salesCount"
                ? list[list.length - 1]?.salesCount
                : null}
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

      <div className="w-full h-fit mb-3 mt-3 flex flex-col gap-y-3">
        <div className="w-full flex flex-row justify-between">
          <SettingsModal
            trigger={
              <button className="text-xs h-8 px-3 flex flex-row items-center justify-normal box-border rounded-xl bg-primary font-bold text-white gap-x-1">
                <SlidersHorizontal size={16} />
                Configure chart
              </button>
            }
            preSale={gift?.preSale}
            selectedPrice={selectedPrice}
            handleSelectedPrice={handleSelectedPrice}
          />

          <div className="flex flex-row mr-2 box-border bg-secondaryTransparent rounded-xl gap-x-1">
            <button
              className={`text-xs h-8 px-3 box-border  ${
                chartType == "line"
                  ? "rounded-xl bg-primary font-bold text-white"
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
                  ? "rounded-xl bg-primary font-bold text-white"
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
      </div>

      {chartType === "line" ? (
        <>
          <div
            className={
              resolvedTheme === "dark"
                ? "relative"
                : "relative bg-secondaryTransparent rounded-xl"
            }
            ref={chartContainerRef}
          >
            <Line ref={chartRef as any} data={data} options={options} />
          </div>

          <div className="w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-xl">
            <button
              className={`w-full px-1 text-sm h-8 ${
                listType == "all"
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                lifeData.length > 0 ? setListType("all") : null;
                vibrate();
              }}
            >
              All
            </button>
            <button
              className={`w-full px-1 text-sm h-8 ${
                listType == "3m"
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                lifeData.length > 0 ? setListType("3m") : null;
                vibrate();
              }}
            >
              3m
            </button>
            <button
              className={`w-full px-1 text-sm h-8 ${
                listType == "1m"
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
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
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setListType("1w");
                vibrate();
              }}
            >
              1w
            </button>
            <button
              className={`w-full px-1 text-sm h-8 ${
                listType == "3d"
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setListType("3d");
                vibrate();
              }}
            >
              3d
            </button>
            <button
              className={`w-full px-1 text-sm h-8 ${
                listType == "24h"
                  ? "rounded-xl bg-secondary font-bold"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setListType("24h");
                vibrate();
              }}
            >
              24h
            </button>
          </div>
        </>
      ) : (
        <CandleChart data={candleData} weekData={weekData} />
      )}

      <div className="w-full flex flex-row gap-x-3 mt-5">
        <MarketsModal
          trigger={
            <button
              className="w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-red-600 rounded-xl text-white"
              onClick={() => vibrate()}
            >
              Sell
              <SquareArrowOutUpRight size={16} />
            </button>
          }
        />
        <MarketsModal
          trigger={
            <button
              className="w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-green-600 rounded-xl text-white"
              onClick={() => vibrate()}
            >
              Buy
              <SquareArrowOutUpRight size={16} />
            </button>
          }
        />
      </div>

      {gift?.preSale ? null : (
        <div>
          <ModelsModal
            trigger={
              <button
                className={`w-full h-10 mt-3 flex flex-row justify-center items-center gap-x-1 text-sm px-3 box-border rounded-xl ${
                  resolvedTheme === "dark"
                    ? "bg-secondaryTransparent"
                    : "bg-secondaryTransparent"
                }`}
                onClick={() => vibrate()}
              >
                <Component size={16} />
                View Models
              </button>
            }
            giftName={gift?.name ? gift.name : ""}
            giftId={gift?._id ? gift._id : ""}
          />
        </div>
      )}

      <div className="mt-5">
        <div className="w-full flex flex-row justify-between items-center">
          <div className="flex flex-row items-center">
            <h2 className="text-lg font-bold">Yearly Performance</h2>
          </div>
          <div>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex flex-row items-center py-2 px-3 gap-1 text-sm bg-secondary rounded-xl"
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
