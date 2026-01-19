"use client";

import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { useQuery } from "react-query";
import Image from "next/image";
import GiftItem from "./Gift";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import PortfolioChart from "./PortfolioChart";
import { formatPrice } from "@/utils/formatNumber";

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

interface TelegramUser {
  id: number;
  username?: string;
  photo_url?: string;
  first_name: string; // Required by Telegram
  last_name?: string; // Optional
}

export default function AccountTest() {
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const vibrate = useVibrate();

  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.warn("Failed to parse settings from localStorage");
        }
      }
    }
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });

  const [currency, setCurrency] = useState<"ton" | "usd">(settings.currency);

  useEffect(() => {
    // Access the Telegram WebApp SDK
    const telegram = (window as any).Telegram?.WebApp;

    if (telegram?.initDataUnsafe?.user) {
      setTgUser(telegram.initDataUnsafe.user);
    } else {
      // Keep fallback for local development only
      setTgUser({
        id: 754292445,
        username: "_guest",
        first_name: "Guest",
        last_name: "",
        photo_url:
          "https://cloudfront.codeproject.com/gdi-plus/imageprocessing2/img.jpg",
      });
    }
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["userGifts", tgUser?.id],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/portfolio/get-gifts/${tgUser?.id}`,
      );
      return res.data as PortfolioResponse;
    },
    enabled: !!tgUser?.id,
  });

  return (
    <div className='px-3'>
      {/* Portfolio Card */}
      <div className='p-5 bg-gradient-to-b from-secondaryTransparent to-background rounded-t-3xl w-full flex flex-col items-center justify-center gap-5'>
        <div className='w-full flex flex-row items-center justify-between'>
          <div className='flex flex-row items-center gap-3'>
            <div className='relative'>
              {tgUser?.photo_url ? (
                <img
                  src={tgUser.photo_url}
                  alt='Profile'
                  className='w-16 h-16 rounded-full border-2 border-secondary object-cover'
                />
              ) : (
                <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-bold text-xl'>
                  {tgUser?.first_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className='flex flex-col justify-center items-start'>
              {/* Displays First Name + Last Name */}
              <span className='font-bold text-lg leading-tight'>
                {tgUser
                  ? `${tgUser.first_name} ${tgUser.last_name || ""}`
                  : "Loading..."}
              </span>
              {/* Displays @username if it exists */}
              {tgUser?.username && (
                <span className='text-sm text-secondaryText'>
                  @{tgUser.username}
                </span>
              )}
            </div>
          </div>

          <div className='flex flex-col items-end justify-center'>
            <span className='text-2xl flex flex-row justify-start items-center gap-1'>
              <Image
                alt={currency}
                src={
                  currency === "ton"
                    ? "/images/toncoin.webp"
                    : "/images/usdt.svg"
                }
                width={22}
                height={22}
              />
              <span className='font-bold'>
                {isLoading
                  ? "..."
                  : formatPrice(
                      currency === "ton"
                        ? data?.total_value_ton!
                        : data?.total_value_usd!,
                    )}
              </span>
            </span>
            <span className='text-secondaryText text-sm'>
              {data ? `${data.total_gifts} gifts` : "0 gifts"}
            </span>
          </div>
        </div>

        <div className='w-full mt-2 flex flex-row justify-between items-center'>
          <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
            <button
              className={`text-sm h-8 px-3 box-border transition-all ${
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
              className={`text-sm h-8 px-3 box-border transition-all ${
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
      </div>

      <div className='px-3 mb-4 flex justify-between items-end'>
        <h2 className='text-lg font-bold'>My Collection</h2>
        <span className='text-sm text-secondaryText bg-secondary/50 px-2 py-1 rounded-md'>
          {data?.gifts.length || 0} Items
        </span>
      </div>

      {/* Gift Grid */}
      <div className=' grid grid-cols-3 gap-3'>
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className='aspect-square bg-secondary/20 animate-pulse rounded-2xl'
              />
            ))
        ) : data?.gifts.length === 0 ? (
          <div className='col-span-3 py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-white/10'>
            <p className='text-secondaryText text-sm italic'>
              No gifts found in this user.
            </p>
          </div>
        ) : (
          data?.gifts.map((gift, i) => (
            <GiftItem gift={gift} currency={currency} key={i} />
          ))
        )}
      </div>
    </div>
  );
}
