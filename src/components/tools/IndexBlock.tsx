"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { AlignEndHorizontal, Gift, Info, TrendingUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface IndexProps {
  name: string;
  id: string;
  valueType: string;
  tonPrice: number | null | undefined;
  tonPrice24hAgo: number | null | undefined;
}

export default function IndexBlock({
  name,
  id,
  valueType,
  tonPrice,
  tonPrice24hAgo,
}: IndexProps) {
  const [indexValue, setIndexValue] = useState<number>(0);
  const [previousIndexValue, setPreviousIndexValue] = useState<number>(0);
  const vibrate = useVibrate();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (typeof tonPrice === "number") setIndexValue(tonPrice);
    else setIndexValue(0);

    if (typeof tonPrice24hAgo === "number")
      setPreviousIndexValue(tonPrice24hAgo);
    else setPreviousIndexValue(0);
  }, [tonPrice, tonPrice24hAgo]);

  // Format numbers: for price -> "123,123.50", for amount -> "123,123"
  const formatNumber = (value: number, type: string) => {
    if (typeof value !== "number" || isNaN(value)) return "0";

    if (type === "price") {
      // two decimal places, comma thousands separator, dot decimal
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    if (type === "amount") {
      // integer style with thousands separator, no decimals
      return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
      }).format(Math.round(value));
    }

    if (type === "percent") {
      // percent display - show two decimals
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value);
    }

    // fallback
    return new Intl.NumberFormat("en-US").format(value);
  };

  const countPercentChange = (oldVal: number, newVal: number) => {
    if (typeof oldVal !== "number" || typeof newVal !== "number") return "0.00";
    if (oldVal === 0) {
      // avoid division by zero; define change as 0.00 (or you can show '—')
      return "0.00";
    }
    const pct = ((newVal - oldVal) / oldVal) * 100;
    return pct.toFixed(2);
  };

  const diff = indexValue - previousIndexValue;
  const diffSign = diff > 0 ? "+" : "";

  return (
    <Link
      href={`/tools/index/${id}`}
      className={`w-full flex flex-row justify-between items-center h-18 p-3 rounded-3xl ${
        resolvedTheme === "dark"
          ? "border-b-2 border-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}
      onClick={() => vibrate()}>
      <div className='h-full flex flex-row items-center gap-x-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-6 text-primary'>
          <path
            fillRule='evenodd'
            d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 0 1 .67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 1 1-.671-1.34l.041-.022ZM12 9a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z'
            clipRule='evenodd'
          />
        </svg>

        <span className='font-bold'>{name}</span>
      </div>

      <div className='flex flex-col items-end justify-between gap-y-1'>
        <div className='flex flex-row items-center'>
          {valueType === "price" ? (
            <Image
              alt='ton logo'
              src='/images/toncoin.webp'
              width={14}
              height={14}
              className='mr-1'
            />
          ) : (
            valueType === "amount" && <Gift size={15} className='mr-1' />
          )}

          <span className='text-sm font-bold'>
            {formatNumber(indexValue, valueType)}{" "}
            {valueType === "percent" && "%"}
          </span>
        </div>

        <span
          className={`py-[2px] px-1 rounded-3xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
            diff > 0
              ? "text-green-500 bg-green-500"
              : diff < 0
              ? "text-red-500 bg-red-500"
              : "text-slate-500"
          }`}>
          {diff > 0 ? "+" : ""}
          {countPercentChange(previousIndexValue, indexValue)}%
        </span>
      </div>
    </Link>
  );
}
