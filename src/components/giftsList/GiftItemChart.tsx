"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  AreaSeries,
  Time,
} from "lightweight-charts";
import { GiftListItemInterface } from "@/interfaces/GiftListItemInterface";
import { useTheme } from "next-themes";

interface GiftItemChartProps {
  gift: GiftListItemInterface;
  height: number; // Height remains fixed or prop-based
}

const GiftItemChart = ({ gift, height }: GiftItemChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  // 1. Memoize data to prevent unnecessary recalculations on parent resize
  const formattedData = useMemo(() => {
    const chartDataPoints = gift.chartData || [];
    return chartDataPoints
      .map((point) => ({
        time: Math.floor(new Date(point.createdAt).getTime() / 1000) as Time,
        value: point.price,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));
  }, [gift.chartData]);

  const priceChange =
    formattedData.length > 1
      ? formattedData[formattedData.length - 1].value - formattedData[0].value
      : 0;

  const color = priceChange >= 0 ? "#22c55e" : "#ef4444";
  const topColor =
    priceChange >= 0 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)";

  useEffect(() => {
    if (!chartContainerRef.current || formattedData.length === 0) return;

    // 2. Initialize with 0 width; we will resize immediately after
    const chart = createChart(chartContainerRef.current, {
      height: height,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "transparent",
        attributionLogo: false, // Removes the logo
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false, borderVisible: false },
      timeScale: { visible: false, borderVisible: false },
      handleScale: false,
      handleScroll: false,
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: topColor,
      bottomColor:
        priceChange >= 0
          ? "rgba(34, 197, 94, 0.01)"
          : "rgba(239, 68, 68, 0.01)",
      lineWidth: 1,
      priceLineVisible: false,
      crosshairMarkerVisible: false,
      lastValueVisible: false,
    });

    areaSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    // 3. Responsive Resize Logic
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    // Trigger initial resize
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [formattedData, height, color, topColor]);

  if (formattedData.length === 0) return null;

  return (
    <div
      ref={chartContainerRef}
      className='rounded-b-md overflow-hidden pointer-events-none w-full'
      style={{ height }} // Width is handled by CSS 'w-full'
    />
  );
};

export default GiftItemChart;
