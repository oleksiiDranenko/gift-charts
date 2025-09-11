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
import AddBanner from "./AddBanner";

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);

  const [gainersList, setGainersList] = useState<GiftInterface[]>([]);
  const [losersList, setLosersList] = useState<GiftInterface[]>([]);
  const [topList, setTopList] = useState<GiftInterface[]>([]);
  const [userList, setUserList] = useState<GiftInterface[]>([]);
  const [chosenFilter, setChosenFilter] = useState<
    "gainers" | "losers" | "floor" | "saved"
  >("gainers");
  const containerRef = useRef<HTMLDivElement>(null);
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
    if (giftsList.length > 0) {
      const sortedList = [...giftsList].sort((a, b) =>
        filters.currency === "ton"
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
            filters.currency === "ton"
              ? gift.tonPrice24hAgo
              : gift.usdPrice24hAgo;

          return typeof prev === "number" && prev > 0;
        })
        .sort((a, b) => {
          const changeA =
            filters.currency === "ton"
              ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
              : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

          const changeB =
            filters.currency === "ton"
              ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
              : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

          return changeB - changeA;
        });

      setGainersList(sortedGainers);

      // Losers
      const sortedLosers = [...giftsList]
        .filter((gift) => {
          const prev =
            filters.currency === "ton"
              ? gift.tonPrice24hAgo
              : gift.usdPrice24hAgo;

          return typeof prev === "number" && prev > 0;
        })
        .sort((a, b) => {
          const changeA =
            filters.currency === "ton"
              ? getChange(a.priceTon, a.tonPrice24hAgo ?? 1)
              : getChange(a.priceUsd, a.usdPrice24hAgo ?? 1);

          const changeB =
            filters.currency === "ton"
              ? getChange(b.priceTon, b.tonPrice24hAgo ?? 1)
              : getChange(b.priceUsd, b.usdPrice24hAgo ?? 1);

          return changeA - changeB;
        });

      setLosersList(sortedLosers);
    }
  }, [filters, giftsList]);

  useEffect(() => {
    if (giftsList.length > 0 && user.savedList.length > 0) {
      let filteredList = giftsList.filter((gift) =>
        user.savedList.includes(gift._id)
      );

      filteredList.sort((a, b) =>
        filters.currency === "ton"
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
  }, [filters, giftsList, user.savedList]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div>
      {/* <h1 className="flex flex-row items-center mb-3 px-3">
            <Activity size={24}/>
            <h1 className="text-2xl font-bold ml-1">
                Gift Charts
            </h1>
        </h1> */}
      {/* <div className="mx-3 mb-4">
            <span className="text-secondaryText text-sm">
                ✨ App is <span className="font-bold text-foreground">Free</span> but you can <Link href='/donate' className="font-bold text-primary underline">Donate!</Link>
            </span>
        </div> */}

      <div className='w-full px-3 mb-5'>
        {/* <Link
          href="https://t.me/gift_charts"
          className="w-full h-20 p-3 pr-[120px] flex flex-row bg-gradient-to-br from-cyan-950 to-cyan-700 rounded-xl relative overflow-hidden"
        >
          <div className="flex flex-col justify-center">
            <div className="flex flex-row">
              <h1 className=" text-white font-bold">
                Subscribe to official channel!
              </h1>
            </div>
            <p className="text-xs text-white/70">
              Find out about the latest updates
            </p>
          </div>
          <div className="absolute right-0 top-2">
            <Image
              src="https://gifts.coffin.meme/plush%20pepe/Aqua%20Plush.png"
              alt="pepe"
              width={100}
              height={100}
            />
          </div>
        </Link> */}
        <AddBanner />
      </div>

      <SearchBar />

      <div className='max-w-full mx-3 flex items-center justify-between gap-x-2 mb-3'>
        <div className='w-full flex flex-row bg-secondaryTransparent rounded-xl overflow-hidden'>
          <button
            className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
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
            className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
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
        <div className='w-full flex flex-row bg-secondaryTransparent rounded-xl'>
          <button
            className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
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
            className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
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
        <Link
          className={`w-full text-xs h-8 flex items-center justify-center font-bold text-white bg-primary rounded-xl`}
          href={"/gifts-list"}
          onClick={() => vibrate()}>
          <span>Customise</span>
          <SlidersHorizontal size={14} strokeWidth={2.5} className='ml-[2px]' />
        </Link>
      </div>

      <div className='max-w-full mx-3 gap-x-1 flex items-center justify-between mb-3'>
        <button
          className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
            chosenFilter === "gainers"
              ? "font-bold text-foreground bg-secondary rounded-xl"
              : "text-secondaryText"
          }`}
          onClick={() => setChosenFilter("gainers")}>
          <span>Gainers</span>
          <TrendingUp size={14} className='ml-1' />
        </button>
        <button
          className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
            chosenFilter === "losers"
              ? "font-bold text-foreground bg-secondary rounded-xl"
              : "text-secondaryText"
          }`}
          onClick={() => setChosenFilter("losers")}>
          <span>Losers</span>
          <TrendingDown size={14} className='ml-1' />
        </button>
        <button
          className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
            chosenFilter === "floor"
              ? "font-bold text-foreground bg-secondary rounded-xl"
              : "text-secondaryText"
          }`}
          onClick={() => setChosenFilter("floor")}>
          <span>Floor</span>
          <Trophy size={14} className='ml-1' />
        </button>
        <button
          className={`w-full flex flex-row items-center justify-center text-xs h-8 ${
            chosenFilter === "saved"
              ? "font-bold text-foreground bg-secondary rounded-xl"
              : "text-secondaryText"
          }`}
          onClick={() => setChosenFilter("saved")}>
          <span>Saved</span>
          <Star size={14} className='ml-1' />
        </button>
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
              />
            ) : (
              <div className='flex-none w-full text-center snap-start'>
                <div className='px-3 pt-3 pb-1 font-bold'>
                  Your Watchlist is Empty
                </div>
                <div className='px-3 pt-3 pb-5 text-sm text-secondaryText'>
                  {"Profile -> Settings -> Edit Watchlist"}
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
          />
        )}
      </div>
    </div>
  );
}
