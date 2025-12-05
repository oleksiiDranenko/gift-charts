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
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useTranslations } from "next-intl";
import useVibrate from "@/hooks/useVibrate";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface LineChartProps {
  weekData: GiftWeekDataInterface[];
  lifeData: GiftLifeDataInterface[];
  selectedPrice: "ton" | "usd" | "onSale" | "volume" | "salesCount";
  percentChange: number;
  setPercentChange: (value: number) => void;
  onDataUpdate?: (data: { currentValue: number | null }) => void;
}

export default function LineChart({
  weekData,
  lifeData,
  selectedPrice,
  percentChange,
  setPercentChange,
  onDataUpdate,
}: LineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);
  const [list, setList] = useState<
    (GiftLifeDataInterface | GiftWeekDataInterface)[]
  >(weekData.slice(-24));
  const [listType, setListType] = useState<
    "24h" | "3d" | "1w" | "1m" | "3m" | "all"
  >("24h");
  const [low, setLow] = useState<number>();
  const [high, setHigh] = useState<number>();
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
      percentChange >= 0 ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)";
    const bottomColor =
      percentChange >= 0 ? "rgba(34, 197, 94, 0)" : "rgba(239, 68, 68, 0)";

    gradient.addColorStop(0, topColor);
    gradient.addColorStop(1, bottomColor);

    setGradient(gradient);
  }, [percentChange]);

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
        setLow(Math.min(...prices));
        setHigh(Math.max(...prices));
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        setLow(prices.length > 0 ? Math.min(...prices) : undefined);
        setHigh(prices.length > 0 ? Math.max(...prices) : undefined);
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
        setLow(Math.min(...prices));
        setHigh(Math.max(...prices));
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        setLow(prices.length > 0 ? Math.min(...prices) : undefined);
        setHigh(prices.length > 0 ? Math.max(...prices) : undefined);
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
        setLow(Math.min(...amounts));
        setHigh(Math.max(...amounts));
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        setLow(amounts.length > 0 ? Math.min(...amounts) : undefined);
        setHigh(amounts.length > 0 ? Math.max(...amounts) : undefined);
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
        setLow(Math.min(...volumes));
        setHigh(Math.max(...volumes));
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        setLow(volumes.length > 0 ? Math.min(...volumes) : undefined);
        setHigh(volumes.length > 0 ? Math.max(...volumes) : undefined);
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
        setLow(Math.min(...counts));
        setHigh(Math.max(...counts));
        currentValue = Number.isFinite(lastData) ? lastData : null;
      } else {
        calculatedPercentChange = 0;
        setLow(counts.length > 0 ? Math.min(...counts) : undefined);
        setHigh(counts.length > 0 ? Math.max(...counts) : undefined);
        currentValue =
          counts.length > 0 && Number.isFinite(counts[counts.length - 1])
            ? counts[counts.length - 1]
            : null;
      }
    }

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
        external: function (context) {
          const { chart, tooltip } = context;
          const ctx = chart.ctx;

          if (!tooltip || !tooltip.opacity) {
            // Tooltip hidden → reset last index
            if ((chart as any).lastActiveIndex !== null) {
              (chart as any).lastActiveIndex = null;
            }
            return;
          }

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

          const currentIndex = tooltip.dataPoints?.[0]?.dataIndex;

          if (currentIndex !== undefined) {
            const lastIndex = (chart as any).lastActiveIndex;

            // Vibrate only when moving to a NEW point
            if (lastIndex !== null && lastIndex !== currentIndex) {
              vibrate();
            }

            (chart as any).lastActiveIndex = currentIndex;
          } else {
            (chart as any).lastActiveIndex = null;
          }
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
          display: false,
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
      <Line
        ref={chartRef as any}
        data={data}
        options={options}
        height={window.innerWidth < 1080 ? 200 : 150}
      />
      <div className='w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-3xl time-gap-buttons'>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "all"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            if (lifeData.length > 0) setListType("all");
            vibrate();
          }}>
          {translateTime("all")}
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "3m"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            if (lifeData.length > 0) setListType("3m");
            vibrate();
          }}>
          3{translateTime("month")}
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "1m"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            if (lifeData.length > 0) setListType("1m");
            vibrate();
          }}>
          1{translateTime("month")}
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "1w"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            setListType("1w");
            vibrate();
          }}>
          1{translateTime("week")}
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "3d"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            setListType("3d");
            vibrate();
          }}>
          3{translateTime("day")}
        </button>
        <button
          className={`w-full px-1 text-sm h-8 ${
            listType === "24h"
              ? "rounded-3xl bg-secondary font-bold"
              : "text-secondaryText"
          }`}
          onClick={() => {
            setListType("24h");
            vibrate();
          }}>
          24{translateTime("hour")}
        </button>
      </div>
    </div>
  );
}
