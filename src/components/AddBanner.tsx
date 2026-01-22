"use client";

import React, { useState } from "react";
import NoPrefetchLink from "./NoPrefetchLink";
import Image from "next/image";

interface Props {
  className?: string;
  hideable?: boolean;
}

export default function AddBanner({ className, hideable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className='w-full relative'>
      <NoPrefetchLink
        href='https://t.me/mutant_gifts_bot/mutantgifts?startapp=rl_f1e02fca-a966-4fe8-865f-cded194f06fb'
        /* - lg:h-20 (80px) restricts the height on large screens.
           - flex items-center justify-center centers the sharp image.
        */
        className={`${className} relative w-full lg:h-24 flex items-center justify-center rounded-2xl overflow-hidden`}>
        {/* BACKGROUND LAYER: Blurred, fills the entire width/height */}
        <div className='absolute inset-0 w-full h-full'>
          <Image
            src={"/images/add_banner.webp"}
            alt={""}
            fill
            className='object-cover blur-lg opacity-100'
            aria-hidden='true'
          />
        </div>

        {/* TOP LAYER: Sharp image, fits height perfectly (top to bottom), width auto-adjusts */}
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
          onClick={() => setIsVisible(false)}
          className='absolute top-0 right-0 text-foreground bg-secondaryTransparent border border-secondary rounded-full p-1 flex items-center justify-center transition'>
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
  );
}
