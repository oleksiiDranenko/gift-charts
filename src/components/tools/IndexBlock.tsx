"use client";

import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import NoPrefetchLink from "../NoPrefetchLink";

interface IndexProps {
  name: string;
  id: string;
  valueType: string;
  tonPrice: number | null | undefined;
  tonPrice24hAgo: number | null | undefined;
  usdPrice: number | null | undefined;
  usdPrice24hAgo: number | null | undefined;
  currency: "ton" | "usd";
}

export default function IndexBlock({
  name,
  id,
  valueType,
  tonPrice,
  tonPrice24hAgo,
  usdPrice,
  usdPrice24hAgo,
  currency,
}: IndexProps) {
  const [indexValue, setIndexValue] = useState<number>(0);
  const [previousIndexValue, setPreviousIndexValue] = useState<number>(0);
  const vibrate = useVibrate();
  const { resolvedTheme } = useTheme();

  // Choose the correct price pair depending on the selected currency
  useEffect(() => {
    const current = currency === "usd" ? usdPrice : tonPrice;
    const previous = currency === "usd" ? usdPrice24hAgo : tonPrice24hAgo;

    if (typeof current === "number") setIndexValue(current);
    else setIndexValue(0);

    if (typeof previous === "number") setPreviousIndexValue(previous);
    else setPreviousIndexValue(0);
  }, [currency, tonPrice, tonPrice24hAgo, usdPrice, usdPrice24hAgo]);

  // Format numbers
  const formatNumber = (value: number, type: string) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    if (type === "price") {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    if (type === "amount") {
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(value));
    }

    if (type === "percent") {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US").format(value);
  };

  const countPercentChange = (oldVal: number, newVal: number) => {
    if (typeof oldVal !== "number" || typeof newVal !== "number") return "0.00";
    if (oldVal === 0) return "0.00";
    const pct = ((newVal - oldVal) / oldVal) * 100;
    return Math.abs(pct).toFixed(2);
  };

  const diff = indexValue - previousIndexValue;
  const diffSign = diff > 0 ? "+" : "";

  return (
    <NoPrefetchLink
      href={`/tools/index/${id}`}
      className={`w-full bg-secondaryTransparent rounded-3xl py-5 px-4 flex flex-col justify-between `}
      onClick={() => vibrate()}>
      <div className='w-full text-sm flex flex-row items-center justify-start gap-x-1'>
        {name}
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-4 text-primary'>
          <path
            fillRule='evenodd'
            d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z'
            clipRule='evenodd'
          />
        </svg>
      </div>

      <div className='mt-2 text-lg font-bold flex flex-row items-center'>
        {/* Icon depending on valueType and currency */}
        {valueType === "price" ? (
          currency === "ton" ? (
            <Image
              alt='ton'
              src='/images/toncoin.webp'
              width={14}
              height={14}
              unoptimized
              className='mr-1'
            />
          ) : (
            <Image
              alt='usdt'
              src='/images/usdt.svg'
              width={14}
              height={14}
              unoptimized
              className='mr-1'
            />
          )
        ) : null}

        <span className='font-bold'>
          {formatNumber(indexValue, valueType)}
          {valueType === "percent" && "%"}
        </span>
      </div>

      {/* 24h % change */}
      <span
        className={`w-fit mt-1 flex flex-row items-center text-sm font-normal ${
          diff > 0
            ? "text-green-500"
            : diff < 0
              ? "text-red-500"
              : "text-slate-500"
        }`}>
        {diff >= 0 ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-4 mr-1'>
            <path
              fillRule='evenodd'
              d='M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z'
              clipRule='evenodd'
            />
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-4 mr-1'>
            <path
              fillRule='evenodd'
              d='M1.72 5.47a.75.75 0 0 1 1.06 0L9 11.69l3.756-3.756a.75.75 0 0 1 .985-.066 12.698 12.698 0 0 1 4.575 6.832l.308 1.149 2.277-3.943a.75.75 0 1 1 1.299.75l-3.182 5.51a.75.75 0 0 1-1.025.275l-5.511-3.181a.75.75 0 0 1 .75-1.3l3.943 2.277-.308-1.149a11.194 11.194 0 0 0-3.528-5.617l-3.809 3.81a.75.75 0 0 1-1.06 0L1.72 6.53a.75.75 0 0 1 0-1.061Z'
              clipRule='evenodd'
            />
          </svg>
        )}
        {countPercentChange(previousIndexValue, indexValue)}%
      </span>
    </NoPrefetchLink>
  );
}
