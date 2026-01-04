"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  ChartOptions,
} from "chart.js";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useTranslations } from "next-intl";
import useVibrate from "@/hooks/useVibrate";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

interface BarChartProps {
  weekData: GiftWeekDataInterface[];
  lifeData: GiftLifeDataInterface[];
  selectedPrice: "ton" | "usd" | "onSale" | "volume" | "salesCount";
  percentChange: number;
  setPercentChange: (value: number) => void;
  onDataUpdate?: (data: { currentValue: number | null }) => void;
}

const TIME_RANGES: {
  key: "24h" | "3d" | "1w" | "1m" | "3m" | "6m" | "1y" | "all";
  label: (t: (key: string) => string) => string;
  requiresLifeData?: boolean;
}[] = [
  { key: "24h", label: (t) => `24${t("hour")}` },
  { key: "3d", label: (t) => `3${t("day")}` },
  { key: "1w", label: (t) => `1${t("week")}` },
  { key: "1m", label: (t) => `1${t("month")}`, requiresLifeData: true },
  { key: "3m", label: (t) => `3${t("month")}`, requiresLifeData: true },
  { key: "6m", label: (t) => `6${t("month")}`, requiresLifeData: true },
  { key: "1y", label: (t) => `1${t("year")}`, requiresLifeData: true },
  { key: "all", label: (t) => t("all"), requiresLifeData: true },
];

export default function BarChart({
  weekData,
  lifeData,
  selectedPrice,
  percentChange,
  setPercentChange,
  onDataUpdate,
}: BarChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"bar">>(null);
  const [list, setList] = useState<
    (GiftLifeDataInterface | GiftWeekDataInterface)[]
  >(weekData.slice(-24));
  const [listType, setListType] = useState<
    "24h" | "3d" | "1w" | "1m" | "3m" | "6m" | "1y" | "all"
  >("24h");
  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();

  const translateTime = useTranslations("timegap");

  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const buttonContainer = chartContainer.querySelector(
      ".time-gap-buttons"
    ) as HTMLElement;

    const preventScroll = (e: TouchEvent) => {
      if (buttonContainer && buttonContainer.contains(e.target as Node)) {
        return;
      }
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
    const lastPriceIndex = weekData.length - 1;
    if (lastPriceIndex < 0) {
      switch (listType) {
        case "24h":
        case "3d":
        case "1w":
          setList([]);
          break;
        case "1m":
          setList(lifeData.slice(-30));
          break;
        case "3m":
          setList(lifeData.slice(-90));
          break;
        case "6m":
          setList(lifeData.slice(-180));
          break;
        case "1y":
          setList(lifeData.slice(-360));
          break;
        case "all":
          setList(lifeData);
          break;
      }
      return;
    }

    const lastWeekData = weekData[lastPriceIndex];
    const lastDate = lastWeekData.date;

    // Aggregate volume and salesCount for weekData documents with the same date as the last document
    const aggregatedWeekData: GiftWeekDataInterface = {
      ...lastWeekData,
      volume: weekData
        .filter((item) => item.date === lastDate)
        .reduce((sum, item) => sum + (item.volume ?? 0), 0),
      salesCount: weekData
        .filter((item) => item.date === lastDate)
        .reduce((sum, item) => sum + (item.salesCount ?? 0), 0),
    };

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
        setList([...lifeData.slice(-30), aggregatedWeekData]);
        break;
      case "3m":
        setList([...lifeData.slice(-90), aggregatedWeekData]);
        break;
      case "6m":
        setList([...lifeData.slice(-180), aggregatedWeekData]);
        break;
      case "1y":
        setList([...lifeData.slice(-360), aggregatedWeekData]);
        break;
      case "all":
        setList([...lifeData, aggregatedWeekData]);
        break;
    }
  }, [listType, lifeData, weekData]);

  useEffect(() => {
    if (list.length === 0) {
      if (typeof setPercentChange === "function") {
        setPercentChange(0);
      } else {
        console.warn("setPercentChange is not a function");
      }
      if (onDataUpdate) {
        onDataUpdate({ currentValue: null });
      }
      return;
    }

    let currentValue: number | null = null;
    let calculatedPercentChange = 0;

    if (selectedPrice === "ton") {
      const prices = list
        .map((item) => item.priceTon)
        .filter((v): v is number => v !== undefined && v !== null);
      if (prices.length > 1 && prices[0] !== 0) {
        const firstData = prices[0];
        const lastData = prices[prices.length - 1];
        calculatedPercentChange = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        currentValue =
          prices.length > 0 && Number.isFinite(prices[prices.length - 1])
            ? prices[prices.length - 1]
            : null;
      }
    } else if (selectedPrice === "usd") {
      const prices = list
        .map((item) => item.priceUsd)
        .filter((v): v is number => v !== undefined && v !== null);
      if (prices.length > 1 && prices[0] !== 0) {
        const firstData = prices[0];
        const lastData = prices[prices.length - 1];
        calculatedPercentChange = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        currentValue =
          prices.length > 0 && Number.isFinite(prices[prices.length - 1])
            ? prices[prices.length - 1]
            : null;
      }
    } else if (selectedPrice === "onSale") {
      const amounts = list
        .map((item) =>
          typeof item.amountOnSale === "number" ? item.amountOnSale : null
        )
        .filter((v): v is number => v !== null);
      if (amounts.length > 1 && amounts[0] !== 0) {
        const firstData = amounts[0];
        const lastData = amounts[amounts.length - 1];
        calculatedPercentChange = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        currentValue =
          amounts.length > 0 && Number.isFinite(amounts[amounts.length - 1])
            ? amounts[amounts.length - 1]
            : null;
      }
    } else if (selectedPrice === "volume") {
      const volumes = list
        .map((item) => (typeof item.volume === "number" ? item.volume : null))
        .filter((v): v is number => v !== null);
      if (volumes.length > 1 && volumes[0] !== 0) {
        const firstData = volumes[0];
        const lastData = volumes[volumes.length - 1];
        calculatedPercentChange = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        currentValue =
          volumes.length > 0 && Number.isFinite(volumes[volumes.length - 1])
            ? volumes[volumes.length - 1]
            : null;
      }
    } else if (selectedPrice === "salesCount") {
      const counts = list
        .map((item) =>
          typeof item.salesCount === "number" ? item.salesCount : null
        )
        .filter((v): v is number => v !== null);
      if (counts.length > 1 && counts[0] !== 0) {
        const firstData = counts[0];
        const lastData = counts[counts.length - 1];
        calculatedPercentChange = parseFloat(
          (((lastData - firstData) / firstData) * 100).toFixed(2)
        );
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        currentValue =
          counts.length > 0 && Number.isFinite(counts[counts.length - 1])
            ? counts[counts.length - 1]
            : null;
      }
    }

    // Ensure calculatedPercentChange is finite, otherwise set to 0
    if (typeof setPercentChange === "function") {
      setPercentChange(
        Number.isFinite(calculatedPercentChange) ? calculatedPercentChange : 0
      );
    } else {
      console.warn("setPercentChange is not a function");
    }
    if (onDataUpdate) {
      onDataUpdate({ currentValue });
    }
  }, [selectedPrice, list, setPercentChange, onDataUpdate]);

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
        label:
          selectedPrice === "onSale"
            ? "Amount On Sale"
            : selectedPrice === "volume"
            ? "Volume"
            : selectedPrice === "salesCount"
            ? "Sales Count"
            : "Price",
        data: values,
        backgroundColor:
          percentChange >= 0
            ? "rgba(34, 197, 94, 0.5)"
            : "rgba(239, 68, 68, 0.5)",
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1,
      },
    ],
  };

  const numericValues = (data.datasets[0].data as (number | null)[]).filter(
    (v): v is number => v !== null
  );

  const options: ChartOptions<"bar"> = {
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
            } else if (selectedPrice === "volume") {
              return tooltipItem.raw === null
                ? "No data"
                : `Volume: ${tooltipItem.raw} TON`;
            } else if (selectedPrice === "salesCount") {
              return tooltipItem.raw === null
                ? "No data"
                : `Amount sold: ${tooltipItem.raw}`;
            }
            return `Price: ${tooltipItem.raw} ${
              selectedPrice === "ton" ? "TON" : "USD"
            }`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          padding: 0,
          autoSkip: true,
          maxTicksLimit: 4,
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
          padding: 3,
          maxTicksLimit: 7,
        },
        position: "right",
        suggestedMax:
          numericValues.length > 0
            ? Math.max(...numericValues) * 1.05
            : undefined,
        suggestedMin:
          numericValues.length > 0
            ? Math.min(...numericValues) * 0.95
            : undefined,
      },
    },
  };

  return (
    <div
      className={
        resolvedTheme === "dark"
          ? "relative"
          : "relative bg-secondaryTransparent rounded-3xl"
      }
      ref={chartContainerRef}>
      <Bar
        ref={chartRef as any}
        data={data}
        options={options}
        height={window.innerWidth < 1080 ? 200 : 150}
      />
      <div className='w-full mt-3 p-2 flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl time-gap-buttons'>
        {TIME_RANGES.map(({ key, label, requiresLifeData }) => {
          const isActive = listType === key;
          const isDisabled = requiresLifeData && lifeData.length === 0;

          return (
            <button
              key={key}
              disabled={isDisabled}
              className={`w-full px-3 py-2 text-sm text-nowrap ${
                isActive
                  ? "rounded-3xl bg-primary font-bold text-white"
                  : "text-secondaryText"
              } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (!isDisabled) {
                  setListType(key);
                  vibrate();
                }
              }}>
              {typeof label === "function" ? label(translateTime) : label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
