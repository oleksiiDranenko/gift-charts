"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Globe, Landmark } from "lucide-react";

interface IndexProps {
  name: string;
  id: string;
}

export default function IndexBlock({ name, id }: IndexProps) {
  const giftsList = useAppSelector((state) => state.giftsList);

  const [indexValue, setIndexValue] = useState<number>(0);
  const [previousIndexValue, setPreviousIndexValue] = useState<number>(0);

  const vibrate = useVibrate();

  useEffect(() => {
    if (id === "68493d064b37eed02b7ae5af") {
      // tmc
      let totalMarketCap = 0;
      let prevTotalMarketCap = 0;

      const nonPreSaleGifts = giftsList.filter((gift) => !gift.preSale);

      nonPreSaleGifts.map((gift) => {
        const giftMarketCap = gift.priceTon * gift.upgradedSupply;
        const giftPrevMarketCap =
          (gift.tonPrice24hAgo || 0) * gift.upgradedSupply;

        totalMarketCap += giftMarketCap;
        prevTotalMarketCap += giftPrevMarketCap;
      });

      setIndexValue(totalMarketCap);
      setPreviousIndexValue(prevTotalMarketCap);
    } else if (id === "67faf0d0634d6e48d48360bc") {
      // fdv
      let totalFDV = 0;
      let prevTotalFDV = 0;

      const nonPreSaleGifts = giftsList.filter((gift) => !gift.preSale);

      nonPreSaleGifts.map((gift) => {
        const giftMarketCap = gift.priceTon * gift.supply;
        const giftPrevMarketCap = (gift.tonPrice24hAgo || 0) * gift.supply;

        totalFDV += giftMarketCap;
        prevTotalFDV += giftPrevMarketCap;
      });

      setIndexValue(totalFDV);
      setPreviousIndexValue(prevTotalFDV);
    }
  }, [giftsList]);

  const countPercentChange = (last24: number, current: number) => {
    return parseFloat((((current - last24) / last24) * 100).toFixed(2));
  };

  const formatNumber = (number: number) => {
    const formattedNumber = new Intl.NumberFormat("de-DE").format(number);
    return formattedNumber;
  };

  return (
    <Link
      href={`/tools/index/${id}`}
      className='w-full flex flex-row justify-between h-16 p-3 bg-secondaryTransparent rounded-xl'
      onClick={() => vibrate()}>
      <div className='h-full flex flex-row items-center gap-x-2'>
        <Globe size={26} className='text-primary' />
        <span className='font-bold'>{name}</span>
      </div>
      <div className='flex flex-col items-end justify-between'>
        <div className='flex flex-row items-center'>
          <Image
            alt='ton logo'
            src='/images/toncoin.webp'
            width={14}
            height={14}
            className='mr-1'
          />
          <span className='text-base font-bold'>
            {formatNumber(indexValue)}
          </span>
        </div>
        <span
          className={`py-[2px] px-1 rounded-xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
            indexValue - previousIndexValue >= 0
              ? "text-green-500 bg-green-500"
              : indexValue - previousIndexValue < 0
              ? "text-red-500 bg-red-500"
              : "text-slate-500"
          }`}>
          {indexValue - previousIndexValue >= 0 ? "+" : null}
          {countPercentChange(previousIndexValue, indexValue)}%
        </span>
      </div>
    </Link>
  );
}
