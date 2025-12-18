"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useEffect, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import ModalBase from "@/utils/ui/ModalBase";
import { useTheme } from "next-themes";

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
  const [inputAmount, setInputAmount] = useState<string | number>(amount);

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();

  const translate = useTranslations("account");

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

  useEffect(() => {
    setInputAmount(amount);
  }, [amount]);

  const handleInputAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputAmount(value === "" ? "" : Math.max(0, Number(value)));
  };

  const handleAmountBlur = () => {
    if (inputAmount === "") {
      setInputAmount(1);
      updateAmount(giftId, 1);
    } else {
      updateAmount(giftId, Number(inputAmount));
    }
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
    <ModalBase
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <div
          className={`w-full h-16 mb-3 flex flex-row rounded-3xl px-2 transition-all active:scale-[95%] duration-200 ease-in-out ${
            resolvedTheme === "dark"
              ? "border-b border-secondaryTransparent"
              : "bg-secondaryTransparent"
          } `}
          onClick={() => setIsOpen(true)}>
          <div className='w-full flex flex-row items-center justify-between'>
            <div className='w-full flex flex-row items-center justify-between'>
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
                <div className='flex flex-col'>
                  <span className='text-base font-bold'>{gift?.name}</span>
                </div>
              </div>
            </div>

            <div className='w-fit flex flex-row flex-nowrap justify-end items-center'>
              <span
                className={`text-nowrap px-3 py-1 rounded-3xl flex items-center justify-center mr-3 font-bold text-primary dark:bg-secondaryTransparent bg-background`}>
                {amount}
              </span>
            </div>
          </div>
        </div>
      }>
      <div>
        <div className='w-full h-10 pb-3 flex justify-end items-center'>
          <button
            onClick={() => setIsOpen(false)}
            className='w-fit p-2 bg-secondaryTransparent rounded-full'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-5'>
              <path
                fillRule='evenodd'
                d='M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>

        <div className=''>
          <div className='flex flex-col items-center justify-center gap-y-3 mb-5'>
            <Image
              alt='gift image'
              src={`/gifts/${gift?.image}.webp`}
              width={70}
              height={70}
              className=''
            />
            <h2 className='text-xl font-bold'>{gift?.name}</h2>
          </div>

          {/* Amount input */}
          <div className='mb-5'>
            <label className='block mb-2 pl-3'>
              {translate("amount") ?? "Amount"}
            </label>
            <input
              type='number'
              min='0'
              step='any'
              value={inputAmount}
              onChange={(e) => {
                vibrate();
                handleInputAmount(e);
              }}
              onBlur={handleAmountBlur}
              className='w-full px-4 py-3 rounded-3xl bg-background border-2 border-secondaryTransparent text-lg focus:outline-none focus:border-primary'
              placeholder='0'
            />
          </div>

          {/* Average price input */}
          <div className='mb-5'>
            <label className='block mb-2 pl-3'>
              {translate("avgPrice") ?? "Average price"}
            </label>
            <input
              type='number'
              min='0'
              step='any'
              value={inputAvgPrice}
              onChange={(e) => {
                vibrate();
                handleAvgPrice(e);
              }}
              onBlur={handleBlur}
              className='w-full px-4 py-3 rounded-3xl bg-background border-2 border-secondaryTransparent text-lg focus:outline-none focus:border-primary'
              placeholder='0'
            />
          </div>

          <button
            onClick={() => {
              if (gift) {
                updateAmount(gift._id, Number(inputAmount || 0));
                updateAvgPrice(gift._id, Number(inputAvgPrice || 0));

                setIsOpen(false);
                vibrate();
              }
            }}
            className='w-full flex items-center justify-center mb-3 gap-x-1 py-3 bg-primary rounded-3xl'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-5'>
              <path
                fillRule='evenodd'
                d='M19.916 4.626a.75.75 0 0 1 .208 1.04l-9 13.5a.75.75 0 0 1-1.154.114l-6-6a.75.75 0 0 1 1.06-1.06l5.353 5.353 8.493-12.74a.75.75 0 0 1 1.04-.207Z'
                clipRule='evenodd'
              />
            </svg>

            {translate("save")}
          </button>

          <button
            onClick={() => {
              removeGift(giftId);
              setIsOpen(false);
              vibrate();
            }}
            className='w-full flex items-center justify-center gap-x-1 py-3 bg-red-500/10 text-red-500 rounded-3xl'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-5'>
              <path
                fillRule='evenodd'
                d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z'
                clipRule='evenodd'
              />
            </svg>

            {translate("removeGift")}
          </button>
        </div>
      </div>{" "}
    </ModalBase>
  );
}
