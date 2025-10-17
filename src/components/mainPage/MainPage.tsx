"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import useVibrate from "@/hooks/useVibrate";
import ListHandler from "./ListHandler";
import SearchBar from "./SearchBar";
import {
  Trophy,
  Star,
  Grid2x2,
  Rows3,
  PaintBucket,
  CircleSlash2,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslations } from "next-intl";
import VoteBanner from "../tools/vote/VoteBanner";

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
      {/* {user.token && <VoteBanner />} */}
      {/* <div className='w-full px-3 mb-4'>
        <Link
          href='https://t.me/gift_charts'
          className='w-full h-24 p-3 flex flex-row bg-gradient-to-br from-cyan-950 to-cyan-700 rounded-xl relative overflow-hidden'>
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

      <div className='max-w-full mx-3 flex items-center justify-between lg:justify-start gap-x-2 mb-3 lg:mb-4'>
        <div className='w-1/2 lg:w-fit flex flex-row gap-x-1'>
          <div className='w-full lg:w-fit flex flex-row bg-secondaryTransparent rounded-xl overflow-hidden'>
            <button
              className={`w-full lg:px-3 flex flex-row items-center justify-center text-xs h-8 ${
                giftType === "line"
                  ? "font-bold text-foreground bg-secondary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setGiftType("line");
                vibrate();
              }}>
              <Rows3 size={18} />
            </button>
            <button
              className={`w-full lg:px-3 flex flex-row items-center justify-center text-xs h-8 ${
                giftType === "block"
                  ? "font-bold text-foreground bg-secondary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setGiftType("block");
                vibrate();
              }}>
              <Grid2x2 size={18} />
            </button>
          </div>
          <div className='w-full lg:w-fit flex flex-row bg-secondaryTransparent rounded-xl'>
            <button
              className={`w-full lg:px-3 flex flex-row items-center justify-center text-xs h-8 ${
                giftBackground === "color"
                  ? "font-bold text-foreground bg-secondary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setGiftBackground("color");
                vibrate();
              }}>
              <PaintBucket size={18} />
            </button>
            <button
              className={`w-full lg:px-3 flex flex-row items-center justify-center text-xs h-8 ${
                giftBackground === "none"
                  ? "font-bold text-foreground bg-secondary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setGiftBackground("none");
                vibrate();
              }}>
              <CircleSlash2 size={18} />
            </button>
          </div>
        </div>
        <div className='w-1/2 lg:w-fit flex flex-row items-center gap-x-1'>
          <div className='w-full lg:w-fit flex items-center justify-between gap-x-2 bg-secondaryTransparent rounded-xl'>
            <button
              className={`w-full lg:px-3 flex flex-row items-center gap-x-2 justify-center text-sm h-8 ${
                currency === "ton"
                  ? "font-bold text-white bg-primary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setCurrency("ton");
                vibrate();
              }}>
              <Image
                src='/images/toncoin.webp'
                alt={""}
                width={15}
                height={15}
              />{" "}
              Ton
            </button>
            <button
              className={`w-full lg:px-3 flex flex-row items-center justify-center text-sm h-8 ${
                currency === "usd"
                  ? "font-bold text-white bg-primary rounded-xl"
                  : "text-secondaryText"
              }`}
              onClick={() => {
                setCurrency("usd");
                vibrate();
              }}>
              $ Usd
            </button>
          </div>
        </div>
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
        <Link
          className={`w-fit text-xs h-8 lg:h-7 mr-3 px-4 flex flex-row text-nowrap gap-x-2 items-center justify-center font-bold text-white bg-primary rounded-xl`}
          href={"/gifts-list"}
          onClick={() => vibrate()}>
          Customise list
          <SlidersHorizontal size={14} strokeWidth={2.5} />
        </Link>
      </div>

      <div className='w-full flex flex-row mb-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide'>
        {chosenFilter === "saved" ? (
          <>
            {userList.length !== 0 ? (
              <ListHandler
                key={chosenFilter}
                giftsList={userList}
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
                ? gainersList
                : chosenFilter === "losers"
                ? losersList
                : chosenFilter === "floor"
                ? topList
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
