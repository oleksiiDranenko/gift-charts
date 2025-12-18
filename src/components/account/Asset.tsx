"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import NoPrefetchLink from "../NoPrefetchLink";

interface PropsInterface {
  _id: string;
  name: string;
  image: string;
  currency: "ton" | "usd";
  amount: number;
  avgPrice: number;
  priceTon: number;
  priceUsd: number;
  assetsPrice: number;
  percentChange: number;
}

export default function Asset({
  _id,
  name,
  image,
  currency,
  amount,
  avgPrice,
  priceTon,
  priceUsd,
  assetsPrice,
  percentChange,
}: PropsInterface) {
  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translate = useTranslations("account");
  return (
    <NoPrefetchLink
      className={`w-full h-16 mb-2 pl-2 pr-3 flex flex-row items-center rounded-3xl justify-between ${
        resolvedTheme === "dark"
          ? "border-b border-secondaryTransparent"
          : "bg-secondaryTransparent"
      }`}
      href={`/gift/${_id}`}
      onClick={() => vibrate()}>
      <div className='w-full flex flex-row items-center justify-between'>
        <div className=' flex flex-row items-center'>
          <Image
            alt='gift image'
            src={`/gifts/${image}.webp`}
            width={50}
            height={50}
            className={`w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 rounded-full ${
              resolvedTheme === "dark"
                ? "bg-secondaryTransparent"
                : "bg-background"
            }`}
          />
          <div className='flex flex-col'>
            <span className='text-base font-bold'>
              {name}{" "}
              <span className='ml-1 text-sm font-normal text-secondaryText'>
                {currency === "ton"
                  ? ` (${Math.round(
                      ((priceTon * amount) / assetsPrice) * 100
                    )}%)`
                  : ` (${Math.round(
                      ((priceUsd * amount) / assetsPrice) * 100
                    )}%)`}
              </span>
            </span>
            <div className='w-fit flex flex-tow items-center text-sm text-primary gap-x-1'>
              <span>{amount}</span>
              <span>{amount > 1 ? translate("gifts") : translate("gift")}</span>
            </div>
          </div>
        </div>

        <div className=' flex flex-row items-center justify-end'>
          <div className='w-fit gap-y-[2px] text-sm flex flex-col items-end justify-center'>
            <div className='flex flex-row items-center'>
              {currency === "ton" ? (
                <Image
                  alt='ton'
                  src='/images/toncoin.webp'
                  width={15}
                  height={15}
                  className='mr-1'
                />
              ) : (
                <Image
                  alt='usdt'
                  src='/images/usdt.svg'
                  width={15}
                  height={15}
                  className='mr-1'
                />
              )}
              <span className='text-base font-bold'>
                {currency === "ton" ? priceTon : priceUsd}
              </span>
            </div>

            <span
              className={`py-[2px] px-1 rounded-3xl bg-opacity-10 flex flex-row items-center text-xs font-normal ${
                percentChange >= 0
                  ? "text-green-500 bg-green-500"
                  : percentChange < 0
                  ? "text-red-500 bg-red-500"
                  : ""
              }`}>
              {percentChange >= 0 && "+"}
              {percentChange}%
            </span>
          </div>
        </div>
      </div>
    </NoPrefetchLink>
  );
}
