"use client";

import { useEffect, useRef, useMemo, useCallback, useState } from "react";
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
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const { resolvedTheme } = useTheme();
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0,
  });

  // 1. Memoize data to prevent unnecessary recalculations on parent resize
  const formattedData = useMemo(() => {
    const chartDataPoints = gift.chartData || [];
    const processedData = chartDataPoints
      .map((point) => ({
        time: Math.floor(new Date(point.createdAt).getTime() / 1000) as Time,
        value: point.price,
      }))
      .sort((a, b) => (a.time as number) - (b.time as number));

    // Remove duplicate timestamps - keep the last occurrence for each timestamp
    const deduplicatedData = processedData.reduce(
      (acc, current) => {
        const existingIndex = acc.findIndex(
          (item) => item.time === current.time,
        );
        if (existingIndex !== -1) {
          // Replace existing entry with current one (keeps the last occurrence)
          acc[existingIndex] = current;
        } else {
          acc.push(current);
        }
        return acc;
      },
      [] as typeof processedData,
    );

    return deduplicatedData;
  }, [gift.chartData]);

  const priceChange =
    formattedData.length > 1
      ? formattedData[formattedData.length - 1].value - formattedData[0].value
      : 0;

  // Memoize colors to prevent unnecessary recalculations
  const chartColors = useMemo(() => {
    const baseColor = priceChange >= 0 ? "#22c55e" : "#ef4444";
    return {
      lineColor: baseColor,
      topColor:
        priceChange >= 0 ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)",
      bottomColor:
        priceChange >= 0
          ? "rgba(34, 197, 94, 0.01)"
          : "rgba(239, 68, 68, 0.01)",
    };
  }, [priceChange]);

  // Handle container resize with ResizeObserver for better reliability
  const handleContainerResize = useCallback(() => {
    if (chartContainerRef.current) {
      const { clientWidth, clientHeight } = chartContainerRef.current;
      setContainerDimensions({ width: clientWidth, height: clientHeight });

      // Update chart dimensions if chart exists
      if (chartRef.current && clientWidth > 0) {
        chartRef.current.applyOptions({ width: clientWidth });
      }
    }
  }, []);

  // Initialize ResizeObserver
  useEffect(() => {
    if (!chartContainerRef.current) return;

    resizeObserverRef.current = new ResizeObserver(handleContainerResize);
    resizeObserverRef.current.observe(chartContainerRef.current);

    // Initial dimension check
    handleContainerResize();

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [handleContainerResize]);

  // Chart initialization and management
  useEffect(() => {
    // Only create chart if we have data and valid container dimensions
    if (
      !chartContainerRef.current ||
      formattedData.length === 0 ||
      containerDimensions.width === 0
    ) {
      return;
    }

    // Clean up existing chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    try {
      // Initialize chart with proper dimensions
      const chart = createChart(chartContainerRef.current, {
        width: containerDimensions.width,
        height: height,
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: "transparent",
          attributionLogo: false,
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
        lineColor: chartColors.lineColor,
        topColor: chartColors.topColor,
        bottomColor: chartColors.bottomColor,
        lineWidth: 1,
        priceLineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
      });

      areaSeries.setData(formattedData);
      chart.timeScale().fitContent();

      chartRef.current = chart;
    } catch (error) {
      console.error("Failed to create chart:", error);
    }

    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          console.error("Failed to remove chart:", error);
        }
        chartRef.current = null;
      }
    };
  }, [formattedData, height, chartColors, containerDimensions.width]);

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
