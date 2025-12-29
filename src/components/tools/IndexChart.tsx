"use client";

import useVibrate from "@/hooks/useVibrate";
import { IndexDataInterface } from "@/interfaces/IndexDataInterface";
import { IndexInterface } from "@/interfaces/IndexInterface";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
import { useAppSelector } from "@/redux/hooks";
import { useTheme } from "next-themes";
import { IndexMonthDataInterface } from "@/interfaces/IndexMonthDataInterface";
import { Gift } from "lucide-react";
import { useTranslations } from "next-intl";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Tooltip,
  CategoryScale,
  Filler
);

interface PropsInterface {
  index: IndexInterface;
  indexData: IndexDataInterface[];
  indexMonthData: IndexMonthDataInterface[];
}

export default function IndexChart({
  index,
  indexData,
  indexMonthData,
}: PropsInterface) {
  const vibrate = useVibrate();
  const giftsList = useAppSelector((state) => state.giftsList);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartJS<"line">>(null);

  const [selectedPrice, setSelectedPrice] = useState<"ton" | "usd">("ton");
  const [percentChange, setPercentChange] = useState<number>(0);

  const [list, setList] = useState<IndexDataInterface[]>(indexData);

  const [listType, setListType] = useState<
    "1d" | "3d" | "1w" | "1m" | "3m" | "all"
  >("1d");
  const [low, setLow] = useState<number>();
  const [high, setHigh] = useState<number>();

  const { resolvedTheme } = useTheme();

  const translateTimegap = useTranslations("indexTimegap");

  // Prevent scroll when interacting with chart
  useEffect(() => {
    const chartContainer = chartContainerRef.current;
    if (!chartContainer) return;

    const preventScroll = (e: TouchEvent) => e.preventDefault();

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

  // ✅ FIX #2: keep latest document always at end of list
  // ✅ update list based on listType and handle "VOL" differently
  useEffect(() => {
    if (!indexMonthData || indexMonthData.length === 0) return;

    const latestDoc = indexMonthData[indexMonthData.length - 1]; // newest doc

    // Helper to sum the last 48 month docs for VOL
    const getSummedDoc = (): IndexDataInterface => {
      const last48 = indexMonthData.slice(-48);
      const totalTon = last48.reduce(
        (acc, item) => acc + (item.priceTon || 0),
        0
      );
      const totalUsd = last48.reduce(
        (acc, item) => acc + (item.priceUsd || 0),
        0
      );

      return {
        ...latestDoc,
        priceTon: totalTon,
        priceUsd: totalUsd,
        date: latestDoc.date,
      };
    };

    const ensureUnique = (arr: IndexDataInterface[]) =>
      arr.filter(
        (v, i, a) =>
          a.findIndex((t) => t.date === v.date && t.priceTon === v.priceTon) ===
          i
      );

    let newList: IndexDataInterface[] = [];

    switch (listType) {
      case "1d":
        newList = [...indexMonthData.slice(-48), latestDoc];
        break;

      case "3d":
        newList = [...indexMonthData.slice(-144), latestDoc];
        break;

      case "1w":
        newList = [...indexMonthData.slice(-7 * 48), latestDoc];
        break;

      case "1m":
        newList = [...indexMonthData, latestDoc];
        break;

      case "3m":
        newList =
          index.shortName === "VOL"
            ? [...indexData.slice(-90), getSummedDoc()]
            : [...indexData.slice(-90), latestDoc];
        break;

      case "all":
        newList =
          index.shortName === "VOL"
            ? [...indexData, getSummedDoc()]
            : [...indexData, latestDoc];
        break;
    }

    setList(ensureUnique(newList));
  }, [listType, indexData, indexMonthData, index.shortName]);

  // Calculate change
  useEffect(() => {
    if (!list || list.length === 0) return;

    const prices = list.map((item) =>
      selectedPrice === "ton" ? item.priceTon : item.priceUsd
    );
    const first = prices[0];
    const last = prices[prices.length - 1];
    const pct =
      first === 0 ? 0 : parseFloat((((last - first) / first) * 100).toFixed(2));
    setPercentChange(pct);
    setLow(Math.min(...prices));
    setHigh(Math.max(...prices));
  }, [selectedPrice, list]);

  const formatNumber = (num: number) =>
    num >= 1_000_000
      ? `${(num / 1_000_000).toFixed(2)}M`
      : num >= 1_000
      ? `${(num / 1_000).toFixed(2)} K`
      : num.toFixed(2);

  const formatNumberWithDots = (value: number, type: string) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    if (type === "price") {
      // two decimal places, comma thousands separator, dot decimal
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    if (type === "amount") {
      // integer style with thousands separator, no decimals
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(value));
    }

    if (type === "percent") {
      // percent display - show two decimals
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    // fallback
    return new Intl.NumberFormat("en-US").format(value);
  };

  const data = {
    labels: list.map((item) => item.date.slice(0, 5)),
    datasets: [
      {
        label: "Index Price",
        data: list.map((item) =>
          selectedPrice === "ton" ? item.priceTon : item.priceUsd
        ),
        borderColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
        borderWidth: 1,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        backgroundColor: (context: any) => {
          const { ctx, chartArea } = context.chart;

          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom
          );

          const isUp = percentChange >= 0;
          const base = isUp ? "34, 197, 94" : "239, 68, 68"; // RGB only

          // fade from 1 → 0
          gradient.addColorStop(0, `rgba(${base}, 1)`); // fully opaque
          gradient.addColorStop(1, `rgba(${base}, 0)`); // fully transparent

          return gradient;
        },
        pointBackgroundColor: percentChange >= 0 ? "#22c55e" : "#ef4444",
      },
    ],
  };

  // ✅ FIX #3: move Math.max/min inside safe guards
  const yData = data.datasets[0].data as number[];

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          title: (tooltipItems) => list[tooltipItems[0].dataIndex].date,
          label: (tooltipItem) =>
            `Value: ${formatNumberWithDots(tooltipItem.raw as number, "price")}
            `,
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
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.6)"
              : "rgba(0, 0, 0, 0.6)",
          autoSkip: true,
          maxTicksLimit: 3,
        },
      },
      y: {
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
          callback: (v) => formatNumber(Number(v)),
        },
        position: "right",
        suggestedMax: yData.length ? Math.max(...yData) * 1.1 : undefined,
        suggestedMin: yData.length ? Math.min(...yData) * 0.9 : undefined,
      },
    },
  };

  return (
    <>
      <div className='w-full px-3 dark:px-0'>
        <div className='h-auto w-full block pl-3 pr-3 lg:hidden dark:bg-background bg-secondaryTransparent rounded-3xl'>
          <div className='w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center'>
            <div className='w-3/5 h-full flex items-center'>
              <h1 className='flex flex-col ml-3'>
                <span className='text-lg font-bold'>{index.name}</span>
                <span className='text-secondaryText text-sm flex justify-start'>
                  Index
                </span>
              </h1>
            </div>

            <div className='w-2/5 h-14 pr-3 flex flex-col items-end justify-center'>
              <div className='flex flex-row items-center'>
                {index.valueType === "amount" ? (
                  <Gift size={15} className='mr-1' />
                ) : index.valueType === "percent" ? null : selectedPrice ===
                  "ton" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={14}
                    height={14}
                    className='mr-1'
                  />
                ) : (
                  <Image
                    alt='usdt'
                    src='/images/usdt.svg'
                    width={14}
                    height={14}
                    className='mr-1'
                  />
                )}
                <span className='text-base font-extrabold'>
                  {selectedPrice == "ton"
                    ? formatNumberWithDots(
                        Number(list[list.length - 1]?.priceTon),
                        "price"
                      )
                    : formatNumberWithDots(
                        Number(list[list.length - 1]?.priceUsd),
                        "price"
                      )}
                  {index.valueType === "percent" && "%"}
                </span>
              </div>

              <span
                className={`text-sm font-bold ${
                  percentChange >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                {(percentChange > 0 ? "+" : "") + percentChange + "%"}
              </span>
            </div>
          </div>

          {index.valueType === "price" && (
            <div className='w-full mb-2 mt-3 flex flex-row justify-between'>
              <div className='flex flex-row box-border bg-background dark:bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-xs h-8 px-3 ${
                    selectedPrice == "ton"
                      ? "rounded-3xl bg-secondary dark:bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice("ton");
                    vibrate();
                  }}>
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className=''
                  />
                </button>
                <button
                  className={`text-xs h-8 px-3 ${
                    selectedPrice == "usd"
                      ? "rounded-3xl bg-secondary dark:bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice("usd");
                    vibrate();
                  }}>
                  <Image
                    alt='ton'
                    src='/images/usdt.svg'
                    width={18}
                    height={18}
                    className=''
                  />
                </button>
              </div>
            </div>
          )}

          <div
            className={
              resolvedTheme === "dark"
                ? "relative w-full"
                : "w-full relative bg-secondaryTransparent rounded-xl"
            }
            ref={chartContainerRef}>
            <Line
              ref={chartRef}
              data={data}
              options={options}
              height={window.innerWidth < 1080 ? 200 : 150}
            />
            <div className='w-full mt-1 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-3xl'>
              {["all", "3m", "1m", "1w", "3d", "1d"].map((type) => (
                <button
                  key={type}
                  className={`w-full px-1 text-sm h-8 ${
                    listType === type
                      ? "rounded-3xl bg-secondary font-bold"
                      : "text-secondaryText"
                  }`}
                  onClick={() => {
                    setListType(type as any);
                    vibrate();
                  }}>
                  {translateTimegap(type)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LARGE SCREEN */}
      {/* LARGE SCREEN */}
      {/* LARGE SCREEN */}
      {/* LARGE SCREEN */}

      <div className='hidden lg:flex flex-row box-border'>
        <div className='w-1/4 flex flex-col justify-start mr-3 pt-3 px-3 border-r-2 border-secondaryTransparent'>
          <h1 className='flex flex-row items-center'>
            <span>{index.name}</span>
          </h1>

          <div className='flex flex-row flex-wrap items-center gap-x-2 mt-2'>
            <div className='flex flex-row items-center mb-1'>
              <div className='flex flex-row items-center flex-nowrap'>
                {index.valueType === "amount" ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-6 mr-1'>
                    <path d='M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z' />
                  </svg>
                ) : index.valueType === "percent" ? null : selectedPrice ===
                  "ton" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={24}
                    height={24}
                    className='mr-1'
                  />
                ) : (
                  <Image
                    alt='usdt'
                    src='/images/usdt.svg'
                    width={24}
                    height={24}
                    className='mr-1'
                  />
                )}
              </div>
              <span className='text-2xl font-bold'>
                {selectedPrice == "ton"
                  ? formatNumberWithDots(
                      Number(list[list.length - 1]?.priceTon),
                      "price"
                    )
                  : formatNumberWithDots(
                      Number(list[list.length - 1]?.priceUsd),
                      "price"
                    )}
                {index.valueType === "percent" && "%"}
              </span>
            </div>

            <span
              className={`text-sm font-bold ${
                percentChange >= 0 ? "text-green-500" : "text-red-500"
              }`}>
              {(percentChange > 0 ? "+" : "") + percentChange + "%"}
            </span>
          </div>
        </div>

        <div className='w-3/4'>
          {index.valueType === "price" && (
            <div className='w-full mb-2 mt-5 flex flex-row justify-between'>
              <div className='flex flex-row box-border bg-secondaryTransparent rounded-xl gap-x-1'>
                <button
                  className={`text-xs h-8 px-3 ${
                    selectedPrice == "ton"
                      ? "rounded-xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice("ton");
                    vibrate();
                  }}>
                  Ton
                </button>
                <button
                  className={`text-xs h-8 px-3 ${
                    selectedPrice == "usd"
                      ? "rounded-xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedPrice("usd");
                    vibrate();
                  }}>
                  Usd
                </button>
              </div>
            </div>
          )}

          <div
            className={
              resolvedTheme === "dark"
                ? "relative w-full"
                : "w-full relative bg-secondaryTransparent rounded-xl"
            }
            ref={chartContainerRef}>
            <Line ref={chartRef} data={data} options={options} />
          </div>

          <div className='w-full mt-3 p-1 flex flex-row overflow-x-scroll bg-secondaryTransparent rounded-xl'>
            {["all", "3m", "1m", "1w", "3d", "1d"].map((type) => (
              <button
                key={type}
                className={`w-full px-1 text-sm h-8 ${
                  listType === type
                    ? "rounded-xl bg-secondary font-bold"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setListType(type as any);
                  vibrate();
                }}>
                {translateTimegap(type)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
