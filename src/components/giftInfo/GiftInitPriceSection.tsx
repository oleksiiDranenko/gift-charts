"use client";

import { formatAmount, formatPrice } from "@/utils/formatNumber";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface Props {
  initStarsPrice: number;
  initSupply: number;
  starUsdtCost: number;
}

export default function GiftInitPriceSection({
  initStarsPrice,
  initSupply,
  starUsdtCost,
}: Props) {
  const translate = useTranslations("giftInfo");
  return (
    <div className='w-full flex flex-col gap-y-3 font-normal bg-secondaryTransparent  p-3 rounded-3xl'>
      <div className='w-full flex flex-row justify-between items-center p-2 gap-y-1 border-b border-background dark:border-secondary'>
        <span className='text-secondaryText'>
          {translate("initStarsPrice")}
        </span>
        <div className='flex flex-row items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-4 text-yellow-500 mr-1'>
            <path
              fillRule='evenodd'
              d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
              clipRule='evenodd'
            />
          </svg>
          {formatAmount(initStarsPrice)}
        </div>
      </div>

      <div className='w-full flex flex-row justify-between items-center p-2 gap-y-1 border-b border-background dark:border-secondary'>
        <span className='text-secondaryText'>{translate("initUsdtPrice")}</span>
        <div className='flex flex-row items-center'>
          <Image
            alt='usdt'
            src='/images/usdt.svg'
            width={16}
            height={16}
            className='mr-1'
          />
          {formatPrice(initStarsPrice * starUsdtCost)}
        </div>
      </div>

      <div className='w-full flex flex-row justify-between items-center p-2 gap-y-1 border-b border-background dark:border-secondary'>
        <span className='text-secondaryText'>
          {translate("initStarsMarketcap")}
        </span>
        <div className='flex flex-row items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-4 text-yellow-500 mr-1'>
            <path
              fillRule='evenodd'
              d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
              clipRule='evenodd'
            />
          </svg>
          {formatAmount(initStarsPrice * initSupply)}
        </div>
      </div>

      <div className='w-full flex flex-row justify-between items-center p-2 gap-y-1'>
        <span className='text-secondaryText'>
          {translate("initUsdtMarketcap")}
        </span>
        <div className='flex flex-row items-center'>
          <Image
            alt='usdt'
            src='/images/usdt.svg'
            width={16}
            height={16}
            className='mr-1'
          />
          {formatPrice(initStarsPrice * starUsdtCost * initSupply)}
        </div>
      </div>
    </div>
  );
}
