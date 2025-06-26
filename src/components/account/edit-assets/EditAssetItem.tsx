
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
  updateAvgPrice
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

  const handleAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.valueAsNumber;
      updateAmount(giftId, newAmount);
  };

  const handleAvgPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAvgPrice = e.target.valueAsNumber;
      updateAvgPrice(giftId, newAvgPrice);
  };

  return (
    <div className="w-full h-auto my-3 py-3 gap-2 flex flex-row bg-slate-800 bg-opacity-35 rounded-lg">
      <button
        className="m-2 text-red-600"
        onClick={() => {
          removeGift(giftId);
          vibrate();
        }}
      >
        <Trash2 size={20} />
      </button>
      <div className="w-full flex flex-col items-center justify-between">
        <div className="w-full flex flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <Image
              alt="gift image"
              src={`/gifts/${gift?.image}.webp`}
              width={50}
              height={50}
              className={`bg-slate-800 p-1 mr-3 rounded-lg`}
            />
            <div className="flex flex-col">
              <span className="text-base font-bold">{gift?.name}</span>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-row justify-between items-center pr-3">
          <div className="flex flex-row items-center justify-center gap-x-1">
            <span className="text-sm text-slate-400 mr-2">Avg price:</span>
            <input
              type="number"
              value={avgPrice}
              onChange={handleAvgPrice}
              placeholder="0"
              className="w-14 h-8 text-center bg-slate-800 bg-opacity-50 rounded-lg focus:outline-none focus:bg-opacity-70"
            />
          </div>

          <div className="flex flex-row items-center justify-center gap-x-1">
            <span className="text-sm text-slate-400 mr-2">Amount:</span>
            <div>
              <input
                type="number"
                value={amount}
                onChange={handleAmount}
                placeholder="0"
                className="w-14 h-8 text-center bg-slate-800 bg-opacity-50 rounded-lg focus:outline-none focus:bg-opacity-70"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}