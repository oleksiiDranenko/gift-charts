"use client";

import GiftModelInterface from "@/interfaces/GiftModelInterface";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Props {
  model: GiftModelInterface;
}

export default function ModelItem({ model }: Props) {
  const [percentChange, setPercentChange] = useState<number | "no data">(0);

  useEffect(() => {
    const countPercentChange = (last24: number, current: number) => {
      return parseFloat((((current - last24) / last24) * 100).toFixed(2));
    };
    setPercentChange(countPercentChange(model.tonPrice24hAgo, model.priceTon));
  });
  return (
    <div
      key={model._id}
      className='w-full h-16 mb-1 flex flex-row items-center justify-between focus:bg-secondaryTransparent rounded-2xl'>
      <div className='h-full flex flex-row items-center justify-start'>
        <Image
          src={model.image}
          alt=''
          width={50}
          height={50}
          className='w-[50px] h-[50px] p-[6px] !overflow-visible mr-2 rounded-2xl bg-secondaryTransparent border border-secondaryTransparent'
        />
        <div className='flex flex-col'>
          <span className='font-bold mr-2'>{model.name}</span>
          <span className='w-fit text-xs font-bold text-primary p-1 bg-blue-500 bg-opacity-10 rounded-2xl'>
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
  );
}
