"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  MouseEventParams,
  UTCTimestamp,
  AreaSeries,
  LineType,
  HistogramSeries,
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

const TIME_RANGES: {
  key: "24h" | "1w" | "1m" | "3m" | "6m" | "all";
  label: (t: (key: string) => string) => string;
  requiresLifeData?: boolean;
}[] = [
  { key: "24h", label: (t) => `24${t("hour")}` },
  { key: "1w", label: (t) => `1${t("week")}` },
  { key: "1m", label: (t) => `1${t("month")}`, requiresLifeData: true },
  { key: "3m", label: (t) => `3${t("month")}`, requiresLifeData: true },
  { key: "6m", label: (t) => `6${t("month")}`, requiresLifeData: true },
  { key: "all", label: (t) => t("all"), requiresLifeData: true },
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
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const lastVibratedIndex = useRef<number | null>(null);

  const [list, setList] = useState<
    (GiftLifeDataInterface | GiftWeekDataInterface)[]
  >([]);
  const [listType, setListType] =
    useState<(typeof TIME_RANGES)[number]["key"]>("24h");

  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translateTime = useTranslations("timegap");

  // Handle Data Filtering (Logic kept from your original code)
  useEffect(() => {
    const lastPriceIndex = weekData.length - 1;
    if (lastPriceIndex < 0) {
      const slices = { "1m": -30, "3m": -90, "6m": -180, "1y": -360 };
      if (["24h", "3d", "1w"].includes(listType)) setList([]);
      else
        setList(lifeData.slice(slices[listType as keyof typeof slices] || 0));
      return;
    }

    const lastWeekData = weekData[lastPriceIndex];
    const aggregatedWeekData = {
      ...lastWeekData,
      volume: weekData
        .filter((i) => i.date === lastWeekData.date)
        .reduce((s, i) => s + (i.volume ?? 0), 0),
      salesCount: weekData
        .filter((i) => i.date === lastWeekData.date)
        .reduce((s, i) => s + (i.salesCount ?? 0), 0),
    };

    const map = {
      "24h": weekData.slice(-48),
      "3d": weekData.slice(-144),
      "1w": weekData,
      "1m": [...lifeData.slice(-30), aggregatedWeekData],
      "3m": [...lifeData.slice(-90), aggregatedWeekData],
      "6m": [...lifeData.slice(-180), aggregatedWeekData],
      "1y": [...lifeData.slice(-360), aggregatedWeekData],
      all: [...lifeData, aggregatedWeekData],
    };
    setList(map[listType]);
  }, [listType, lifeData, weekData]);

  useEffect(() => {
    if (list.length === 0) {
      setPercentChange(0);
      onDataUpdate?.({ currentValue: null });
      return;
    }

    const getVal = (item: any) => {
      const valMap = {
        ton: "priceTon",
        usd: "priceUsd",
        onSale: "amountOnSale",
        volume: "volume",
        salesCount: "salesCount",
      };
      return item[valMap[selectedPrice]];
    };

    const values = list.map(getVal).filter((v): v is number => v != null);
    if (values.length > 0) {
      const first = values[0];
      const last = values[values.length - 1];
      const change = first !== 0 ? ((last - first) / first) * 100 : 0;
      setPercentChange(parseFloat(change.toFixed(2)));
      onDataUpdate?.({ currentValue: last });
    }
  }, [selectedPrice, list, setPercentChange, onDataUpdate]);

  // 3. Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(0, 0, 0, 0.6)",
        fontSize: 11,
        attributionLogo: false,
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
        borderVisible: false,
        autoScale: true,
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: false,
      handleScale: false,
      height: window.innerWidth < 1080 ? 250 : 450,
    });

    const series = chart.addSeries(AreaSeries, {
      lineWidth: 1,
      lineType: LineType.Curved,
      lastValueVisible: true,

      priceLineVisible: false,
      crosshairMarkerVisible: true,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#3b82f680",
      priceFormat: { type: "volume" },
      priceScaleId: "volume-axis",
      lastValueVisible: false,
      priceLineVisible: false,
    });

    chart.priceScale("volume-axis").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.logical && param.logical !== lastVibratedIndex.current) {
        vibrate();
        lastVibratedIndex.current = param.logical as number;
      }
    });

    chartRef.current = chart;
    seriesRef.current = series;
    volumeSeriesRef.current = volumeSeries;

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

  useEffect(() => {
    if (!seriesRef.current || !volumeSeriesRef.current || list.length === 0)
      return;

    const isPositive = percentChange >= 0;
    const color = isPositive ? "#22c55e" : "#ef4444";
    const topColor = isPositive
      ? "rgba(34, 197, 94, 0.4)"
      : "rgba(239, 68, 68, 0.4)";
    const bottomColor = isPositive
      ? "rgba(34, 197, 94, 0.001)"
      : "rgba(239, 68, 68, 0.001)";

    seriesRef.current.applyOptions({
      lineColor: color,
      topColor: topColor,
      bottomColor: bottomColor,
      priceLineColor: isPositive ? "#178941" : "#ef4444",
    });

    const processedData = list
      .map((item) => {
        const dateParts = item.date.split("-");
        let hours = 0,
          minutes = 0;
        if ("time" in item && item.time) {
          const timeParts = item.time.split(":");
          hours = parseInt(timeParts[0]);
          minutes = parseInt(timeParts[1]);
        }
        const timestamp = Math.floor(
          new Date(
            parseInt(dateParts[2]),
            parseInt(dateParts[1]) - 1,
            parseInt(dateParts[0]),
            hours,
            minutes
          ).getTime() / 1000
        ) as UTCTimestamp;

        const valMap = {
          ton: "priceTon",
          usd: "priceUsd",
          onSale: "amountOnSale",
          volume: "volume",
          salesCount: "salesCount",
        };
        return {
          time: timestamp,
          value: (item as any)[valMap[selectedPrice]] ?? 0,
          vol: item.volume ?? 0,
        };
      })
      .sort((a, b) => (a.time as number) - (b.time as number))
      .filter((item, i, self) => i === 0 || item.time !== self[i - 1].time);

    seriesRef.current.setData(
      processedData.map((d) => ({ time: d.time, value: d.value }))
    );
    volumeSeriesRef.current.setData(
      processedData.map((d) => ({ time: d.time, value: d.vol }))
    );
    chartRef.current?.timeScale().fitContent();
  }, [list, selectedPrice, percentChange]);

  return (
    <div
      className={`relative w-full ${
        resolvedTheme !== "dark" && "bg-secondaryTransparent rounded-3xl"
      }`}>
      <div ref={chartContainerRef} className='w-full' />

      <div className='w-full pr-3'>
        <div className='w-full mt-3 flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl time-gap-buttons'>
          {TIME_RANGES.map(({ key, label, requiresLifeData }) => {
            const isActive = listType === key;
            const isDisabled = requiresLifeData && lifeData.length === 0;

            return (
              <button
                key={key}
                disabled={isDisabled}
                className={`w-full px-3 h-10 text-sm text-nowrap transition-colors rounded-3xl ${
                  isActive ? "bg-secondary font-bold" : "text-secondaryText"
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
