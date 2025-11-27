"use client";

import StarsSwapWidget from "@/components/StarsSwapWidget";
import BackButton from "@/utils/ui/backButton";
import React from "react";

export default function Page() {
  return (
    <div className='w-full pt-[0px]  pb-24 flex justify-center'>
      <div className='w-full lg:w-11/12 px-3'>
        <div className='w-full h-10 mb-5 gap-x-3 flex items-center justify-between'>
          <BackButton />
        </div>
        <div className='w-full flex justify-center'>
          <div className='w-full lg:w-1/2 flex flex-col items-center justify-center bg-secondaryTransparent rounded-3xl p-3'>
            <h1 className='text-2xl font-bold flex flex-row items-center'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-7 text-yellow-400 mr-1'>
                <path
                  fillRule='evenodd'
                  d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
                  clipRule='evenodd'
                />
              </svg>
              Stars Swap
            </h1>
            <p className='mt-3 mb-5 w-full text-center text-secondaryText'>
              Stars Swap was made by our partners{" "}
              <a className='text-primary' href='https://t.me/giftassetapi'>
                @giftassetapi
              </a>
              . <br /> You can swap any coin from TON blockchain to Telegram
              Stars without KYC
            </p>

            <StarsSwapWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
