"use client";

import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { useQuery } from "react-query";
import Image from "next/image";
import GiftItem from "./Gift";
import { useState } from "react";
import useVibrate from "@/hooks/useVibrate";

export interface GiftAttribute {
  name: string;
  rarity_percent: number;
}

export interface Gift {
  base_name: string;
  name: string;
  number: number;
  priceTon: number;
  priceUsd: number;
  model: GiftAttribute;
  symbol: GiftAttribute;
  backdrop: GiftAttribute;
}

interface PortfolioResponse {
  userId: string;
  currency: string;
  total_gifts: number;
  total_value_ton: number;
  total_value_usd: number;
  gifts: Gift[];
}

export default function AccountTest() {
  const user = useAppSelector((state) => state.user);
  const [currency, setCurrency] = useState<"ton" | "usd">("usd");

  const vibrate = useVibrate();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["userGifts"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/portfolio/get-gifts/${993540775}`
      );
      return res.data as PortfolioResponse;
    },
  });

  return (
    <div className='px-3'>
      <div className='h-40 bg-gradient-to-b from-background to-secondary mb-5 rounded-3xl w-full flex items-center justify-center'>
        <span className='text-3xl flex flex-row justify-start items-center gap-2'>
          {currency === "ton" ? (
            <Image
              alt='ton'
              src='/images/toncoin.webp'
              width={24}
              height={24}
            />
          ) : (
            <Image alt='usdt' src='/images/usdt.svg' width={24} height={24} />
          )}
          <span className='font-bold'>
            {currency === "ton" ? data?.total_value_ton : data?.total_value_usd}
          </span>
        </span>
      </div>
      <div className='mb-5 w-full flex flex-row justify-between'>
        <span>{`${data?.total_gifts} gifts`}</span>
        <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
          <button
            className={`text-sm h-8 px-3 box-border ${
              currency === "ton" ? "rounded-3xl bg-secondary font-bold" : ""
            }`}
            onClick={() => {
              setCurrency("ton");
              vibrate();
            }}>
            <Image
              src='/images/toncoin.webp'
              alt='ton'
              width={18}
              height={18}
            />
          </button>
          <button
            className={`text-sm h-8 px-3 box-border ${
              currency === "usd" ? "rounded-3xl bg-secondary font-bold" : ""
            }`}
            onClick={() => {
              setCurrency("usd");
              vibrate();
            }}>
            <Image src='/images/usdt.svg' alt='usdt' width={18} height={18} />
          </button>
        </div>
      </div>
      <div className='w-full grid grid-cols-3 lg:grid-cols-6 gap-3'>
        {isLoading && "loading..."}
        {data &&
          data.gifts.map((gift, i) => {
            return <GiftItem gift={gift} currency={currency} key={i} />;
          })}
      </div>
    </div>
  );
}
