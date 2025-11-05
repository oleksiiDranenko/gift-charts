"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import IndexBlock from "@/components/tools/IndexBlock";
import useVibrate from "@/hooks/useVibrate";
import {
  ChevronRight,
  Gauge,
  Grid2x2,
  LayoutDashboard,
  Smile,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useQuery } from "react-query";

export default function Page() {
  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const vibrate = useVibrate();
  const user = useAppSelector((state) => state.user);
  const t = useTranslations("fearAndGreed");

  // ✅ Fetch gifts (still via Redux)
  useEffect(() => {
    (async () => {
      try {
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      }
    })();
  }, [dispatch, giftsList]);

  // ✅ Fetch indexes with TanStack Query
  const {
    data: indexList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["indexes"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/indexes/get-all`
      );
      return res.data;
    },
  });

  return (
    <main className='w-full lg:w-5/6 pt-[0px] pb-24 px-3'>
      <h1 className='w-full text-xl font-bold mb-3 ml-1 flex flex-row gap-x-2'>
        Analytics Tools
      </h1>

      <div className='lg:grid lg:grid-cols-2 flex flex-col gap-3'>
        <Link
          className='bg-secondaryTransparent rounded-2xl overflow-hidden'
          href={"/tools/treemap"}>
          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center gap-x-3'>
              <LayoutDashboard size={28} className='text-green-500' />
              <div className='flex flex-col'>
                <span className='font-bold text-lg'>Heatmap</span>
                <span className='text-sm text-secondaryText'>
                  View market state at heatmap chart
                </span>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>
        </Link>

        <Link
          className='bg-secondaryTransparent rounded-2xl overflow-hidden'
          href={"/tools/fear-greed"}>
          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center gap-x-3'>
              <Gauge size={28} className='text-green-500' />
              <div className='flex flex-col'>
                <span className='font-bold text-lg'>Fear & Greed</span>
                <span className='text-sm text-secondaryText'>
                  See how others feel about the market
                </span>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>
        </Link>

        <Link
          className='bg-secondaryTransparent rounded-2xl overflow-hidden'
          href={"/tools/vote"}>
          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center gap-x-3'>
              <Smile size={28} className='text-green-500' />
              <div className='flex flex-col'>
                <span className='font-bold text-lg'>Market Sentiment</span>
                <span className='text-sm text-secondaryText'>
                  See how others feel about the market
                </span>
              </div>
            </div>

            <ChevronRight size={20} />
          </div>
        </Link>
      </div>

      {/* Indexes */}
      <h1 className='w-full text-xl font-bold mb-3 mt-5 ml-1 flex flex-row gap-x-2'>
        Indexes
      </h1>

      <div className='w-full h-auto flex flex-col gap-3'>
        {/* ✅ Loading placeholder */}
        {isLoading && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className='w-full h-[68px] p-3 bg-secondaryTransparent rounded-2xl animate-pulse'
              />
            ))}
          </>
        )}

        {/* ✅ Error state */}
        {isError && (
          <p className='text-red-500 text-sm'>
            Failed to load indexes: {(error as Error).message}
          </p>
        )}

        {/* ✅ Data rendering */}
        {!isLoading &&
          !isError &&
          indexList &&
          [...indexList]
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((index: any) => (
              <IndexBlock
                key={index._id}
                id={index._id}
                name={index.name}
                valueType={index.valueType}
                tonPrice={index.tonPrice}
                tonPrice24hAgo={index.tonPrice24hAgo}
              />
            ))}
      </div>
    </main>
  );
}
