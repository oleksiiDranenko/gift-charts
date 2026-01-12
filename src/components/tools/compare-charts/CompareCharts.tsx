"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  AreaSeries,
  LineType,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useQueries } from "react-query";
import axios from "axios";
import useVibrate from "@/hooks/useVibrate";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

interface CompareChartsProps {
  giftNames: string[];
}

const COLORS = [
  {
    line: "#2962FF",
    top: "rgba(41, 98, 255, 0.3)",
    bottom: "rgba(41, 98, 255, 0)",
  },
  {
    line: "#ef5350",
    top: "rgba(239, 83, 80, 0.3)",
    bottom: "rgba(239, 83, 80, 0)",
  },
  {
    line: "#26a69a",
    top: "rgba(38, 166, 154, 0.3)",
    bottom: "rgba(38, 166, 154, 0)",
  },
];

const TIME_RANGES = [
  { key: "all", label: (t: any) => t("all"), requiresLifeData: true },
  { key: "3m", label: (t: any) => `3${t("month")}`, requiresLifeData: true },
  { key: "1m", label: (t: any) => `1${t("month")}`, requiresLifeData: true },
  { key: "1w", label: (t: any) => `1${t("week")}` },
  { key: "24h", label: (t: any) => `24${t("hour")}` },
] as const;

const fetchGiftDataset = async (name: string) => {
  const [weekRes, lifeRes] = await Promise.all([
    axios.get<GiftWeekDataInterface[]>(
      `${process.env.NEXT_PUBLIC_API}/weekChart`,
      { params: { name } }
    ),
    axios.get<GiftLifeDataInterface[]>(
      `${process.env.NEXT_PUBLIC_API}/lifeChart`,
      { params: { name } }
    ),
  ]);
  return { name, week: weekRes.data, life: lifeRes.data };
};

export default function CompareCharts({ giftNames }: CompareChartsProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<"Area">[]>([]);

  const [listType, setListType] =
    useState<(typeof TIME_RANGES)[number]["key"]>("24h");

  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translateTime = useTranslations("timegap");

  const results = useQueries(
    giftNames.slice(0, 3).map((name) => ({
      queryKey: ["compare-gifts", name],
      queryFn: () => fetchGiftDataset(name),
      staleTime: 1000 * 60 * 5,
    }))
  );

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
        borderVisible: true, // This adds the line at the right side before the numbers
        borderColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      height: window.innerWidth < 1080 ? 300 : 450,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current)
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [resolvedTheme]);

  // Update Series Data when results or listType changes
  useEffect(() => {
    if (!chartRef.current) return;

    // 2. Safely Clear existing series
    if (seriesRefs.current.length > 0) {
      seriesRefs.current.forEach((s) => {
        // Check if series (s) is defined and valid before removing
        if (s) {
          try {
            chartRef.current?.removeSeries(s);
          } catch (e) {
            console.warn("Series already removed or invalid", e);
          }
        }
      });
      seriesRefs.current = [];
    }

    // 3. If still loading, wait
    if (results.some((r) => r.isLoading)) return;

    results.forEach((query, index) => {
      if (!query.data) return;

      const series = chartRef.current!.addSeries(AreaSeries, {
        lineColor: COLORS[index].line,
        topColor: COLORS[index].top,
        bottomColor: COLORS[index].bottom,
        lineWidth: 2,
        lineType: LineType.Simple,
        lastValueVisible: true, // Label in the sidebar
        priceLineVisible: true,
      });

      // Filtering logic based on your LineChart component
      const { week, life } = query.data;
      let filteredList: (GiftWeekDataInterface | GiftLifeDataInterface)[] = [];

      if (["24h", "1w"].includes(listType)) {
        filteredList = listType === "24h" ? week.slice(-48) : week;
      } else {
        const slices = { "1m": -30, "3m": -90, all: 0 };
        filteredList =
          slices[listType as keyof typeof slices] === 0
            ? life
            : life.slice(slices[listType as keyof typeof slices]);
      }

      const formattedData = filteredList
        .map((item) => {
          const dateParts = item.date.split("-");
          const day = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1;
          const year = parseInt(dateParts[2], 10);

          let hours = 0,
            minutes = 0;
          if ("time" in item && item.time) {
            const [h, m] = item.time.split(":").map(Number);
            hours = h;
            minutes = m;
          }

          const timestamp = Math.floor(
            new Date(year, month, day, hours, minutes).getTime() / 1000
          );
          return { time: timestamp as UTCTimestamp, value: item.priceTon };
        })
        .filter((d) => !isNaN(d.time))
        .sort((a, b) => (a.time as number) - (b.time as number))
        .filter((item, i, self) => i === 0 || item.time !== self[i - 1].time);

      series.setData(formattedData);
      seriesRefs.current.push(series);
    });

    chartRef.current.timeScale().fitContent();
  }, [results, listType]);

  return (
    <div
      className={`relative w-full ${
        resolvedTheme === "dark"
          ? ""
          : "p-3 bg-secondaryTransparent rounded-3xl"
      }`}>
      {/* Legend */}
      <div className='flex gap-4 p-4 absolute top-0 left-0 z-10'>
        {results.map(
          (r, i) =>
            r.data && (
              <div key={r.data.name} className='flex items-center gap-2'>
                <div
                  className='w-2 h-2 rounded-full'
                  style={{ backgroundColor: COLORS[i].line }}
                />
                <span className='text-[10px] font-bold uppercase opacity-70'>
                  {r.data.name}
                </span>
              </div>
            )
        )}
      </div>

      <div ref={chartContainerRef} className='w-full' />

      <div className='w-full'>
        <div className='w-full flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl'>
          {TIME_RANGES.map(({ key, label }) => {
            const isActive = listType === key;
            return (
              <button
                key={key}
                className={`w-full px-3 h-10 text-xs text-nowrap transition-colors rounded-3xl ${
                  isActive ? "bg-secondary font-bold" : "text-secondaryText"
                }`}
                onClick={() => {
                  setListType(key);
                  vibrate();
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
