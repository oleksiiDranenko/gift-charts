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

export default function Page() {
  const giftsList = useAppSelector((state) => state.giftsList);
  const [list, setList] = useState<GiftInterface[]>([]);
  const [listType, setListType] = useState<"change" | "marketCap">("change");
  const [timeGap, setTimeGap] = useState<"24h" | "1w" | "1m">("24h");
  const [currency, setCurrency] = useState<"ton" | "usd">("ton");

  const [amount, setAmount] = useState<number>(50);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(true);

  const translate = useTranslations("heatmap");

  const vibrate = useVibrate();
  const totalGifts = giftsList.length;
  const chartRef = useRef<TreemapChartRef>(null);

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
    let rawList = [...giftsList];

    let sortedList = rawList.filter(
      (gift) => gift.preSale === false || gift.preSale === undefined
    );

    switch (listType) {
      case "change":
        sortedList.sort((a, b) => {
          if (timeGap === "24h") {
            const aChange = a.tonPrice24hAgo
              ? Math.abs(
                  ((a.priceTon - a.tonPrice24hAgo) / a.tonPrice24hAgo) * 100
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPrice24hAgo) / b.tonPrice24hAgo) * 100
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
                  ((a.priceTon - a.tonPriceWeekAgo) / a.tonPriceWeekAgo) * 100
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPriceWeekAgo) / b.tonPriceWeekAgo) * 100
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
                  ((a.priceTon - a.tonPriceMonthAgo) / a.tonPriceMonthAgo) * 100
                )
              : 0;
            const bChange = b.tonPrice24hAgo
              ? Math.abs(
                  ((b.priceTon - b.tonPriceMonthAgo) / b.tonPriceMonthAgo) * 100
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
            b.priceTon * b.upgradedSupply - a.priceTon * a.upgradedSupply
        );
        break;
    }

    setList(sortedList);
  }, [giftsList, listType, timeGap]);

  return (
    <div className='w-full pt-[0px]  pb-24 flex flex-col items-center overflow-visible'>
      <div className='w-full flex flex-col items-center px-3 gap-y-3 mb-3'>
        <div className='w-full lg:w-11/12 flex flex-row justify-between items-center gap-x-3'>
          <BackButton />
        </div>

        <div className='w-full lg:w-11/12 gap-x-2 flex flex-row items-center justify-start'>
          <div>
            <TreemapControlModal
              trigger={
                <button className='w-fit flex flex-row items-center gap-x-2 h-8 px-6 text-sm text-white bg-secondaryTransparent rounded-3xl'>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-6'>
                    <path d='M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z' />
                  </svg>
                  {translate("editHeatmap")}
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

          <button
            className='group relative overflow-hidden w-fit px-6 h-8 rounded-3xl bg-primary
             flex items-center justify-center gap-x-2 text-white text-sm font-bold'
            onClick={() => {
              chartRef.current?.downloadImage();
              vibrate();
            }}>
            {/* This moving shine bar creates the "alive" flowing effect */}
            <span className='pointer-events-none absolute inset-0 translate-x-[-100%] animate-shine'>
              <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12' />
            </span>

            <span className='relative z-10 flex flex-row items-center gap-x-1'>
              <Download size={16} className='' /> {translate("download")}
            </span>
          </button>
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
          type='round'
        />
      )}
    </div>
  );
}
