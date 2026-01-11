"use client";

import TreemapChart, {
  TreemapChartRef,
} from "@/components/tools/treemap/TreemapChart";
import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ReactLoading from "react-loading";
import BackButton from "@/utils/ui/backButton";
import TreemapControlModal from "@/components/tools/treemap/EditTreemapModal";
import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import DownloadHeatmapModal from "@/components/tools/treemap/DownloadHeatmapModal";

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

  const giftsList = useAppSelector((state) => state.giftsList);
  const [list, setList] = useState<GiftInterface[]>([]);
  const [listType, setListType] = useState<"change" | "marketCap">("marketCap");
  const [timeGap, setTimeGap] = useState<"24h" | "1w" | "1m">("24h");
  const [currency, setCurrency] = useState<"ton" | "usd">(settings.currency);

  const [amount, setAmount] = useState<number>(100);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [isSending, setIsSending] = useState<boolean>(false); // New state for Telegram upload

  const translate = useTranslations("heatmap");
  const vibrate = useVibrate();
  const totalGifts = giftsList.length;
  const chartRef = useRef<TreemapChartRef>(null);

  // New handler for the download/send logic
  const handleDownload = async () => {
    if (isSending) return;
    vibrate();

    try {
      setIsSending(true);
      const result = await chartRef.current?.downloadImage();

      if (!result) return;

      const isTelegram = !!window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

      if (!isTelegram) {
        // Handle browser download
        const a = document.createElement("a");
        a.href = result.url;
        a.download = result.filename;
        a.click();
      } else {
        // Handle Telegram upload via Proxy
        const form = new FormData();
        form.append("file", result.blob, result.filename);
        form.append(
          "chatId",
          window.Telegram!.WebApp!.initDataUnsafe!.user!.id.toString()
        );

        // Using relative path for the proxy
        await axios.post("/api/proxy/telegram/send-image", form);
      }
    } catch (error) {
      console.error("Failed to process image:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, giftsList]);

  useEffect(() => {
    if (giftsList.length > 0 && amount === 100) {
      setAmount(giftsList.length);
    }
  }, [giftsList]);

  useEffect(() => {
    let rawList = [...giftsList];
    let sortedList = rawList.filter(
      (gift) => gift.preSale === false || gift.preSale === undefined
    );

    switch (listType) {
      case "change":
        sortedList.sort((a, b) => {
          const getChange = (val: GiftInterface, gap: string) => {
            const now = val.priceTon;
            const then =
              gap === "24h"
                ? val.tonPrice24hAgo
                : gap === "1w"
                ? val.tonPriceWeekAgo
                : val.tonPriceMonthAgo;
            return then ? Math.abs(((now - then) / then) * 100) : 0;
          };
          return getChange(b, timeGap) - getChange(a, timeGap);
        });
        break;
      case "marketCap":
        sortedList.sort(
          (a, b) =>
            b.priceTon * b.upgradedSupply - a.priceTon * a.upgradedSupply
        );
        break;
    }
    setList(sortedList);
  }, [giftsList, listType, timeGap]);

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
            />
          </div>

          <DownloadHeatmapModal
            trigger={
              <button
                disabled={isSending}
                className='group relative overflow-hidden w-full lg:w-fit px-6 h-8 rounded-3xl bg-primary
             flex items-center justify-center gap-x-2 text-white text-sm font-bold disabled:opacity-70'
                onClick={handleDownload}>
                {isSending ? (
                  <ReactLoading
                    type='spin'
                    color='#fff'
                    height={16}
                    width={16}
                  />
                ) : (
                  <>
                    <span className='pointer-events-none absolute inset-0 translate-x-[-100%] animate-shine'>
                      <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12' />
                    </span>
                    <span className='relative z-10 flex flex-row items-center gap-x-1'>
                      <Download size={16} /> {translate("download")}
                    </span>
                  </>
                )}
              </button>
            }
          />
        </div>
      </div>

      {loading ? (
        <ReactLoading
          type='spin'
          color='#0098EA'
          height={30}
          width={30}
          className='mt-5'
        />
      ) : (
        <TreemapChart
          ref={chartRef}
          data={list.slice(0, amount)}
          chartType={listType}
          timeGap={timeGap}
          currency={currency}
          type='default'
        />
      )}
    </div>
  );
}
