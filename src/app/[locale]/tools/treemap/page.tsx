"use client";

import TreemapChart from "@/components/tools/treemap/TreemapChart";
import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import BackButton from "@/utils/ui/backButton";

export default function Page() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const [list, setList] = useState<GiftInterface[]>([]);
  const [listType, setListType] = useState<"change" | "marketCap">("change");
  const [timeGap, setTimeGap] = useState<"24h" | "1w" | "1m">("24h");
  const [currency, setCurrency] = useState<"ton" | "usd">("ton");

  const [amount, setAmount] = useState<number>(25);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(true);

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

        <div className='w-full lg:w-11/12 gap-x-3 flex justify-end'>
          <div className='w-1/2 bg-secondaryTransparent  rounded-2xl'>
            <button
              className={`w-1/2 text-sm h-8 box-border rounded-2xl ${
                listType === "change" ? "bg-primary font-bold text-white" : null
              }`}
              onClick={() => {
                setListType("change");
                vibrate();
              }}>
              Change
            </button>
            <button
              className={`w-1/2 text-sm h-8 box-border rounded-2xl ${
                listType === "marketCap"
                  ? "bg-primary font-bold text-white"
                  : null
              }`}
              onClick={() => {
                setListType("marketCap");
                vibrate();
              }}>
              Market Cap
            </button>
          </div>

          <div className='w-1/2 bg-secondaryTransparent rounded-2xl'>
            <button
              className={`w-1/2 text-sm h-8 box-border rounded-2xl ${
                currency === "ton" ? "bg-primary font-bold text-white" : null
              }`}
              onClick={() => {
                setCurrency("ton");
                vibrate();
              }}>
              TON
            </button>
            <button
              className={`w-1/2 text-sm h-8 box-border rounded-2xl ${
                currency === "usd" ? "bg-primary font-bold text-white" : null
              }`}
              onClick={() => {
                setCurrency("usd");
                vibrate();
              }}>
              USD
            </button>
          </div>
        </div>

        <div className='w-full lg:w-11/12 bg-secondaryTransparent rounded-2xl'>
          <div className='w-full flex flex-col'>
            <div className='w-full flex flex-row justify-between gap-x-3'>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  timeGap === "1m" ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setTimeGap("1m");
                  vibrate();
                }}>
                1m
              </button>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  timeGap === "1w" ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setTimeGap("1w");
                  vibrate();
                }}>
                1w
              </button>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  timeGap === "24h" ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setTimeGap("24h");
                  vibrate();
                }}>
                24h
              </button>
            </div>
          </div>
        </div>

        <div className='w-full lg:w-11/12 bg-secondaryTransparent  rounded-2xl'>
          <div className='w-full flex flex-col'>
            <div className='w-full flex flex-row justify-between gap-x-3'>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  amount === giftsList.length
                    ? "bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  setAmount(giftsList.length);
                  vibrate();
                }}>
                All
              </button>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  amount === 50 ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setAmount(50);
                  vibrate();
                }}>
                Top 50
              </button>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  amount === 35 ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setAmount(35);
                  vibrate();
                }}>
                Top 35
              </button>
              <button
                className={`w-full text-sm h-8 rounded-2xl ${
                  amount === 25 ? "bg-primary font-bold text-white" : null
                }`}
                onClick={() => {
                  setAmount(25);
                  vibrate();
                }}>
                Top 25
              </button>
            </div>
          </div>
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
          data={list.slice(0, amount)}
          chartType={listType}
          timeGap={timeGap}
          currency={currency}
        />
      )}
    </div>
  );
}
