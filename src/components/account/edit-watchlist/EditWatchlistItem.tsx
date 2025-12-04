"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { Trash2 } from "lucide-react";
import { useTheme } from "next-themes";

interface PropsInterface {
  giftId: string;
  giftsList: GiftInterface[];
  removeGift: (id: string) => void;
}

export default function EditWatchlistItem({
  giftId,
  giftsList,
  removeGift,
}: PropsInterface) {
  const vibrate = useVibrate();

  const [gift, setGift] = useState<GiftInterface>();
  const { resolvedTheme } = useTheme();

  const filterGift = () => {
    const gift = giftsList.filter((item) => item._id === giftId);
    setGift(gift[0]);
  };

  useEffect(() => {
    filterGift();
  }, []);

  return (
    <div
      className={`w-full h-16 mb-3 flex flex-row justify-between items-center rounded-3xl pr-3 transition-all active:scale-[95%] duration-200 ease-in-out ${
        resolvedTheme === "dark"
          ? "border-b-2 border-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}>
      <div className='flex flex-row items-center'>
        <Image
          alt='gift image'
          src={`/gifts/${gift?.image}.webp`}
          width={50}
          height={50}
          className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-3xl ${
            resolvedTheme === "dark"
              ? "bg-secondaryTransparent "
              : "bg-background"
          }`}
        />
        <span className='text-base font-bold'>{gift?.name}</span>
      </div>
      <button
        className='p-3 text-red-600 bg-red-600/10 rounded-3xl'
        onClick={() => {
          removeGift(giftId);
          vibrate();
        }}>
        <Trash2 size={20} />
      </button>
    </div>
  );
}
