"use client";

import StarsSwapWidget from "@/components/StarsSwapWidget";
import BackButton from "@/utils/ui/backButton";
import React from "react";

export default function Page() {
  return (
    <div className='w-full pt-[0px]  pb-24 flex justify-center'>
      <div className='w-full lg:w-11/12 px-3'>
        <div className='w-full h-10  gap-x-3 flex items-center justify-between'>
          <BackButton />
        </div>
        <StarsSwapWidget />
      </div>
    </div>
  );
}
