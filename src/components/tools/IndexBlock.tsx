"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { AlignEndHorizontal, Gift } from "lucide-react";
import { useEffect, useState } from "react";

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
      className='w-full flex flex-row justify-between items-center h-18 p-3 bg-secondaryTransparent rounded-xl'
      onClick={() => vibrate()}>
      <div className='h-full flex flex-row items-center gap-x-2'>
        <AlignEndHorizontal size={22} className='text-primary' />
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
          className={`py-[2px] px-1 rounded-xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
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
