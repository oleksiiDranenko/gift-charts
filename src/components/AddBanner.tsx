"use client";

import React, { useState } from "react";
import NoPrefetchLink from "./NoPrefetchLink";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Props {
  className?: string;
  hideable?: boolean; // New prop to control hide functionality
}

export default function AddBanner({ className, hideable = false }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const translateAdd = useTranslations("add");

  if (!isVisible) return null; // Hide banner if not visible

  return (
    <div className='w-full relative'>
      <NoPrefetchLink
        href='https://t.me/tapps_bot/center?startapp=app_giftcharts'
        className={`${className} relative w-full min-h-20 p-3 flex flex-row bg-gradient-to-tr from-primary to-cyan-600 rounded-3xl overflow-hidden`}>
        <div className='w-full h-full relative'>
          <div className='flex flex-col justify-evenly'>
            <div className='flex flex-row'>
              <h1 className='flex flex-row gap-x-1 items-center text-white font-bold text-lg'>
                {translateAdd("title")}
              </h1>
            </div>
            <p className='text-sm text-white/70'>
              {translateAdd("description")}
            </p>
          </div>

          {/* Right arrow icon */}
          <div className='absolute right-1 top-1/2 transform -translate-y-1/2'>
            <Image
              src={
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxb28xJhPJADqj8I_x2w8DmrDgjkWnzS3Fgw&s"
              }
              width={50}
              height={50}
              alt={""}
              className='rounded-full  mt-1'
            />
          </div>
        </div>
        <span className='pointer-events-none absolute inset-0 translate-x-[-100%] animate-shine'>
          <span className='absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12' />
        </span>
      </NoPrefetchLink>

      {/* Close button (only if hideable is true) */}
      {hideable && (
        <button
          onClick={() => setIsVisible(false)}
          className='absolute top-0 right-0 text-foreground bg-secondary rounded-full p-1 flex items-center justify-center transition'>
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
