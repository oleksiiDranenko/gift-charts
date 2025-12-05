"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import { Link } from "@/i18n/navigation";
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

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);

  const translateMain = useTranslations("mainPage");
  const translateAdd = useTranslations("add");

  const [userList, setUserList] = useState<GiftInterface[]>([]);
  const [chosenFilter, setChosenFilter] = useState<
    "gainers" | "losers" | "floor" | "saved"
  >("gainers");
  const [isMounted, setIsMounted] = useState(false);

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

  const sortedGainers = new GiftSorter(giftsList).sortBy(
    currency === "ton" ? "priceChangeGrowthTon" : "priceChangeGrowth",
    "desc"
  );

  const sortedLosers = new GiftSorter(giftsList).sortBy(
    currency === "ton" ? "priceChangeGrowthTon" : "priceChangeGrowth",
    "asc"
  );

  const sortedFloor = new GiftSorter(giftsList).sortBy(
    currency === "ton" ? "priceTon" : "priceUsd",
    "desc"
  );

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
      <div className='w-full px-3 mb-4'>
        <Link
          href='https://t.me/giftshitpost'
          className='w-full h-20 p-3 flex flex-row bg-primary rounded-3xl relative overflow-hidden'>
          <div className='flex flex-col justify-evenly'>
            <div className='flex flex-row'>
              <h1 className='flex flex-row gap-x-1 items-center text-white font-bold text-lg'>
                {translateAdd("title")}
              </h1>
            </div>
            <p className='text-sm text-white/70'>
              {translateAdd("description")}
            </p>
          </div>
          <div className='absolute right-3 top-1/2absolute top-1/2 transform -translate-y-1/2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-8 mr-3 text-white'>
              <path
                fillRule='evenodd'
                d='M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z'
                clipRule='evenodd'
              />
            </svg>
          </div>
        </Link>
      </div>

      <SearchBar />

      <div className='px-3 mb-3'>
        <IndexWidget
          currency={currency}
          indexId='68493d064b37eed02b7ae5af'
          indexName='marketCap'
        />
      </div>

      <div className='max-w-full gap-x-1 flex items-center justify-between mb-4'>
        <div className='w-full gap-x-1 flex flex-row overflow-x-scroll scrollbar-hide'>
          <button
            className={`flex ml-3 items-center justify-center px-3 text-xs h-8 rounded-3xl active:scale-[95%] duration-200 ${
              chosenFilter === "gainers"
                ? "text-foreground font-bold bg-secondary rounded-3xl"
                : "text-secondaryText bg-secondaryTransparent"
            }`}
            onClick={() => {
              setChosenFilter("gainers");
              vibrate();
            }}>
            <span>{translateMain("gainers")}</span>
            <TrendingUp size={14} className='ml-1' />
          </button>
          <button
            className={`flex items-center justify-center px-3 text-xs h-8 rounded-3xl active:scale-[95%] duration-200 ${
              chosenFilter === "losers"
                ? "text-foreground font-bold bg-secondary rounded-3xl"
                : "text-secondaryText bg-secondaryTransparent"
            }`}
            onClick={() => {
              setChosenFilter("losers");
              vibrate();
            }}>
            <span>{translateMain("losers")}</span>
            <TrendingDown size={14} className='ml-1' />
          </button>
          <button
            className={`flex items-center justify-center px-3 text-xs h-8 rounded-3xl active:scale-[95%] duration-200 ${
              chosenFilter === "floor"
                ? "text-foreground font-bold bg-secondary rounded-3xl"
                : "text-secondaryText bg-secondaryTransparent"
            }`}
            onClick={() => {
              setChosenFilter("floor");
              vibrate();
            }}>
            <span>{translateMain("floor")}</span>
            <Trophy size={14} className='ml-1' />
          </button>
        </div>
      </div>

      <div className='w-full flex flex-row mb-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide'>
        {chosenFilter === "saved" ? (
          <>
            {userList.length !== 0 ? (
              <ListHandler
                key={chosenFilter}
                giftsList={userList.slice(0, 5)}
                type={giftType}
                background={giftBackground}
                currency={currency}
              />
            ) : (
              <div className='flex-none w-full text-center snap-start'>
                <div className='px-3 pt-3 pb-1 font-bold'>
                  {translateMain("emptyWatchlist")}
                </div>
              </div>
            )}
          </>
        ) : giftsList.length === 0 ? (
          <ListSkeleton type={giftType} count={giftType === "line" ? 3 : 8} />
        ) : (
          <ListHandler
            key={chosenFilter}
            giftsList={
              chosenFilter === "gainers"
                ? giftType === "line"
                  ? sortedGainers.slice(0, 3)
                  : sortedGainers.slice(0, 8)
                : chosenFilter === "losers"
                ? giftType === "line"
                  ? sortedLosers.slice(0, 3)
                  : sortedLosers.slice(0, 8)
                : chosenFilter === "floor"
                ? giftType === "line"
                  ? sortedFloor.slice(0, 3)
                  : sortedFloor.slice(0, 8)
                : []
            }
            type={giftType}
            background={giftBackground}
            currency={currency}
          />
        )}
      </div>

      {/* <div className='w-full px-3'>
        <VoteBanner />
      </div> */}

      {/* <Link
        href={"/donate"}
        className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
        Donate
      </Link> */}

      <div className='w-full px-3'>
        <Link
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
        </Link>
      </div>
    </div>
  );
}
