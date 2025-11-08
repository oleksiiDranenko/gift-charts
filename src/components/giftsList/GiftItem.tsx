"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { BadgeCheck, Cannabis } from "lucide-react";
import { useTheme } from "next-themes";
import GiftItemChart from "./GiftItemChart";
import { useTranslations } from "next-intl";

interface PropsInterface {
  item: GiftInterface;
  currency: "ton" | "usd";
  sortBy:
    | "price"
    | "marketCap"
    | "supply"
    | "initSupply"
    | "starsPrice"
    | "percentChange";
  displayValue: "price" | "marketCap";
  timeGap: "24h" | "1w" | "1m" | "all";
  background: "color" | "none";
  number: number;
}

export default function GiftItem({
  item,
  currency,
  sortBy,
  displayValue,
  timeGap,
  background,
  number,
}: PropsInterface) {
  const vibrate = useVibrate();

  const { resolvedTheme } = useTheme();

  const [percentChange, setPercentChange] = useState<number | "no data">(0);
  const [percentChange24h, setPercentChange24h] = useState<number | "no data">(
    0
  );
  const [percentChangeWeek, setPercentChangeWeek] = useState<
    number | "no data"
  >(0);
  const [percentChangeMonth, setPercentChangeMonth] = useState<
    number | "no data"
  >(0);

  const translateNumber = useTranslations("number");

  useEffect(() => {
    // Helper: pick the right price depending on currency
    const currentPrice = currency === "ton" ? item.priceTon : item.priceUsd;
    const price24hAgo =
      currency === "ton" ? item.tonPrice24hAgo : item.usdPrice24hAgo;
    const priceWeekAgo =
      currency === "ton" ? item.tonPriceWeekAgo : item.usdPriceWeekAgo;
    const priceMonthAgo =
      currency === "ton" ? item.tonPriceMonthAgo : item.usdPriceMonthAgo;

    // --- Update main percentChange (based on selected timeGap) ---
    if (price24hAgo && currentPrice) {
      if (timeGap === "24h") {
        setPercentChange(countPercentChange(price24hAgo, currentPrice));
      } else if (timeGap === "1w") {
        priceWeekAgo
          ? setPercentChange(countPercentChange(priceWeekAgo, currentPrice))
          : setPercentChange("no data");
      } else if (timeGap === "1m" || timeGap === "all") {
        priceMonthAgo
          ? setPercentChange(countPercentChange(priceMonthAgo, currentPrice))
          : setPercentChange("no data");
      }
    } else {
      setPercentChange("no data");
    }

    // --- Always calculate 24h / week / month changes for display ---
    if (price24hAgo && currentPrice) {
      setPercentChange24h(countPercentChange(price24hAgo, currentPrice));
    } else {
      setPercentChange24h("no data");
    }

    if (priceWeekAgo && currentPrice) {
      setPercentChangeWeek(countPercentChange(priceWeekAgo, currentPrice));
    } else {
      setPercentChangeWeek("no data");
    }

    if (priceMonthAgo && currentPrice) {
      setPercentChangeMonth(countPercentChange(priceMonthAgo, currentPrice));
    } else {
      setPercentChangeMonth("no data");
    }
  }, [currency, timeGap]);

  const formatNumber = (number: number | undefined | null) => {
    if (number == null) {
      return "N/A"; // Or another fallback value like "0" or ""
    }
    if (number >= 1000 && number < 1000000) {
      const shortNumber = (number / 1000).toFixed(1);
      return shortNumber;
    } else if (number >= 1000000) {
      const shortNumber = (number / 1000000).toFixed(1);
      return shortNumber;
    }
    return number.toString();
  };

  const formatNumberWithWord = (number: number | undefined | null) => {
    if (number == null) {
      return "N/A"; // Or another fallback value like "0" or ""
    }
    if (number >= 1000 && number < 1000000) {
      const shortNumber = (number / 1000).toFixed(1);
      return `${shortNumber}${translateNumber("thousand")}`;
    } else if (number >= 1000000) {
      const shortNumber = (number / 1000000).toFixed(1);
      return `${shortNumber}${translateNumber("million")}`;
    }
    return number.toString();
  };

  const countPercentChange = (last24: number, current: number) => {
    return parseFloat((((current - last24) / last24) * 100).toFixed(2));
  };

  return (
    <>
      <Link
        className={`lg:hidden w-full h-16 mb-2 flex flex-row items-center justify-between rounded-2xl ${
          background === "color"
            ? `bg-gradient-to-r ${
                percentChange !== "no data" && percentChange >= 0
                  ? "from-green-500/5 to-green-500/25"
                  : percentChange !== "no data" &&
                    percentChange < 0 &&
                    "from-red-500/5 to-red-500/25"
              }`
            : resolvedTheme === "dark"
            ? "border-secondaryTransparent border-b-2"
            : "bg-secondaryTransparent"
        }`}
        key={item._id}
        href={`/gift/${item._id}`}
        onClick={() => vibrate()}>
        <div className=' flex flex-row items-center'>
          <Image
            alt={item.name}
            src={`/gifts/${item.image}.webp`}
            width={50}
            height={50}
            className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-2xl ${
              resolvedTheme === "dark"
                ? "bg-secondaryTransparent "
                : "bg-background"
            }`}
          />
          <div className='flex flex-col gap-y-[2px]'>
            <span className='flex flex-row items-center text-base font-bold'>
              {item.name}

              {item.preSale && (
                <span className='text-xs text-cyan-500 ml-2 py-1 px-2 bg-cyan-500/10 rounded-2xl'>
                  Pre-Market
                </span>
              )}
            </span>
            <span className='text-secondaryText gap-y-1 w-fit rounded-lg text-xs font-normal'>
              {sortBy === "price"
                ? formatNumber(item.upgradedSupply) +
                  " / " +
                  formatNumberWithWord(item.supply)
                : sortBy === "marketCap" && displayValue === "price"
                ? formatNumber(
                    currency === "ton"
                      ? item.priceTon * item.upgradedSupply
                      : item.priceUsd * item.upgradedSupply
                  )
                : sortBy === "marketCap" && displayValue === "marketCap"
                ? formatNumber(item.upgradedSupply) +
                  " / " +
                  formatNumberWithWord(item.supply)
                : sortBy === "percentChange"
                ? formatNumber(item.upgradedSupply) +
                  " / " +
                  formatNumberWithWord(item.supply)
                : sortBy === "supply"
                ? formatNumber(item.upgradedSupply) +
                  " / " +
                  formatNumberWithWord(item.supply)
                : sortBy === "initSupply"
                ? formatNumber(item.upgradedSupply) +
                  " / " +
                  formatNumberWithWord(item.initSupply)
                : sortBy === "starsPrice"
                ? `${item.starsPrice} ⭐`
                : null}
            </span>
          </div>
        </div>

        <div className=' flex flex-row items-center justify-end'>
          <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center mr-3'>
            <div className='flex flex-row items-center'>
              {currency === "ton" ? (
                <Image
                  alt='ton logo'
                  src='/images/toncoin.webp'
                  width={15}
                  height={15}
                  className='mr-1'
                />
              ) : (
                <span className='mr-[2px] text-secondaryText'>$</span>
              )}
              <span className='text-base font-bold'>
                {currency === "ton" && displayValue === "price"
                  ? item.priceTon
                  : currency === "ton" && displayValue === "marketCap"
                  ? formatNumberWithWord(item.priceTon * item.upgradedSupply)
                  : currency === "usd" && displayValue === "price"
                  ? item.priceUsd.toFixed(2)
                  : currency === "usd" && displayValue === "marketCap"
                  ? formatNumberWithWord(item.priceUsd * item.upgradedSupply)
                  : null}
              </span>
            </div>

            <span
              className={`py-[2px] px-1 rounded-2xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
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
      </Link>

      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}
      {/* wide screen */}

      <div className='hidden lg:block'>
        <Link
          className={`w-full h-16 flex flex-row items-center justify-between  ${
            background === "color"
              ? `bg-gradient-to-r ${
                  percentChange !== "no data" && percentChange >= 0
                    ? "from-green-500/5 to-green-500/25"
                    : percentChange !== "no data" &&
                      percentChange < 0 &&
                      "from-red-500/5 to-red-500/25"
                }`
              : resolvedTheme === "dark"
              ? "bg-none hover:bg-secondaryTransparent border-b border-secondaryTransparent rounded-2xl"
              : "bg-secondaryTransparent hover:bg-background border-b border-secondary rounded-2xl"
          }`}
          key={item._id}
          href={`/gift/${item._id}`}
          onClick={() => vibrate()}>
          <div className='w-1/3 flex flex-row items-center'>
            <span className='mx-5 text-secondaryText text-sm'>
              {number + 1}
            </span>
            <Image
              alt='gift image'
              src={`/gifts/${item.image}.webp`}
              width={50}
              height={50}
              className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-2xl ${
                resolvedTheme === "dark"
                  ? "bg-secondaryTransparent"
                  : "bg-background"
              }`}
            />

            <div className='flex flex-col gap-y-[2px]'>
              <span className='flex flex-row items-center text-base font-bold'>
                {item.name}
                {item.preSale && (
                  <span className='text-xs text-cyan-500 ml-2 py-1 px-2 bg-cyan-500/10 rounded-2xl'>
                    Pre-Market
                  </span>
                )}
              </span>
              <span className='text-secondaryText gap-y-1 w-fit rounded-lg text-xs font-normal'>
                {sortBy === "price"
                  ? formatNumber(item.upgradedSupply) +
                    " / " +
                    formatNumberWithWord(item.supply)
                  : sortBy === "marketCap" && displayValue === "price"
                  ? formatNumber(
                      currency === "ton"
                        ? item.priceTon * item.upgradedSupply
                        : item.priceUsd * item.upgradedSupply
                    )
                  : sortBy === "marketCap" && displayValue === "marketCap"
                  ? formatNumber(item.upgradedSupply) +
                    " / " +
                    formatNumberWithWord(item.supply)
                  : sortBy === "percentChange"
                  ? formatNumber(item.upgradedSupply) +
                    " / " +
                    formatNumberWithWord(item.supply)
                  : sortBy === "supply"
                  ? formatNumber(item.upgradedSupply) +
                    " / " +
                    formatNumberWithWord(item.supply)
                  : sortBy === "initSupply"
                  ? formatNumber(item.upgradedSupply) +
                    " / " +
                    formatNumberWithWord(item.initSupply)
                  : sortBy === "starsPrice"
                  ? `${item.starsPrice} ⭐`
                  : null}
              </span>
            </div>
          </div>

          <div className='w-1/3 flex flex-row'>
            <div className='w-full flex flex-row justify-start items-center'>
              {currency === "ton" ? (
                <Image
                  alt='ton logo'
                  src='/images/toncoin.webp'
                  width={15}
                  height={15}
                  className='mr-1'
                />
              ) : (
                <span className='mr-1 text-sm'>$</span>
              )}
              <span className='text-sm'>
                {currency === "ton" ? item.priceTon : item.priceUsd.toFixed(2)}
              </span>
            </div>

            <div className='w-full flex flex-row justify-start items-center'>
              {currency === "ton" ? (
                <Image
                  alt='ton logo'
                  src='/images/toncoin.webp'
                  width={15}
                  height={15}
                  className='mr-1'
                />
              ) : (
                <span className='mr-1 text-sm'>$</span>
              )}
              <span className='text-sm'>
                {currency === "ton"
                  ? formatNumberWithWord(item.priceTon * item.upgradedSupply)
                  : formatNumberWithWord(item.priceUsd * item.upgradedSupply)}
              </span>
            </div>
          </div>

          <div className='w-1/3 flex flex-row'>
            <div className='w-full flex flex-row justify-start items-center'>
              <span
                className={`py-[2px] px-1 rounded-2xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
                  percentChange24h !== "no data"
                    ? percentChange24h >= 0
                      ? "text-green-500 bg-green-500"
                      : percentChange24h < 0
                      ? "text-red-500 bg-red-500"
                      : "text-slate-500"
                    : "text-slate-500"
                }`}>
                {percentChange24h !== "no data" && percentChange24h >= 0 && "+"}
                {percentChange24h}
                {percentChange24h !== "no data" ? "%" : null}
              </span>
            </div>

            <div className='w-full flex flex-row justify-start items-center'>
              <span
                className={`py-[2px] px-1 rounded-2xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
                  percentChangeWeek !== "no data"
                    ? percentChangeWeek >= 0
                      ? "text-green-500 bg-green-500"
                      : percentChangeWeek < 0
                      ? "text-red-500 bg-red-500"
                      : "text-slate-500"
                    : "text-slate-500"
                }`}>
                {percentChangeWeek !== "no data" &&
                  percentChangeWeek >= 0 &&
                  "+"}
                {percentChangeWeek}
                {percentChangeWeek !== "no data" ? "%" : null}
              </span>
            </div>

            <div className='w-full flex flex-row justify-start items-center'>
              <span
                className={`py-[2px] px-1 rounded-2xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
                  percentChangeMonth !== "no data"
                    ? percentChangeMonth >= 0
                      ? "text-green-500 bg-green-500"
                      : percentChangeMonth < 0
                      ? "text-red-500 bg-red-500"
                      : "text-slate-500"
                    : "text-slate-500"
                }`}>
                {percentChangeMonth !== "no data" &&
                  percentChangeMonth >= 0 &&
                  "+"}
                {percentChangeMonth}
                {percentChangeMonth !== "no data" ? "%" : null}
              </span>
            </div>
          </div>

          {/* <div className=' flex flex-row items-center justify-end'>
            <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center mr-3'>
              <div className='flex flex-row items-center'>
                {currency === "ton" ? (
                  <Image
                    alt='ton logo'
                    src='/images/toncoin.webp'
                    width={15}
                    height={15}
                    className='mr-1'
                  />
                ) : (
                  <span className='mr-1'>$</span>
                )}
                <span className='text-base font-bold'>
                  {currency === "ton" && displayValue === "price"
                    ? item.priceTon
                    : currency === "ton" && displayValue === "marketCap"
                    ? formatNumberWithWord(item.priceTon * item.upgradedSupply)
                    : currency === "usd" && displayValue === "price"
                    ? item.priceUsd.toFixed(2)
                    : currency === "usd" && displayValue === "marketCap"
                    ? formatNumberWithWord(item.priceUsd * item.upgradedSupply)
                    : null}
                </span>
              </div>

              <span
                className={`py-[2px] px-1 rounded-2xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
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
          </div> */}
        </Link>
      </div>
    </>
  );
}
