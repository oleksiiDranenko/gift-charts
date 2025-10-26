"use client";

import useVibrate from "@/hooks/useVibrate";
import BackButton from "@/utils/ui/backButton";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "UQBs_lO45Mcj5oxXtUmu-ZLpC-4cUBWUNKUm7QpPSsx0U28S";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className='w-screen pt-[0px]  pb-24 flex justify-center'>
      <div className='w-full lg:w-5/6'>
        <BackButton />
        <div className='max-w-full flex justify-between items-center p-3 mt-3 mx-3 border border-secondary rounded-2xl'>
          <span className='text-xl font-bold'>🤝 Donate</span>
          <button
            onClick={handleCopy}
            className='flex flex-row items-center justify-center font-bold p-3 gap-x-2 rounded-2xl border border-secondary bg-secondaryTransparent'
            title='Copy to clipboard'>
            <Image
              src={"/images/toncoin.webp"}
              alt='ton logo'
              height={16}
              width={16}
            />
            {copied ? "Copied!" : "Copy Address"}
          </button>
        </div>

        <div className='max-w-full flex flex-col text-center p-3 mt-3 mx-3 border border-secondary rounded-2xl'>
          <h1 className='font-bold mb-3'>Wallet Address:</h1>
          <span className='text-primary'>{walletAddress}</span>
        </div>
      </div>
    </div>
  );
}
