"use client";

import Image from "next/image";
import { Gift } from "./AccountTest";
import useVibrate from "@/hooks/useVibrate";

interface Props {
  gift: Gift;
  currency: "ton" | "usd";
}

export default function GiftItem({ gift, currency }: Props) {
  const vibrate = useVibrate();
  return (
    <div
      className='p-3 bg-secondaryTransparent rounded-3xl transform active:scale-95 transition-transform duration-200'
      onClick={() => vibrate()}>
      <Image
        src={`https://nft.fragment.com/gift/${gift.name.toLowerCase()}.medium.jpg`}
        alt={""}
        width={70}
        height={70}
        className='w-full rounded-3xl mb-3'
      />
      <div className='w-full flex flex-col justify-center items-center'>
        <div className='w-full flex flex-col justify-center items-start gap-y-1'>
          <span className='w-full font-bold truncate'>{gift.base_name}</span>
          <span className='text-xs text-secondaryText'>#{gift.number}</span>
        </div>

        <span className='w-full mt-2 font-bold flex flex-row justify-start items-center rounded-3xl gap-1'>
          {currency === "ton" ? (
            <Image
              alt='ton'
              src='/images/toncoin.webp'
              width={15}
              height={15}
            />
          ) : (
            <Image alt='usdt' src='/images/usdt.svg' width={15} height={15} />
          )}
          <span className='font-bold'>
            {currency === "ton"
              ? gift.priceTon.toFixed(2)
              : gift.priceUsd.toFixed(2)}
          </span>
        </span>
      </div>
    </div>
  );
}
