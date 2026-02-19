"use client";

import TreemapChart, {
  TreemapChartRef,
} from "@/components/tools/treemap/TreemapChart";
import useVibrate from "@/hooks/useVibrate";
import { GiftHeatmapInterface } from "@/interfaces/GiftHeatmapInterface";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import BackButton from "@/utils/ui/backButton";
import TreemapControlModal from "@/components/tools/treemap/EditTreemapModal";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import DownloadHeatmapModal from "@/components/tools/treemap/DownloadHeatmapModal";
import AddBanner from "@/components/AddBanner";
import Loader from "@/components/reusable/Loader";

export default function Page() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.warn("Failed to parse settings from localStorage");
        }
      }
    }
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });
  const [list, setList] = useState<GiftHeatmapInterface[]>([]);
  const [listType, setListType] = useState<"change" | "marketCap">("marketCap");
  const [timeGap, setTimeGap] = useState<"24h" | "1w" | "1m">("24h");
  const [currency, setCurrency] = useState<"ton" | "usd">(settings.currency);
  const [heatmapStyle, setHeatmapStyle] = useState<"round" | "default">(
    "default",
  );
  const [isDynamic, setIsDynamic] = useState<boolean>(false);

  const [amount, setAmount] = useState<number>(100);
  const {
    data: giftsHeatmap,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["gifts-heatmap"],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/gifts/heatmap`,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const translate = useTranslations("heatmap");

  const vibrate = useVibrate();
  const totalGifts = giftsHeatmap?.length || 0;
  const chartRef = useRef<TreemapChartRef>(null);

  useEffect(() => {
    if (giftsHeatmap && amount === 100) {
      setAmount(giftsHeatmap.length);
    }
  }, [giftsHeatmap]);

  useEffect(() => {
    if (!giftsHeatmap) return;

    let rawList = [...giftsHeatmap];

    // Note: GiftHeatmapInterface doesn't have preSale field, so we don't filter by it
    let sortedList = rawList;

    switch (listType) {
      case "change":
        sortedList.sort((a, b) => {
          if (timeGap === "24h") {
            const aChange = a.tonPrice24hAgo
              ? Math.abs(
                  ((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100,
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100,
                )
              : 0;
            return bChange - aChange;
          } else if (
            timeGap === "1w" &&
            a.tonPriceWeekAgo &&
            b.tonPriceWeekAgo
          ) {
            const aChange = a.tonPrice24hAgo
              ? Math.abs(
                  ((a.priceTon - a.tonPriceWeekAgo) / a.tonPriceWeekAgo) * 100,
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPriceWeekAgo) / b.tonPriceWeekAgo) * 100,
                )
              : 0;
            return bChange - aChange;
          } else if (
            timeGap === "1m" &&
            a.tonPriceMonthAgo &&
            b.tonPriceMonthAgo
          ) {
            const aChange = a.tonPrice24hAgo
              ? Math.abs(
                  ((a.priceTon - a.tonPriceMonthAgo) / a.tonPriceMonthAgo) *
                    100,
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPriceMonthAgo) / b.tonPriceMonthAgo) *
                    100,
                )
              : 0;
            return bChange - aChange;
          } else {
            return 0;
          }
        });
        break;
      case "marketCap":
        sortedList.sort(
          (a, b) =>
            b.priceTon * b.upgradedSupply - a.priceTon * a.upgradedSupply,
        );
        break;
    }

    setList(sortedList);
  }, [giftsHeatmap, listType, timeGap]);

  return (
    <div className='w-full pt-[0px] pb-24 flex flex-col items-center overflow-visible'>
      <div className='w-full flex flex-col items-center px-3 gap-y-3 mb-3'>
        <div className='w-full lg:w-[98%] mb-2 flex flex-row justify-between items-center gap-x-3'>
          <BackButton />
        </div>

        <div className='w-full lg:w-[98%] gap-x-2 flex flex-row items-center justify-start'>
          <div className='w-full lg:w-fit'>
            <TreemapControlModal
              trigger={
                <button className='lg:w-fit w-full flex flex-row flex-nowrap items-center justify-center gap-x-2 h-8 px-6 text-sm bg-secondary rounded-3xl'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-6'>
                    <path d='M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z' />
                  </svg>
                  <span className='text-nowrap'>
                    {translate("editHeatmap")}
                  </span>
                </button>
              }
              listType={listType}
              timeGap={timeGap}
              currency={currency}
              amount={amount}
              totalGifts={totalGifts}
              onListTypeChange={setListType}
              onTimeGapChange={setTimeGap}
              onCurrencyChange={setCurrency}
              onAmountChange={setAmount}
              onStyleChange={setHeatmapStyle}
              onDynamicColorsChange={setIsDynamic}
              heatmapStyle={heatmapStyle}
              dynamicColors={isDynamic}
            />
          </div>

          <DownloadHeatmapModal
            trigger={
              <button
                className='group relative overflow-hidden w-full lg:w-fit px-6 h-8 rounded-3xl bg-primary
             flex items-center justify-center gap-x-2 text-white text-sm font-bold'
                onClick={() => {
                  chartRef.current?.downloadImage();
                  vibrate();
                }}>
                <span className='pointer-events-none absolute inset-0 translate-x-[-100%] animate-shine'>
                  <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12' />
                </span>

                <span className='relative z-10 flex flex-row items-center gap-x-1'>
                  <Download size={16} className='' /> {translate("download")}
                </span>
              </button>
            }
          />
        </div>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <TreemapChart
          ref={chartRef}
          data={list.slice(0, amount)}
          chartType={listType}
          timeGap={timeGap}
          currency={currency}
          type={heatmapStyle}
          dynamicColors={isDynamic}
        />
      )}
    </div>
  );
}
