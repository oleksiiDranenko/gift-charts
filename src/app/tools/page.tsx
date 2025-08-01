"use client";

import { IndexInterface } from "@/interfaces/IndexInterface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setIndexList } from "@/redux/slices/indexListSlice";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import IndexBlock from "@/components/tools/IndexBlock";
import useVibrate from "@/hooks/useVibrate";
import { ChevronRight, Grid2x2 } from "lucide-react";
import Image from "next/image";

export default function Page() {
  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const indexList = useAppSelector((state) => state.indexList);
  const vibrate = useVibrate();

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
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      }
    })();
  }, [dispatch, giftsList]);

  return (
    <main className="w-full lg:w-1/2 pt-[70px] px-3">
      <div className="mb-5 border border-secondary rounded-lg overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-40 z-0">
        <Image
          src="/images/heatmap.webp"
          alt="heatmap background"
          fill
          className="object-cover blur-[3px]"
          priority
        />
      </div>

      <div className="relative z-10">
        <div className="w-full h-40" />

        <div className="w-full p-3 flex flex-row justify-between items-center backdrop-blur-lg">
          <div className="flex flex-row items-center font-bold text-lg gap-1">
            <Grid2x2 size={24} />
            <span>Heatmap</span>
          </div>

          <Link
            href="/tools/treemap"
            className="px-3 h-10 text-sm flex items-center border border-secondary bg-secondaryTransparent rounded-lg"
            onClick={() => vibrate()}
          >
            <span>Try it now</span>
            <ChevronRight size={18} /> 
          </Link>
        </div>
      </div>
    </div>

    {/* <Link href={'/tools/calendar-heatmap'}>
      test thing
    </Link> */}

      <div className="w-full h-auto flex flex-col gap-3">
        <IndexBlock name="Market Cap" id="68493d064b37eed02b7ae5af" />
        <IndexBlock name="FDV" id="67faf0d0634d6e48d48360bc" />
      </div>
    </main>
  );
}
