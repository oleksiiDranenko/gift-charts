"use client";

import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
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
      className={`w-full h-16 my-2 pl-3 pr-3 flex flex-row items-center justify-start rounded-2xl
        transition-all duration-200 ease-in-out
        ${selected ? "bg-secondaryTransparent" : "bg-transparent"}
      `}
      key={gift._id}
      onClick={() => {
        onClick(gift);
        vibrate();
      }}>
      <div className='w-8 h-8 mr-3 flex justify-center items-center transition-colors duration-300'>
        {selected ? (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-6 text-primary transition-colors duration-300'>
            <path
              fillRule='evenodd'
              d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z'
              clipRule='evenodd'
            />
          </svg>
        ) : (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-6 text-secondary transition-colors duration-300'>
            <path
              fillRule='evenodd'
              d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z'
              clipRule='evenodd'
            />
          </svg>
        )}
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
