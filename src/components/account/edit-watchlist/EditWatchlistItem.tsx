"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { Trash2 } from "lucide-react";

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

  const filterGift = () => {
    const gift = giftsList.filter((item) => item._id === giftId);
    setGift(gift[0]);
  };

  useEffect(() => {
    filterGift();
  }, []);

  return (
    <div className='w-full h-16 p-3 mb-3 bg-secondaryTransparent flex flex-row items-center justify-start rounded-2xl'>
      <div className='flex flex-row items-center gap-x-3'>
        <button
          className='p-3 text-red-600 bg-red-600/10 rounded-2xl'
          onClick={() => {
            removeGift(giftId);
            vibrate();
          }}>
          <Trash2 size={20} />
        </button>
        <Image
          alt='gift image'
          src={`/gifts/${gift?.image}.webp`}
          width={50}
          height={50}
          className={`bg-secondary p-1 mr-3 rounded-2xl`}
        />
        <span className='text-base font-bold'>{gift?.name}</span>
      </div>
    </div>
  );
}
