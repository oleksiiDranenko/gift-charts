"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  CandlestickSeries,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import useVibrate from "@/hooks/useVibrate";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { parse, format, addDays } from "date-fns";

const TIME_RANGES: {
  key: "2w" | "1m" | "2m" | "3m" | "6m" | "1y" | "all";
  label: (t: (key: string) => string) => string;
}[] = [
  { key: "2w", label: (t) => `2${t("week")}` },
  { key: "1m", label: (t) => `1${t("month")}` },
  { key: "2m", label: (t) => `2${t("month")}` },
  { key: "3m", label: (t) => `3${t("month")}` },
  { key: "6m", label: (t) => `6${t("month")}` },
  { key: "1y", label: (t) => `1${t("year")}` },
  { key: "all", label: (t) => t("all") },
];

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const [listType, setListType] =
    useState<(typeof TIME_RANGES)[number]["key"]>("2w");
  const [list, setList] = useState<GiftLifeDataInterface[]>([]);

  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translateTime = useTranslations("timegap");

  // 1. Logic to process and filter data (Matches your original logic)
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
        const todayWeekData = weekData.filter((item) => item.date === todayStr);
        if (todayWeekData.length > 0) {
          const sortedTodayData = [...todayWeekData].sort((a, b) =>
            a.time.localeCompare(b.time)
          );
          const prices = sortedTodayData
            .map((item) => item.priceTon)
            .filter((v): v is number => v != null);

          updatedData = [
            ...data,
            {
              _id: `temp-${todayStr}`,
              name: sortedTodayData[0].name,
              date: todayStr,
              priceTon: sortedTodayData[sortedTodayData.length - 1].priceTon,
              priceUsd: 0,
              openTon: sortedTodayData[0].priceTon,
              closeTon: sortedTodayData[sortedTodayData.length - 1].priceTon,
              highTon: Math.max(...prices),
              lowTon: Math.min(...prices),
            },
          ];
        }
      }
    }

    const slices = {
      "2w": -14,
      "1m": -30,
      "2m": -60,
      "3m": -90,
      "6m": -180,
      "1y": -360,
      all: 0,
    };
    setList(
      slices[listType] === 0 ? updatedData : updatedData.slice(slices[listType])
    );
  }, [listType, data, weekData]);

  // 2. Sync Percent Change
  useEffect(() => {
    if (list.length === 0) {
      setPercentChange(0);
      onDataUpdate?.({ currentValue: null });
      return;
    }
    const firstOpen = list[0].openTon ?? 0;
    const lastClose = list[list.length - 1].closeTon ?? 0;
    const change =
      firstOpen !== 0 ? ((lastClose - firstOpen) / firstOpen) * 100 : 0;

    setPercentChange(parseFloat(change.toFixed(2)));
    onDataUpdate?.({ currentValue: lastClose });
  }, [list, setPercentChange, onDataUpdate]);

  // 3. Initialize Lightweight Chart
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
        borderVisible: false,
        scaleMargins: { top: 0.15, bottom: 0.2 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      handleScroll: false,
      handleScale: false,
      height: window.innerWidth < 1080 ? 250 : 450,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#14cc00",
      downColor: "#ff0303",
      borderVisible: false,
      wickUpColor: "#14cc00",
      wickDownColor: "#ff0303",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [resolvedTheme]);

  // 4. Update Series Data
  useEffect(() => {
    if (!seriesRef.current || list.length === 0) return;

    const formattedData = list
      .map((item) => {
        const dateParts = item.date.split("-");
        const dateObj = new Date(
          parseInt(dateParts[2]),
          parseInt(dateParts[1]) - 1,
          parseInt(dateParts[0])
        );

        return {
          time: Math.floor(dateObj.getTime() / 1000) as UTCTimestamp,
          open: item.openTon ?? 0,
          high: item.highTon ?? 0,
          low: item.lowTon ?? 0,
          close: item.closeTon ?? 0,
        };
      })
      .sort((a, b) => (a.time as number) - (b.time as number));

    seriesRef.current.setData(formattedData);
    chartRef.current?.timeScale().fitContent();
  }, [list]);

  return (
    <div
      className={`relative w-full ${
        resolvedTheme !== "dark" && "bg-secondaryTransparent rounded-3xl"
      }`}>
      <div ref={chartContainerRef} className='w-full' />

      <div className='w-full mt-3 p-2 flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl time-gap-buttons'>
        {TIME_RANGES.map(({ key, label }) => (
          <button
            key={key}
            className={`w-full px-3 py-2 text-sm text-nowrap transition-colors rounded-3xl ${
              listType === key
                ? "bg-primary font-bold text-white"
                : "text-secondaryText"
            }`}
            onClick={() => {
              setListType(key);
              vibrate();
            }}>
            {label(translateTime)}
          </button>
        ))}
      </div>
    </div>
  );
}
