"use client";

import GiftModelInterface from "@/interfaces/GiftModelInterface";
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
      className={`lg:hidden w-full h-16 mb-2 flex flex-row items-center justify-between rounded-3xl ${
        resolvedTheme === "dark"
          ? "border-b-2 border-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}>
      <div className='h-full flex flex-row items-center justify-start'>
        <Image
          alt={model.name}
          src={model.image}
          width={50}
          height={50}
          className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-3xl ${
            resolvedTheme === "dark"
              ? "bg-secondaryTransparent "
              : "bg-background"
          }`}
        />
        <div className='flex flex-col'>
          <span className='font-bold mr-2'>{model.name}</span>
          <span className='w-fit text-xs font-bold text-primary px-2 py-1 bg-blue-500 bg-opacity-10 rounded-3xl'>
            {model.rarity}%
          </span>
        </div>
      </div>
      <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center mr-4'>
        <div className='flex flex-row items-center'>
          <Image
            alt='ton logo'
            src='/images/toncoin.webp'
            width={15}
            height={15}
            className='mr-1'
          />
          <span className='text-base font-bold'>{model.priceTon}</span>
        </div>

        <span
          className={`py-[2px] px-1 rounded-3xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
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
  );
}
