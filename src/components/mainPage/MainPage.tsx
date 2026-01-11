"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import Image from "next/image";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import ListHandler from "./ListHandler";
import SearchBar from "./SearchBar";
import {
  Trophy,
  Star,
  TrendingUp,
  TrendingDown,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import IndexWidget from "./IndexWidget";
import ListSkeleton from "../giftsList/ListSkeleton";
import VoteBanner from "../tools/vote/VoteBanner";
import { GiftSorter } from "../filterGifts/GiftSorter";
import NoPrefetchLink from "../NoPrefetchLink";
import AddBanner from "../AddBanner";
import GiftsList from "../giftsList/GiftsList";

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);

  const translateMain = useTranslations("mainPage");

  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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

  const { currency, giftType, giftBackground } = settings;

  useEffect(() => {
    if (giftsList.length > 0) {
      setIsLoading(false);
    }
  }, [giftsList]);

  // ✅ Sync settings to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      {/* <div className='w-full px-3'>
        <AddBanner className='mb-5' />
      </div> */}
      {/* <SearchBar />

      <div className='px-3 mb-3'>
        <IndexWidget
          currency={currency}
          indexId='68493d064b37eed02b7ae5af'
          indexName='marketCap'
        />
      </div> */}

      <GiftsList loading={isLoading} />

      {/* <div className='w-full px-3'>
        <NoPrefetchLink
          href={"/donate"}
          onClick={() => {
            vibrate();
          }}>
          <div className='w-full bg-secondaryTransparent rounded-3xl overflow-hidden p-3 flex flex-row justify-between items-center backdrop-blur-lg'>
            <div className='flex flex-row items-center gap-x-3'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-7 text-primary'>
                <path d='m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z' />
              </svg>

              <div className='flex flex-col'>
                <span className='font-bold text-lg'>
                  {translateMain("supportApp")}
                </span>
                <span className='text-sm text-secondaryText'>
                  {translateMain("thankYou")}
                </span>
              </div>
            </div>

            <ChevronRight size={20} className='text-primary' />
          </div>
        </NoPrefetchLink>
      </div> */}
    </div>
  );
}
