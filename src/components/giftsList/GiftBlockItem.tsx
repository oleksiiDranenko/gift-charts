"use client";
import Image from "next/image";
import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import GiftItemChart from "./GiftItemChart";
import NoPrefetchLink from "../NoPrefetchLink";
import { GiftListItemInterface } from "@/interfaces/GiftListItemInterface";

interface PropsInterface {
  item: GiftListItemInterface;
  currency: "ton" | "usd";
  sortBy:
    | "price"
    | "marketCap"
    | "supply"
    | "initSupply"
    | "starsPrice"
    | "percentChange";
  displayValue: "price" | "marketCap";
  borderColor?: string;
  timeGap: "24h" | "1w" | "1m" | "all";
  background: "color" | "none";
}

export default function GiftBlockItem({
  item,
  currency,
  sortBy,
  displayValue,
  borderColor,
  timeGap,
  background,
}: PropsInterface) {
  const vibrate = useVibrate();

  const [percentChange, setPercentChange] = useState<number | "no data">(0);

  const [isLarge, setIsLarge] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)"); // lg breakpoint
    setIsLarge(media.matches);

    const listener = (e: any) => setIsLarge(e.matches);
    media.addEventListener("change", listener);

    return () => media.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (timeGap === "24h") {
      setPercentChange(
        countPercentChange(item.prices.h24, item.prices.current)
      );
    } else if (timeGap === "1w") {
      setPercentChange(countPercentChange(item.prices.d7, item.prices.current));
    } else if (timeGap === "1m") {
      setPercentChange(
        countPercentChange(item.prices.d30, item.prices.current)
      );
    } else {
      setPercentChange("no data");
    }
  }, [currency, timeGap]);

  const formatNumber = (number: number | undefined | null) => {
    if (number == null) {
      return "N/A"; // Or another fallback value like "0" or ""
    }
    if (number >= 1000 && number < 1000000) {
      const shortNumber = (number / 1000).toFixed(1);
      return `${shortNumber}K`;
    } else if (number >= 1000000) {
      const shortNumber = (number / 1000000).toFixed(1);
      return `${shortNumber}M`;
    }
    return number.toString();
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const countPercentChange = (last24: number, current: number) => {
    return parseFloat((((current - last24) / last24) * 100).toFixed(2));
  };

  return (
    <NoPrefetchLink
      className={`w-full mt-2 gap-y-1 flex flex-col items-center justify-between  rounded-3xl overflow-hidden ${
        background === "color"
          ? `bg-gradient-to-b ${
              percentChange !== "no data" && percentChange >= 0
                ? "from-green-500/5 to-green-500/25"
                : percentChange !== "no data" &&
                  percentChange < 0 &&
                  "from-red-500/5 to-red-500/25"
            }`
          : "bg-secondaryTransparent"
      } `}
      key={item._id}
      href={`/gift/${item._id}`}
      onClick={() => vibrate()}>
      <div className='px-3 pt-3 w-full flex flex-col items-center relative'>
        <Image
          alt='gift image'
          src={`/gifts/${item.image}.webp`}
          width={70}
          height={70}
          className={`p-1 ${borderColor ? "border" : ""}'`}
          style={borderColor ? { borderColor: `${borderColor}80` } : {}}
        />
      </div>

      <div className='px-3 mt-3 flex flex-row items-center justify-end'>
        <div className='w-fit text-sm flex flex-col items-center justify-center'>
          <div className='flex flex-row items-center'>
            {currency === "ton" ? (
              <Image
                alt='ton'
                src='/images/toncoin.webp'
                width={15}
                height={15}
                className='mr-1'
              />
            ) : (
              <Image
                alt='usdt'
                src='/images/usdt.svg'
                width={15}
                height={15}
                className='mr-1'
              />
            )}
            <span className='text-base font-bold'>
              {formatPrice(item.prices.current)}
            </span>
          </div>

          <span
            className={`py-[2px] px-1 mt-2 rounded-3xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
              percentChange !== "no data"
                ? percentChange >= 0
                  ? "text-green-500 bg-green-500"
                  : percentChange < 0
                  ? "text-red-500 bg-red-500"
                  : "text-slate-500"
                : "text-slate-500"
            }`}>
            {percentChange !== "no data" && percentChange >= 0 && "+"}
            {percentChange}
            {percentChange !== "no data" ? "%" : null}
          </span>
        </div>
      </div>
      <div className='w-full flex items-center'>
        <GiftItemChart
          gift={item}
          width={isLarge ? 150 : 100}
          height={isLarge ? 30 : 40}
        />
      </div>
    </NoPrefetchLink>
  );
}
