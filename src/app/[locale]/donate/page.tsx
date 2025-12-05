"use client";

import useVibrate from "@/hooks/useVibrate";
import BackButton from "@/utils/ui/backButton";
import { Check, Copy, HeartHandshake } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function Page() {
  const [copied, setCopied] = useState(false);
  const walletAddress = "UQDduNgyVyGb6M5sTgqOpVpiCDm6hq_xcyfgsommpoMSTF1-";
  const translate = useTranslations("donate");

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
    <div className='w-full lg:w-[98%] pt-[0px] pb-24 flex flex-col px-3'>
      <div className='w-full lg:w-[98%]'>
        <BackButton />
      </div>
      <div className='w-full flex justify-center'>
        <div className='w-full lg:w-1/2 flex flex-col bg-secondaryTransparent rounded-3xl p-3 mt-5 items-center'>
          <h1 className='font-bold mb-3 flex flex-row items-center text-center gap-x-1'>
            {translate("donate")}
          </h1>

          <div
            onClick={handleCopy}
            className='w-full relative bg-background rounded-3xl flex flex-col py-3 pl-3 pr-8'>
            <span className='w-full text-foreground font-bold mb-1 '>
              {translate("tonWallet")}
            </span>
            <p className='w-full text-secondaryText break-all'>
              {walletAddress}
            </p>
            {copied ? (
              <Check
                className='absolute top-3 right-3 text-primary'
                size={20}
              />
            ) : (
              <Copy className='absolute top-3 right-3 text-primary' size={20} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
