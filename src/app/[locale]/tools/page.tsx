"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import IndexBlock from "@/components/tools/IndexBlock";
import useVibrate from "@/hooks/useVibrate";
import { ChevronRight, Grid2x2, Smile } from "lucide-react";
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
        Services
      </h1>
      <div className='lg:grid lg:grid-cols-2 flex flex-col gap-3'>
        <Link
          className='bg-secondaryTransparent rounded-2xl overflow-hidden'
          href={"/tools/stars"}
          onClick={() => {
            vibrate();
          }}>
          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
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
                <span className='font-bold text-lg'>Buy Stars</span>
                <span className='text-sm text-secondaryText'>
                  Swap crypto to telegram stars
                </span>
              </div>
            </div>

            <ChevronRight size={20} className='text-primary' />
          </div>
        </Link>
      </div>

      <h1 className='w-full text-xl font-bold mb-3 mt-5 ml-1 flex flex-row gap-x-2'>
        Analytics Tools
      </h1>

      {/* Heatmap Section */}
      <div className='mb-3 bg-secondaryTransparent rounded-xl overflow-hidden relative'>
        <div className='absolute top-0 left-0 w-full h-20 z-0 overflow-hidden'>
          <Image
            src='/images/heatmap.webp'
            alt='heatmap background'
            fill
            className='object-cover blur-[3px]'
            priority
          />
        </div>

        <div className='relative z-10'>
          <div className='w-full h-20' />

          <div className='w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center font-bold text-lg gap-2'>
              <Grid2x2 size={24} className='text-primary' />
              <span>Heatmap</span>
            </div>

            <Link
              href='/tools/treemap'
              className='px-3 h-8 text-sm text-white flex items-center bg-primary rounded-xl'
              onClick={() => vibrate()}>
              <span>Try it now</span>
              <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Market Sentiment */}
      {user.token && (
        <div className='w-full h-16 p-3 flex flex-row justify-between items-center py-3 bg-secondaryTransparent rounded-xl'>
          <h1 className='font-bold flex flex-row items-center gap-x-2'>
            <Smile size={26} className='text-primary' />
            Market Sentiment
          </h1>
          <Link
            href='/tools/vote'
            className='px-3 h-8 text-sm text-white flex items-center bg-primary rounded-xl'
            onClick={() => vibrate()}>
            <span>Vote now</span>
            <ChevronRight size={18} />
          </Link>
        </div>
      )}

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
                className='w-full h-[68px] p-3 bg-secondaryTransparent rounded-xl animate-pulse'
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
