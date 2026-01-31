"use client";

import GiftModelInterface from "@/interfaces/GiftModelInterface";
import { formatPrice } from "@/utils/formatNumber";
import { Percent } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  model: GiftModelInterface;
}

export default function ModelItem({ model }: Props) {
  const [percentChange, setPercentChange] = useState<number | "no data">(0);

  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const countPercentChange = (last24: number, current: number) => {
      return parseFloat((((current - last24) / last24) * 100).toFixed(2));
    };
    setPercentChange(countPercentChange(model.tonPrice24hAgo, model.priceTon));
  });
  return (
    <div
      key={model._id}
      className={`w-full p-3 flex flex-col items-center rounded-3xl active:scale-95 transition-transform duration-200 ${
        resolvedTheme === "dark"
          ? "bg-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}>
      <div className='w-full bg-gradient-to-b from-background to-secondaryTransparent rounded-t-3xl p-3 flex justify-center items-center'>
        <Image
          alt={model.name}
          src={model.image}
          width={50}
          height={50}
          unoptimized
          className={`w-[80px] h-[80px]`}
        />
      </div>
      <div className='w-full flex-col items-start justify-start p-3 space-y-1'>
        <span className=' mr-2'>{model.name}</span>
        <div className='flex flex-row items-center'>
          <span className='text-sm mr-1 text-secondaryText'>Rarity:</span>
          <span className='w-fit text-sm text-primary flex flex-row items-center'>
            {model.rarity}
            <Percent size={12} />
          </span>
        </div>
        <div className='w-fit text-sm flex flex-col items-start justify-center space-y-1'>
          <div className='flex flex-row items-center'>
            <Image
              alt='ton logo'
              src='/images/toncoin.webp'
              width={15}
              height={15}
              unoptimized
              className='mr-1'
            />
            <span className='text-lg font-bold'>
              {formatPrice(model.priceTon)}
            </span>
          </div>

          <span
            className={`flex flex-row items-center text-xs font-normal ${
              percentChange !== "no data"
                ? percentChange >= 0
                  ? "text-green-500"
                  : percentChange < 0
                    ? "text-red-500"
                    : "text-slate-500"
                : "text-slate-500"
            }`}>
            {percentChange === "no data" ? (
              ""
            ) : percentChange >= 0 ? (
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
            {percentChange === "no data" ? "-" : Math.abs(percentChange)}
            {percentChange !== "no data" ? "%" : null}
          </span>
        </div>
      </div>
    </div>
  );
}
