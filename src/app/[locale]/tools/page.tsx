"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useEffect, useState } from "react";
import IndexBlock from "@/components/tools/IndexBlock";
import useVibrate from "@/hooks/useVibrate";
import { ChevronRight, Gauge } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQuery } from "react-query";
import IndexBlockSkeleton from "@/components/tools/IndexBlockSkeleton";
import NoPrefetchLink from "@/components/NoPrefetchLink";

export default function Page() {
  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const vibrate = useVibrate();
  const translate = useTranslations("tools");
  const translateGeneral = useTranslations("general");

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
    <main className='w-full lg:w-[98%] pt-[0px] pb-28 lg:pb-0 px-3'>
      <h1 className='w-full text-xl font-bold mb-5 ml-1 flex flex-row gap-x-2'>
        {translate("services")}
      </h1>
      <div className='lg:grid lg:grid-cols-2 flex flex-col gap-3'>
        <NoPrefetchLink
          className='bg-secondaryTransparent rounded-3xl overflow-hidden'
          href={"/tools/stars"}
          onClick={() => {
            vibrate();
          }}>
          <div
            className='w-full p-3 flex flex-row justify-between items-center '
            onClick={() => {
              vibrate();
            }}>
            <div className='flex flex-row items-center gap-x-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-7 text-yellow-400'>
                <path
                  fillRule='evenodd'
                  d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
                  clipRule='evenodd'
                />
              </svg>

              <div className='flex flex-col'>
                <span className='font-bold text-lg'>
                  {translate("buyStars")}
                </span>
                <span className='text-sm text-secondaryText'>
                  {translate("buyStarsDescription")}
                </span>
              </div>
            </div>

            <ChevronRight size={20} className='text-primary' />
          </div>
        </NoPrefetchLink>
      </div>
      <h1 className='w-full text-xl font-bold mb-5 mt-5 ml-1 flex flex-row gap-x-2'>
        {translate("analyticsTools")}
      </h1>

      <div className='lg:grid lg:grid-cols-2 flex flex-col gap-3'>
        <NoPrefetchLink
          className='bg-secondaryTransparent rounded-3xl overflow-hidden'
          href={"/tools/treemap"}
          onClick={() => {
            vibrate();
          }}>
          <div className='w-full p-3 flex flex-row justify-between items-center'>
            <div className='flex flex-row items-center gap-x-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-7 text-primary'>
                <path
                  fillRule='evenodd'
                  d='M1.5 7.125c0-1.036.84-1.875 1.875-1.875h6c1.036 0 1.875.84 1.875 1.875v3.75c0 1.036-.84 1.875-1.875 1.875h-6A1.875 1.875 0 0 1 1.5 10.875v-3.75Zm12 1.5c0-1.036.84-1.875 1.875-1.875h5.25c1.035 0 1.875.84 1.875 1.875v8.25c0 1.035-.84 1.875-1.875 1.875h-5.25a1.875 1.875 0 0 1-1.875-1.875v-8.25ZM3 16.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875v2.25c0 1.035-.84 1.875-1.875 1.875h-5.25A1.875 1.875 0 0 1 3 18.375v-2.25Z'
                  clipRule='evenodd'
                />
              </svg>

              <div className='flex flex-col'>
                <span className='font-bold text-lg'>
                  {translate("heatmap")}
                </span>
                <span className='text-sm text-secondaryText'>
                  {translate("heatmapDescription")}
                </span>
              </div>
            </div>

            <ChevronRight size={20} className='text-primary' />
          </div>
        </NoPrefetchLink>

        {/* <Link
          className='bg-secondaryTransparent rounded-3xl overflow-hidden'
          href={"/tools/vote"}
          onClick={() => {
            vibrate();
          }}>
          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center gap-x-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-7 text-primary'>
                <path
                  fillRule='evenodd'
                  d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z'
                  clipRule='evenodd'
                />
              </svg>

              <div className='flex flex-col'>
                <span className='font-bold text-lg'>
                  {translate("marketSentiment")}
                </span>
                <span className='text-sm text-secondaryText'>
                  {translate("marketSentimentDescription")}
                </span>
              </div>
            </div>

            <ChevronRight size={20} className='text-primary' />
          </div>
        </Link> */}

        <div
          className='bg-secondaryTransparent rounded-3xl overflow-hidden'
          onClick={() => {
            vibrate();
          }}>
          <div className='w-full p-3 flex flex-row justify-between items-center text-secondaryText'>
            <div className='flex flex-row items-center gap-x-3'>
              <Gauge size={28} className='text-secondary' />
              <div className='flex flex-col'>
                <span className='font-bold text-lg'>
                  {translate("fearGreed")}
                </span>
                <span className='text-sm'>
                  {translate("fearGreedDescription")}
                </span>
              </div>
            </div>
            {/* <ChevronRight size={20} className='' /> */}
            <span className='pr-1 gap-x-1 flex flex-row items-center text-primary'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4'>
                <path
                  fillRule='evenodd'
                  d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z'
                  clipRule='evenodd'
                />
              </svg>
              {translateGeneral("soon")}
            </span>
          </div>
        </div>
      </div>

      {/* Indexes */}
      <h1 className='w-full text-xl font-bold mb-3 mt-5 ml-1 flex flex-row gap-x-2'>
        {translate("indexes")}
      </h1>

      <div className='w-full h-auto grid grid-cols-2 lg:grid-cols-4 gap-2'>
        {/* ✅ Loading placeholder */}
        {isLoading && (
          <>
            {[...Array(5)].map((_, i) => (
              <IndexBlockSkeleton key={i} />
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
                usdPrice={index.usdPrice}
                usdPrice24hAgo={index.usdPrice24hAgo}
                currency={settings.currency}
              />
            ))}
      </div>
    </main>
  );
}
