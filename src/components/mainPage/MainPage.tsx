"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import useVibrate from "@/hooks/useVibrate";
import ListHandler from "./ListHandler";
import SearchBar from "./SearchBar";
import { Trophy, Star, TrendingUp, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import VoteBanner from "../tools/vote/VoteBanner";
import IndexChart from "./IndexChart";
import axios from "axios";
import { useQuery } from "react-query";
import IndexWidget from "./IndexWidget";

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);

  const translateMain = useTranslations("mainPage");

  const [gainersList, setGainersList] = useState<GiftInterface[]>([]);
  const [losersList, setLosersList] = useState<GiftInterface[]>([]);
  const [topList, setTopList] = useState<GiftInterface[]>([]);
  const [userList, setUserList] = useState<GiftInterface[]>([]);
  const [chosenFilter, setChosenFilter] = useState<
    "gainers" | "losers" | "floor" | "saved"
  >("gainers");
  const [isMounted, setIsMounted] = useState(false);

  const [giftType, setGiftType] = useState<"line" | "block">(
    typeof window !== "undefined"
      ? (localStorage.getItem("giftType") as "line" | "block") || "line"
      : "line"
  );

  const [giftBackground, setGiftBackground] = useState<"color" | "none">(
    typeof window !== "undefined"
      ? (localStorage.getItem("giftBackground") as "color" | "none") || "none"
      : "none"
  );

  const [currency, setCurrency] = useState<"ton" | "usd">(
    typeof window !== "undefined"
      ? (localStorage.getItem("currency") as "ton" | "usd") || "ton"
      : "ton"
  );

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("giftType", giftType);
    }
  }, [giftType, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("giftBackground", giftBackground);
    }
  }, [giftBackground, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("currency", currency);
    }
  }, [currency, isMounted]);

  useEffect(() => {
    if (giftsList.length > 0) {
      const sortedList = [...giftsList].sort((a, b) =>
        currency === "ton"
          ? filters.sort === "lowFirst"
            ? a.priceTon - b.priceTon
            : b.priceTon - a.priceTon
          : filters.sort === "lowFirst"
          ? a.priceUsd - b.priceUsd
          : b.priceUsd - a.priceUsd
      );
      setTopList(sortedList);

      const getChange = (current: number, prev: number): number => {
        if (!prev || prev === 0) return 0;
        return ((current - prev) / prev) * 100;
      };

      // Gainers
      const sortedGainers = [...giftsList]
        .filter((gift) => {
          const prev =
            currency === "ton" ? gift.tonPrice24hAgo : gift.usdPrice24hAgo;

          return typeof prev === "number" && prev > 0;
        })
        .sort((a, b) => {
          const changeA =
            currency === "ton"
              ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
              : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

          const changeB =
            currency === "ton"
              ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
              : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

          return changeB - changeA;
        });

      setGainersList(sortedGainers);

      // Losers
      const sortedLosers = [...giftsList]
        .filter((gift) => {
          const prev =
            currency === "ton" ? gift.tonPrice24hAgo : gift.usdPrice24hAgo;

          return typeof prev === "number" && prev > 0;
        })
        .sort((a, b) => {
          const changeA =
            currency === "ton"
              ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
              : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

          const changeB =
            currency === "ton"
              ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
              : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

          return changeA - changeB;
        });

      setLosersList(sortedLosers);
    }
  }, [currency, filters, giftsList]);

  useEffect(() => {
    if (giftsList.length > 0 && user.savedList.length > 0) {
      let filteredList = giftsList.filter((gift) =>
        user.savedList.includes(gift._id)
      );

      filteredList.sort((a, b) =>
        currency === "ton"
          ? filters.sort === "lowFirst"
            ? a.priceTon - b.priceTon
            : b.priceTon - a.priceTon
          : filters.sort === "lowFirst"
          ? a.priceUsd - b.priceUsd
          : b.priceUsd - a.priceUsd
      );

      setUserList(filteredList);
    } else {
      setUserList([]);
    }
  }, [currency, filters, giftsList, user.savedList]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      {/* <div className='w-full px-3 mb-4'>
        <Link
          href='https://t.me/gift_charts'
          className='w-full h-24 p-3 flex flex-row bg-gradient-to-br from-cyan-950 to-cyan-700 rounded-2xl relative overflow-hidden'>
          <div className='flex flex-col justify-evenly'>
            <div className='flex flex-row'>
              <h1 className=' text-white font-bold'>
                Gift Charts official channel
              </h1>
            </div>
            <p className='text-xs text-white/70'>
              Be informed about the upcoming updates
            </p>
          </div>
          <div className='absolute right-3 top-1/2absolute top-1/2 transform -translate-y-1/2'>
            <Image
              src='/images/telegram-svgrepo-com.svg'
              alt=''
              width={50}
              height={50}
            />
          </div>
        </Link>
      </div> */}

      <SearchBar />

      <div className='px-3 mb-3'>
        <IndexWidget
          currency={currency}
          indexId='68493d064b37eed02b7ae5af'
          indexName='Market Cap'
        />
      </div>

      <div className='max-w-full gap-x-1 flex items-center justify-between mb-4'>
        <div className='w-full gap-x-1 flex flex-row overflow-x-scroll scrollbar-hide'>
          <button
            className={` flex ml-3 flex-row items-center justify-center px-3 text-xs h-8 box-border ${
              chosenFilter === "gainers"
                ? "font-bold text-foreground border-b border-primary"
                : "text-secondaryText"
            }`}
            onClick={() => setChosenFilter("gainers")}>
            <span>{translateMain("gainers")}</span>
            <TrendingUp size={14} className='ml-1' />
          </button>
          <button
            className={` flex flex-row items-center justify-center px-3 text-xs h-8 box-border ${
              chosenFilter === "losers"
                ? "font-bold text-foreground border-b border-primary"
                : "text-secondaryText"
            }`}
            onClick={() => setChosenFilter("losers")}>
            <span>{translateMain("losers")}</span>
            <TrendingDown size={14} className='ml-1' />
          </button>
          <button
            className={` flex flex-row items-center justify-center px-3 text-xs h-8 box-border ${
              chosenFilter === "floor"
                ? "font-bold text-foreground border-b border-primary"
                : "text-secondaryText"
            }`}
            onClick={() => setChosenFilter("floor")}>
            <span>{translateMain("floor")}</span>
            <Trophy size={14} className='ml-1' />
          </button>
          <button
            className={` flex flex-row items-center justify-center px-3 text-xs h-8 box-border ${
              chosenFilter === "saved"
                ? "font-bold text-foreground border-b border-primary"
                : "text-secondaryText"
            }`}
            onClick={() => setChosenFilter("saved")}>
            <span>{translateMain("saved")}</span>
            <Star size={14} className='ml-1' />
          </button>
        </div>
      </div>

      <div className='w-full flex flex-row mb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide'>
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
        ) : (
          <ListHandler
            key={chosenFilter}
            giftsList={
              chosenFilter === "gainers"
                ? giftType === "line"
                  ? gainersList.slice(0, 3)
                  : gainersList.slice(0, 8)
                : chosenFilter === "losers"
                ? giftType === "line"
                  ? losersList.slice(0, 3)
                  : losersList.slice(0, 8)
                : chosenFilter === "floor"
                ? giftType === "line"
                  ? topList.slice(0, 3)
                  : topList.slice(0, 8)
                : []
            }
            type={giftType}
            background={giftBackground}
            currency={currency}
          />
        )}
      </div>
    </div>
  );
}
