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

  // Sync Percent Change and Parent State
  useEffect(() => {
    if (list.length === 0) {
      setPercentChange(0);
      onDataUpdate?.({ currentValue: null });
      return;
    }

    const getVal = (item: any) => {
      if (selectedPrice === "ton") return item.priceTon;
      if (selectedPrice === "usd") return item.priceUsd;
      if (selectedPrice === "onSale") return item.amountOnSale;
      if (selectedPrice === "volume") return item.volume;
      if (selectedPrice === "salesCount") return item.salesCount;
      return null;
    };

    const values = list
      .map(getVal)
      .filter((v): v is number => v !== null && v !== undefined);
    if (values.length > 0) {
      const first = values[0];
      const last = values[values.length - 1];
      const change = first !== 0 ? ((last - first) / first) * 100 : 0;
      setPercentChange(parseFloat(change.toFixed(2)));
      onDataUpdate?.({ currentValue: last });
    }
  }, [selectedPrice, list, setPercentChange, onDataUpdate]);

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
      lineColor: "#22c55e",
      topColor: "rgba(34, 197, 94, 0.4)",
      bottomColor: "rgba(0, 0, 0, 0)",
      lineWidth: 1,
      lastValueVisible: true,

      priceLineVisible: true,
      crosshairMarkerVisible: true,
      lineType: LineType.Curved,
    });

    chart.subscribeCrosshairMove((param: MouseEventParams) => {
      if (param.time) {
        // Simple vibration logic on crosshair movement
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

  // Update Series Data
  useEffect(() => {
    if (!seriesRef.current || list.length === 0) return;

    const isPositive = percentChange >= 0;
    const color = isPositive ? "#22c55e" : "#ef4444";
    const topColor = isPositive
      ? "rgba(34, 197, 94, 0.5)"
      : "rgba(239, 68, 68, 0.5";
    const bottomColor = isPositive
      ? "rgba(34, 197, 94, 0.001)"
      : "rgba(239, 68, 68, 0.001)";

    seriesRef.current.applyOptions({
      lineColor: color,
      topColor: topColor,
      bottomColor: bottomColor,
      priceLineColor: isPositive ? "#178941" : "#ef4444",
    });

    const formattedData = list
      .map((item) => {
        // 1. Handle "dd-mm-yyyy"
        const dateParts = item.date.split("-");
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // JS months are 0-11
        const year = parseInt(dateParts[2], 10);

        // 2. Handle "hh:mm" from GiftWeekDataInterface
        let hours = 0;
        let minutes = 0;
        if ("time" in item && item.time) {
          const timeParts = item.time.split(":");
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);
        }

        const dateObj = new Date(year, month, day, hours, minutes, 0);
        const timestamp = Math.floor(dateObj.getTime() / 1000);

        if (isNaN(timestamp)) return null;

        // 3. Map selected value
        const val =
          selectedPrice === "ton"
            ? item.priceTon
            : selectedPrice === "usd"
            ? item.priceUsd
            : selectedPrice === "onSale"
            ? item.amountOnSale
            : selectedPrice === "volume"
            ? item.volume
            : item.salesCount;

        return {
          time: timestamp as UTCTimestamp,
          value: val ?? 0,
        };
      })
      .filter(
        (item): item is { time: UTCTimestamp; value: number } => item !== null
      )
      // 4. Critical: Sort by time ascending
      .sort((a, b) => (a.time as number) - (b.time as number))
      // 5. Critical: Remove duplicate timestamps (Lightweight Charts will crash on duplicates)
      .filter(
        (item, index, self) => index === 0 || item.time !== self[index - 1].time
      );

    if (formattedData.length > 0) {
      seriesRef.current.setData(formattedData);
      chartRef.current?.timeScale().fitContent();
    }
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
