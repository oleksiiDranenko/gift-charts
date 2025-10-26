"use client";

import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
import { Check, Star } from "lucide-react";
import Image from "next/image";

interface PropsInterface {
  gift: GiftInterface;
  selected: boolean;
  onClick: (gift: GiftInterface) => void;
}

export default function FilterGiftItem({
  gift,
  selected,
  onClick,
}: PropsInterface) {
  const vibrate = useVibrate();

  return (
    <div
      className={`w-full h-16 my-2 pl-3 pr-3 flex flex-row items-center justify-start ${
        selected && "bg-secondaryTransparent"
      } rounded-2xl`}
      key={gift._id}
      onClick={() => {
        onClick(gift);
        vibrate();
      }}>
      <div
        className={`w-8 h-8 mr-3 flex justify-center items-center border border-secondary rounded-2xl ${
          selected && "bg-secondaryTransparent"
        }`}>
        {selected && <Check size={16} className='text-primary' />}
      </div>
      <div className='h-full flex flex-row items-center justify-start'>
        <Image
          alt='gift image'
          src={`/gifts/${gift.image}.webp`}
          width={50}
          height={50}
          className='w-[50px] h-[50px] p-[6px] !overflow-visible mr-2 rounded-2xl bg-secondaryTransparent border border-secondaryTransparent'
        />
        <div className='flex flex-col'>
          <span className='text-base font-bold'>{gift.name}</span>
        </div>
      </div>
    </div>
  );
}
