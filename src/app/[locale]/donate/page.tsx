"use client";

import useVibrate from "@/hooks/useVibrate";
import BackButton from "@/utils/ui/backButton";
import { Check, Copy, HeartHandshake } from "lucide-react";
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
    <div className='w-full lg:w-5/6 pt-[0px] pb-24 flex flex-col px-3'>
      <div className='w-full lg:w-5/6'>
        <BackButton />
      </div>
      <div className='flex flex-col mt-3 items-center'>
        <h1 className='text-xl font-bold mb-1 flex flex-row items-center gap-x-1'>
          <HeartHandshake size={20} />
          Donate
        </h1>
        <p className='mb-3'>Thanks you for supporting the app!</p>

        <div
          onClick={handleCopy}
          className='relative bg-secondaryTransparent rounded-2xl flex flex-col py-3 pl-3 pr-8 mb-3'>
          <span className='text-foreground font-bold mb-1'>
            TON Wallet Address
          </span>
          <p className='text-secondaryText'>{walletAddress}</p>
          {copied ? (
            <Check className='absolute top-3 right-3 text-primary' size={20} />
          ) : (
            <Copy className='absolute top-3 right-3 text-primary' size={20} />
          )}
        </div>
      </div>
    </div>
  );
}
