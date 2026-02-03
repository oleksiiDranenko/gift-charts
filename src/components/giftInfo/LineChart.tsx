"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  MouseEventParams,
  UTCTimestamp,
  AreaSeries,
  LineType,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import useVibrate from "@/hooks/useVibrate";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

interface LineChartProps {
  weekData: GiftWeekDataInterface[];
  lifeData: GiftLifeDataInterface[];
  selectedPrice: "ton" | "usd" | "onSale" | "volume" | "salesCount";
  percentChange: number;
  setPercentChange: (value: number) => void;
  onDataUpdate?: (data: { currentValue: number | null }) => void;
}
//d

const TIME_RANGES: {
  key: "24h" | "1w" | "1m" | "3m" | "6m" | "all";
  label: (t: (key: string) => string) => string;
  requiresLifeData?: boolean;
}[] = [
  { key: "all", label: (t) => t("all"), requiresLifeData: true },
  { key: "6m", label: (t) => `6${t("month")}`, requiresLifeData: true },
  { key: "3m", label: (t) => `3${t("month")}`, requiresLifeData: true },
  { key: "1m", label: (t) => `1${t("month")}`, requiresLifeData: true },
  { key: "1w", label: (t) => `1${t("week")}` },
  { key: "24h", label: (t) => `24${t("hour")}` },
];

export default function LineChart({
  weekData,
  lifeData,
  selectedPrice,
  percentChange,
  setPercentChange,
  onDataUpdate,
}: LineChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const lastVibratedIndex = useRef<number | null>(null);

  const [listType, setListType] =
    useState<(typeof TIME_RANGES)[number]["key"]>("24h");

  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translateTime = useTranslations("timegap");

  // Format Helper
  const getVal = (item: GiftLifeDataInterface | GiftWeekDataInterface) => {
    if (selectedPrice === "ton") return item.priceTon;
    if (selectedPrice === "usd") return item.priceUsd;
    if (selectedPrice === "onSale") return item.amountOnSale;
    if (selectedPrice === "volume") return item.volume;
    if (selectedPrice === "salesCount") return item.salesCount;
    return 0;
  };

  const parseToTimestamp = (
    item: GiftLifeDataInterface | GiftWeekDataInterface,
  ): UTCTimestamp => {
    const dateParts = item.date.split("-");
    let hours = 0,
      minutes = 0;
    if ("time" in item && item.time) {
      const timeParts = item.time.split(":");
      hours = parseInt(timeParts[0], 10);
      minutes = parseInt(timeParts[1], 10);
    }
    const dateObj = new Date(Date.UTC(
      parseInt(dateParts[2]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[0]),
      hours,
      minutes,
      0,
    ));
    return Math.floor(dateObj.getTime() / 1000) as UTCTimestamp;
  };

  // 1. Process High-Granularity Week Data
  const formattedWeek = useMemo(() => {
    return weekData
      .map((item) => ({
        time: parseToTimestamp(item),
        value: getVal(item) ?? 0,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((v, i, a) => i === 0 || v.time !== a[i - 1].time);
  }, [weekData, selectedPrice]);

  // 2. Process Life Data AND append the latest Week Data point
  const formattedLife = useMemo(() => {
    const life = lifeData.map((item) => ({
      time: parseToTimestamp(item),
      value: getVal(item) ?? 0,
    }));

    // Append the latest point from weekData if it exists
    if (weekData.length > 0) {
      const lastWeekItem = weekData[weekData.length - 1];
      const latestPoint = {
        time: parseToTimestamp(lastWeekItem),
        value: getVal(lastWeekItem) ?? 0,
      };

      // Only append if it's actually newer than the last life point
      if (
        life.length === 0 ||
        (latestPoint.time as number) > (life[life.length - 1].time as number)
      ) {
        life.push(latestPoint);
      }
    }

    return life
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((v, i, a) => i === 0 || v.time !== a[i - 1].time);
  }, [lifeData, weekData, selectedPrice]);

  // Determine current active source
  const currentSource = ["24h", "1w"].includes(listType)
    ? formattedWeek
    : formattedLife;

  // Sync Percent Change and Parent State
  useEffect(() => {
    if (currentSource.length === 0) {
      setPercentChange(0);
      onDataUpdate?.({ currentValue: null });
      return;
    }

    const last = currentSource[currentSource.length - 1].value;
    const now = currentSource[currentSource.length - 1].time as number;
    let lookback = 0;
    const day = 24 * 60 * 60;

    if (listType === "24h") lookback = day;
    else if (listType === "1w") lookback = day * 7;
    else if (listType === "1m") lookback = day * 30;
    else if (listType === "3m") lookback = day * 90;
    else if (listType === "6m") lookback = day * 180;
    else lookback = now - (currentSource[0].time as number);

    const firstPointInRange =
      currentSource.find((d) => (d.time as number) >= now - lookback) ||
      currentSource[0];
    const first = firstPointInRange.value;

    const change = first !== 0 ? ((last - first) / first) * 100 : 0;
    setPercentChange(parseFloat(change.toFixed(2)));
    onDataUpdate?.({ currentValue: last });
  }, [currentSource, listType, setPercentChange, onDataUpdate]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(0, 0, 0, 0.6)",
        attributionLogo: false,
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
        },
      },
      rightPriceScale: {
        visible: true,
        borderVisible: true,
        borderColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
        autoScale: true,
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      height: window.innerWidth < 1080 ? 300 : 500,
      localization: {
        locale: "en-US",
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 2,
      lastValueVisible: true,
      priceLineVisible: true,
      crosshairMarkerVisible: true,
      lineType: LineType.Simple,
    });

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (param.time) {
        const currentIndex = param.logical as number;
        if (currentIndex !== lastVibratedIndex.current) {
          vibrate();
          lastVibratedIndex.current = currentIndex;
        }
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [resolvedTheme]);

  // Update Series Data and Colors
  useEffect(() => {
    if (!seriesRef.current || currentSource.length === 0) return;

    const isPositive = percentChange >= 0;
    seriesRef.current.applyOptions({
      lineColor: isPositive ? "#22c55e" : "#ef4444",
      topColor: isPositive
        ? "rgba(34, 197, 94, 0.5)"
        : "rgba(239, 68, 68, 0.5)",
      bottomColor: isPositive
        ? "rgba(34, 197, 94, 0.001)"
        : "rgba(239, 68, 68, 0.001)",
      priceLineColor: isPositive ? "#178941" : "#ef4444",
    });

    seriesRef.current.setData(currentSource);
  }, [currentSource, percentChange]);

  // Zoom Handling
  useEffect(() => {
    if (!chartRef.current || currentSource.length === 0) return;

    const timeScale = chartRef.current.timeScale();
    const lastTimestamp = currentSource[currentSource.length - 1]
      .time as number;
    const day = 24 * 60 * 60;

    let fromTimestamp: number;

    switch (listType) {
      case "24h":
        fromTimestamp = lastTimestamp - day;
        break;
      case "1w":
        fromTimestamp = lastTimestamp - day * 7;
        break;
      case "1m":
        fromTimestamp = lastTimestamp - day * 30;
        break;
      case "3m":
        fromTimestamp = lastTimestamp - day * 90;
        break;
      case "6m":
        fromTimestamp = lastTimestamp - day * 180;
        break;
      case "all":
        timeScale.fitContent();
        return;
      default:
        fromTimestamp = currentSource[0].time as number;
    }

    timeScale.setVisibleRange({
      from: fromTimestamp as UTCTimestamp,
      to: lastTimestamp as UTCTimestamp,
    });
  }, [listType, currentSource]);

  return (
    <div className='relative w-full'>
      <div ref={chartContainerRef} className='w-full' />
      <div className='w-full pr-3'>
        <div className='w-full mt-2 p-2 flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl'>
          {TIME_RANGES.map(({ key, label, requiresLifeData }) => {
            const isActive = listType === key;
            const isDisabled = requiresLifeData && lifeData.length === 0;

            return (
              <button
                key={key}
                disabled={isDisabled}
                className={`w-full px-3 h-8 text-sm text-nowrap transition-colors rounded-3xl ${
                  isActive
                    ? "bg-primary text-white font-bold"
                    : "text-secondaryText"
                } ${isDisabled ? "opacity-40 cursor-not-allowed" : ""}`}
                onClick={() => {
                  if (!isDisabled) {
                    setListType(key);
                    vibrate();
                  }
                }}>
                {label(translateTime)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
