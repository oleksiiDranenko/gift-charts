"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { Trash2 } from "lucide-react";

interface PropsInterface {
  giftId: string;
  amount: number;
  avgPrice: number;
  giftsList: GiftInterface[];
  removeGift: (id: string) => void;
  updateAmount: (id: string, newAmount: number) => void;
  updateAvgPrice: (id: string, newAvgPrice: number) => void;
}

export default function EditAssetItem({
  giftId,
  amount,
  avgPrice,
  giftsList,
  removeGift,
  updateAmount,
  updateAvgPrice,
}: PropsInterface) {
  const vibrate = useVibrate();
  const [gift, setGift] = useState<GiftInterface>();
  const [inputAvgPrice, setInputAvgPrice] = useState<string | number>(avgPrice);

  const filterGift = () => {
    const gift = giftsList.filter((item) => item._id === giftId);
    setGift(gift[0]);
  };

  useEffect(() => {
    filterGift();
  }, []);

  useEffect(() => {
    // Update inputAvgPrice when avgPrice prop changes
    setInputAvgPrice(avgPrice);
  }, [avgPrice]);

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.valueAsNumber;
    // Only update if value is non-negative or empty (NaN when empty)
    updateAmount(giftId, newAmount);
  };

  const handleAvgPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or valid non-negative number
    setInputAvgPrice(value === "" ? "" : Math.max(0, Number(value)));
  };

  const handleBlur = () => {
    // On blur, if the input is empty, set default value of 1
    if (inputAvgPrice === "") {
      setInputAvgPrice(1);
      updateAvgPrice(giftId, 1);
    } else {
      updateAvgPrice(giftId, Number(inputAvgPrice));
    }
  };

  return (
    <div className='w-full h-auto my-3 py-3 gap-2 flex flex-row bg-secondaryTransparent rounded-xl'>
      <button
        className='m-2 px-3 min-h-full text-red-600 bg-red-600/10 rounded-xl'
        onClick={() => {
          removeGift(giftId);
          vibrate();
        }}>
        <Trash2 size={20} />
      </button>
      <div className='w-full flex flex-col items-center justify-between'>
        <div className='w-full flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center'>
            <Image
              alt='gift image'
              src={`/gifts/${gift?.image}.webp`}
              width={50}
              height={50}
              className={`bg-secondary p-1 mr-3 rounded-xl`}
            />
            <div className='flex flex-col'>
              <span className='text-base font-bold'>{gift?.name}</span>
            </div>
          </div>
        </div>

        <div className='w-full flex flex-row justify-between items-center pr-3'>
          <div className='flex flex-row items-center justify-center gap-x-1'>
            <span className='text-sm mr-2'>Avg price:</span>
            <input
              type='number'
              value={inputAvgPrice}
              onChange={handleAvgPrice}
              onBlur={handleBlur}
              placeholder='0'
              min='0'
              className='w-14 h-8 text-center bg-secondaryTransparent border border-secondary rounded-xl focus:outline-none'
            />
          </div>

          <div className='flex flex-row items-center justify-center gap-x-1'>
            <span className='text-sm mr-2'>Amount:</span>
            <div>
              <input
                type='number'
                value={amount}
                onChange={handleAmount}
                placeholder='0'
                min='0'
                className='w-14 h-8 text-center bg-secondaryTransparent border border-secondary rounded-xl focus:outline-none'
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
