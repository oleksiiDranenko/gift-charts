"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setIndexList } from "@/redux/slices/indexListSlice";
import axios from "axios";
import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import IndexBlock from "@/components/tools/IndexBlock";
import useVibrate from "@/hooks/useVibrate";
import { ChevronRight, Grid2x2, Smile } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Page() {
  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const indexList = useAppSelector((state) => state.indexList);
  const vibrate = useVibrate();
  const user = useAppSelector((state) => state.user);
  const t = useTranslations("fearAndGreed");

  useEffect(() => {
    (async () => {
      try {
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }
        if (indexList.length === 0) {
          const indexRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/indexes/get-all`
          );
          dispatch(setIndexList(indexRes.data));
          console.log(indexRes);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [dispatch, giftsList, indexList]);

  return (
    <main className='w-full lg:w-5/6 pt-[0px]  px-3'>
      <h1 className='w-full text-xl font-bold mb-3 ml-1 flex flex-row gap-x-2'>
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
        <div className='w-full h-16 p-3 mb-5 flex flex-row justify-between items-center py-3 bg-secondaryTransparent rounded-xl'>
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
      <h1 className='w-full text-xl font-bold mb-3 mt-1 ml-1 flex flex-row gap-x-2'>
        Indexes
      </h1>

      <div className='w-full h-auto flex flex-col gap-3'>
        {[...indexList]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((index) => (
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
