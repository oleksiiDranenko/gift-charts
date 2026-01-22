"use client";

import React, { useState } from "react";
import NoPrefetchLink from "./NoPrefetchLink";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";

interface Props {
  className?: string;
  hideable?: boolean;
}

export default function AddBanner({ className, hideable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const vibrate = useVibrate();

  return (
    <div
      /* - transition-[max-height] creates the 'shrinking' effect.
         - max-h-40 (or similar) must be higher than your banner height to start.
      */
      className={`w-full relative transition-[max-height] duration-500 ease-in-out overflow-hidden ${
        isVisible ? "max-h-64" : "max-h-0"
      }`}>
      <div className='relative w-full'>
        <NoPrefetchLink
          href='https://t.me/mutant_gifts_bot/mutantgifts?startapp=rl_f1e02fca-a966-4fe8-865f-cded194f06fb'
          className={`${className} relative w-full lg:h-24 flex items-center justify-center rounded-2xl overflow-hidden`}>
          {/* BACKGROUND LAYER: Blurred */}
          <div className='absolute inset-0 w-full h-full'>
            <Image
              src={"/images/add_banner.webp"}
              alt={""}
              fill
              className='object-cover blur-lg'
              aria-hidden='true'
            />
          </div>

          {/* TOP LAYER: Sharp image */}
          <div className='relative h-full flex items-center justify-center'>
            <Image
              src={"/images/add_banner.webp"}
              alt={"Banner"}
              width={0}
              height={0}
              sizes='100vh'
              className='h-full w-auto object-contain'
              priority
            />
          </div>
        </NoPrefetchLink>

        {hideable && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsVisible(false);
              vibrate();
            }}
            /* Moved 'top-2 right-2' so it sits neatly inside the 
               rounded-2xl corner of the banner. 
            */
            className='absolute top-0 right-0 text-foreground bg-secondaryTransparent border border-secondary rounded-full p-1 flex items-center justify-center transition z-20 hover:scale-110 active:scale-95'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='w-4 h-4'>
              <path
                fillRule='evenodd'
                d='M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
