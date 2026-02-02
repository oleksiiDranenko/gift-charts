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
import { ChevronDown, ChevronUp } from "lucide-react";
import SectionTransition from "@/components/filterGifts/SelectTransition";
import { useTheme } from "next-themes";
import OpenInTelegram from "./OpenInTelegram";

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
  total_value_ton_24h_ago: number;
  total_value_usd_24h_ago: number;
  gifts: Gift[];
}

export default function AccountTest() {
  const user = useAppSelector((state) => state.user);
  const [telegramUser, setTelegramUser] = useState<any>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"grouped" | "list">("grouped");
  const vibrate = useVibrate();
  const { resolvedTheme } = useTheme();
  const [percentChange, setPercentChange] = useState<number | "no data">(0);

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

  const countPercentChange = (last24: number, current: number) => {
    return parseFloat((((current - last24) / last24) * 100).toFixed(2));
  };

  const toggleGroup = (baseName: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(baseName)) {
        newSet.delete(baseName);
      } else {
        newSet.add(baseName);
      }
      return newSet;
    });
    vibrate();
  };

  const groupGiftsByBaseName = (gifts: Gift[]) => {
    const groups = gifts.reduce(
      (acc, gift) => {
        if (!acc[gift.base_name]) {
          acc[gift.base_name] = [];
        }
        acc[gift.base_name].push(gift);
        return acc;
      },
      {} as Record<string, Gift[]>,
    );

    return Object.entries(groups)
      .map(([baseName, gifts]) => {
        const totalTon = gifts.reduce((sum, gift) => sum + gift.priceTon, 0);
        const totalUsd = gifts.reduce((sum, gift) => sum + gift.priceUsd, 0);

        let result = baseName.replace(/\s+/g, "");

        result = result.charAt(0).toLowerCase() + result.slice(1);

        return {
          baseName,
          image: result,
          gifts,
          count: gifts.length,
          totalTon,
          totalUsd,
        };
      })
      .sort((a, b) => {
        // Sort by total value based on current currency
        const aValue = currency === "ton" ? a.totalTon : a.totalUsd;
        const bValue = currency === "ton" ? b.totalTon : b.totalUsd;
        return bValue - aValue; // Sort descending (highest value first)
      });
  };

  useEffect(() => {
    // Get Telegram user data for display purposes
    // Use a more robust approach to handle Telegram WebApp initialization
    const getTelegramUser = () => {
      const telegram = (window as any).Telegram?.WebApp;
      if (telegram?.initDataUnsafe?.user) {
        setTelegramUser(telegram.initDataUnsafe.user);
      } else if (telegram) {
        // If WebApp is available but user data isn't ready yet, wait for it
        telegram.ready();
        if (telegram.initDataUnsafe?.user) {
          setTelegramUser(telegram.initDataUnsafe.user);
        }
      }
    };

    // Try immediately
    getTelegramUser();

    // Also try after a short delay to handle async initialization
    const timeoutId = setTimeout(getTelegramUser, 100);

    // Listen for WebApp ready event if available
    const telegram = (window as any).Telegram?.WebApp;
    if (telegram?.onEvent) {
      telegram.onEvent('ready', getTelegramUser);
    }

    return () => {
      clearTimeout(timeoutId);
      if (telegram?.offEvent) {
        telegram.offEvent('ready', getTelegramUser);
      }
    };
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["userGifts", user.telegramId],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/portfolio/get-gifts/${user.telegramId}`,
      );
      return res.data as PortfolioResponse;
    },
    enabled: !!user.telegramId && user.username !== "_guest",
  });

  useEffect(() => {
    if (!data) return;
    if (
      currency === "ton" &&
      data?.total_value_ton_24h_ago &&
      data?.total_value_ton
    ) {
      setPercentChange(
        countPercentChange(
          data?.total_value_ton_24h_ago,
          data?.total_value_ton,
        ),
      );
    } else if (data?.total_value_usd_24h_ago && data?.total_value_usd) {
      setPercentChange(
        countPercentChange(
          data?.total_value_usd_24h_ago,
          data?.total_value_usd,
        ),
      );
    }
  }, [currency, data]);

  return (
    <div className='px-3'>
      {user.username === "_guest" ? (
        <OpenInTelegram />
      ) : (
        <>
          {/* Portfolio Card */}
          <div className='w-full flex flex-col items-center justify-center gap-3 mb-5'>
            <div className='pl-3 pr-4 py-3 rounded-3xl bg-gradient-to-b from-secondaryTransparent to-secondaryLight w-full flex flex-row items-center justify-between'>
              <div className='flex flex-row items-center gap-3'>
                <div className='relative'>
                  {telegramUser?.photo_url ? (
                    <img
                      src={telegramUser.photo_url}
                      alt='Profile'
                      className='w-16 h-16 rounded-full border-2 border-secondary object-cover'
                    />
                  ) : (
                    <div className='w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-bold text-xl'>
                      {telegramUser?.first_name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className='flex flex-col justify-center items-start'>
                  {/* Displays First Name + Last Name */}
                  <span className='font-bold text-lg leading-tight'>
                    {telegramUser
                      ? `${telegramUser.first_name} ${telegramUser.last_name || ""}`
                      : "Loading..."}
                  </span>
                  {/* Displays @username if it exists */}
                  {telegramUser?.username && (
                    <span className='text-sm text-secondaryText'>
                      @{telegramUser.username}
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
                    unoptimized
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
                <span
                  className={`flex flex-row items-center text-sm font-normal ${
                    percentChange !== "no data"
                      ? percentChange >= 0
                        ? "text-green-500"
                        : percentChange < 0
                          ? "text-red-500"
                          : "text-slate-500"
                      : "text-slate-500"
                  }`}>
                  {percentChange === "no data" ? null : percentChange >= 0 ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-4 mr-1'>
                      <path
                        fillRule='evenodd'
                        d='M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-4 mr-1'>
                      <path
                        fillRule='evenodd'
                        d='M1.72 5.47a.75.75 0 0 1 1.06 0L9 11.69l3.756-3.756a.75.75 0 0 1 .985-.066 12.698 12.698 0 0 1 4.575 6.832l.308 1.149 2.277-3.943a.75.75 0 1 1 1.299.75l-3.182 5.51a.75.75 0 0 1-1.025.275l-5.511-3.181a.75.75 0 0 1 .75-1.3l3.943 2.277-.308-1.149a11.194 11.194 0 0 0-3.528-5.617l-3.809 3.81a.75.75 0 0 1-1.06 0L1.72 6.53a.75.75 0 0 1 0-1.061Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                  {percentChange === "no data" ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-4'>
                      <path
                        fillRule='evenodd'
                        d='M4.25 12a.75.75 0 0 1 .75-.75h14a.75.75 0 0 1 0 1.5H5a.75.75 0 0 1-.75-.75Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    Math.abs(percentChange)
                  )}
                  {percentChange !== "no data" ? "%" : null}
                </span>
              </div>
            </div>

            <div className='w-full mt-2 flex flex-row justify-between items-center'>
              <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-sm h-8 px-3 box-border transition-all ${
                    currency === "ton"
                      ? "rounded-3xl bg-secondary font-bold"
                      : ""
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
                    unoptimized
                  />
                </button>
                <button
                  className={`text-sm h-8 px-3 box-border transition-all ${
                    currency === "usd"
                      ? "rounded-3xl bg-secondary font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrency("usd");
                    vibrate();
                  }}>
                  <Image
                    src='/images/usdt.svg'
                    alt='usdt'
                    width={18}
                    height={18}
                    unoptimized
                  />
                </button>
              </div>
            </div>
          </div>

          <div className=' mb-5 flex justify-between items-center'>
            <h2 className='text-lg font-bold'>
              My Collection{" "}
              <span className='text-secondaryText text-base ml-1 font-normal'>{`(${data?.gifts.length || 0})`}</span>
            </h2>

            <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
              <button
                className={`text-sm h-8 px-3 box-border transition-all flex items-center justify-center ${
                  viewMode === "grouped"
                    ? "rounded-3xl bg-secondary"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setViewMode("grouped");
                  vibrate();
                }}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-5'>
                  <path
                    fillRule='evenodd'
                    d='M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              <button
                className={`text-sm h-8 px-3 box-border transition-all flex items-center justify-center ${
                  viewMode === "list"
                    ? "rounded-3xl bg-secondary"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setViewMode("list");
                  vibrate();
                }}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-5'>
                  <path
                    fillRule='evenodd'
                    d='M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Gift Display */}
          <div className='flex flex-col gap-3'>
            {isLoading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className='h-24 bg-secondary/20 animate-pulse rounded-3xl'
                  />
                ))
            ) : data?.gifts.length === 0 ? (
              <div className='py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-white/10'>
                <p className='text-secondaryText text-sm italic'>
                  No gifts found in this user.
                </p>
              </div>
            ) : viewMode === "grouped" ? (
              // Grouped View
              groupGiftsByBaseName(data?.gifts || []).map((group) => (
                <>
                  <div
                    key={group.baseName}
                    className={` ${resolvedTheme === "dark" ? "pl-1 py-1" : "p-3 bg-secondaryTransparent"} rounded-3xl`}>
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.baseName)}
                      className='w-full flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <Image
                          src={`/cdn-assets/gifts/${group.image}.webp`}
                          alt=''
                          width={60}
                          height={60}
                          className='w-10 h-10 mr-2'
                          unoptimized
                        />
                        <div className='flex flex-col items-start'>
                          <span className='font-bold text-lg'>
                            {group.baseName}
                          </span>
                          <span className='text-sm text-secondaryText'>
                            {group.count} gifts
                          </span>
                        </div>
                      </div>

                      <div className='flex items-center gap-2'>
                        <span className='font-bold flex flex-row justify-start items-center gap-1'>
                          <Image
                            alt={currency}
                            src={
                              currency === "ton"
                                ? "/images/toncoin.webp"
                                : "/images/usdt.svg"
                            }
                            width={20}
                            height={20}
                            unoptimized
                          />
                          <span>
                            {formatPrice(
                              currency === "ton"
                                ? group.totalTon
                                : group.totalUsd,
                            )}
                          </span>
                        </span>
                        {expandedGroups.has(group.baseName) ? (
                          <ChevronUp className='w-5 h-5 text-secondaryText' />
                        ) : (
                          <ChevronDown className='w-5 h-5 text-secondaryText' />
                        )}
                      </div>
                    </button>

                    {/* Expanded Gifts */}
                    <SectionTransition
                      open={expandedGroups.has(group.baseName)}>
                      <div className='mt-4 pb-6 grid grid-cols-3 lg:grid-cols-6 gap-3'>
                        {group.gifts.map((gift, i) => (
                          <GiftItem gift={gift} currency={currency} key={i} />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>
                  {resolvedTheme === "dark" &&
                  !expandedGroups.has(group.baseName) ? (
                    <div className='pl-16 pr-3 w-full'>
                      <div className='bg-secondaryTransparent h-[2px]'></div>
                    </div>
                  ) : null}
                </>
              ))
            ) : (
              // List View (original grid)
              <div className='grid grid-cols-3 lg:grid-cols-6 gap-3'>
                {data?.gifts.map((gift, i) => (
                  <GiftItem gift={gift} currency={currency} key={i} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
