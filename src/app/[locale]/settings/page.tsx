"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAppSelector } from "@/redux/hooks";
import useVibrate from "@/hooks/useVibrate";
import LanguageSwitcher from "@/components/languageSwitcher";
import GiftItem from "@/components/giftsList/GiftItem";
import GiftBlockItem from "@/components/giftsList/GiftBlockItem";
import Image from "next/image";
import {
  ChevronRight,
  CircleSlash2,
  Gift,
  Grid2x2,
  LayoutGrid,
  MonitorCog,
  Moon,
  PaintBucket,
  Rows3,
  Star,
  Sun,
} from "lucide-react";
import ListSkeleton from "@/components/giftsList/ListSkeleton";
import { useTranslations } from "next-intl";
import NoPrefetchLink from "@/components/NoPrefetchLink";

type Settings = {
  currency: "ton" | "usd";
  giftType: "line" | "block";
  giftBackground: "color" | "none";
};

export default function Page() {
  const user = useAppSelector((state) => state.user);
  const gifts = useAppSelector((state) => state.giftsList);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translate = useTranslations("settings");

  const [settings, setSettings] = useState<Settings>({
    currency: "ton",
    giftType: "line",
    giftBackground: "none",
  });

  const [isMounted, setIsMounted] = useState(false);

  // Load settings from localStorage once
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch {
        console.warn("Failed to parse settings from localStorage");
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("settings", JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    vibrate();
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className='w-full lg:w-[98%] pt-0 pb-24 px-3 space-y-3'>
      {user.username === "_guest" ? null : (
        <>
          <h1 className='text-xl font-bold'>{translate("accountSettings")}</h1>

          <div className='flex flex-col gap-3 lg:grid lg:grid-cols-2'>
            <NoPrefetchLink
              href='/settings/edit-watchlist'
              className='w-full h-14 px-3 flex flex-row justify-between items-center font-bold bg-secondaryTransparent rounded-3xl'
              onClick={() => vibrate()}>
              <span className='flex flex-row items-center gap-3'>
                <Star size={20} className='text-primary' />
                {translate("editWatchlist")}
              </span>
              <ChevronRight size={20} className='text-primary' />
            </NoPrefetchLink>
          </div>
        </>
      )}

      <h1 className='text-xl font-bold pt-3'>{translate("generalSettings")}</h1>

      <div className='flex flex-col lg:grid lg:grid-cols-2 gap-3'>
        <div className='w-full h-14 box-border p-3 flex justify-between items-center font-bold bg-secondaryTransparent rounded-3xl'>
          <h1>{translate("colorTheme")}</h1>
          <div
            className={`flex flex-row ${
              resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
            } rounded-3xl`}>
            {["light", "dark", "system"].map((t) => (
              <button
                key={t}
                className={`w-full py-2 px-3 flex justify-center ${
                  theme === t
                    ? "font-bold text-white bg-primary rounded-3xl"
                    : "text-secondaryText"
                }`}
                onClick={() => setTheme(t)}>
                {t === "light" && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'>
                    <path d='M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0V3a.75.75 0 0 1 .75-.75ZM7.5 12a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM18.894 6.166a.75.75 0 0 0-1.06-1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591-1.59ZM21.75 12a.75.75 0 0 1-.75.75h-2.25a.75.75 0 0 1 0-1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 1 0-1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1-1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0-1.061-1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591-1.59ZM6 12a.75.75 0 0 1-.75.75H3a.75.75 0 0 1 0-1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06-1.06l-1.59-1.591a.75.75 0 0 0-1.061 1.06l1.59 1.591Z' />
                  </svg>
                )}
                {t === "dark" && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'>
                    <path
                      fillRule='evenodd'
                      d='M9.528 1.718a.75.75 0 0 1 .162.819A8.97 8.97 0 0 0 9 6a9 9 0 0 0 9 9 8.97 8.97 0 0 0 3.463-.69.75.75 0 0 1 .981.98 10.503 10.503 0 0 1-9.694 6.46c-5.799 0-10.5-4.7-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 0 1 .818.162Z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {t === "system" && (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'>
                    <path
                      fillRule='evenodd'
                      d='M2.25 5.25a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3V15a3 3 0 0 1-3 3h-3v.257c0 .597.237 1.17.659 1.591l.621.622a.75.75 0 0 1-.53 1.28h-9a.75.75 0 0 1-.53-1.28l.621-.622a2.25 2.25 0 0 0 .659-1.59V18h-3a3 3 0 0 1-3-3V5.25Zm1.5 0v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-7.5a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5Z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        <LanguageSwitcher />

        {/* Currency */}
        <div className='w-full h-14 box-border px-3 flex justify-between items-center bg-secondaryTransparent rounded-3xl'>
          <h1 className='font-bold'>{translate("currency")}</h1>
          <div
            className={`flex ${
              resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
            } gap-x-1 rounded-3xl`}>
            {(["ton", "usd"] as const).map((currency) => (
              <button
                key={currency}
                className={`px-3 flex items-center justify-center gap-1 text-xs h-8 ${
                  settings.currency === currency
                    ? "font-bold text-white bg-primary rounded-3xl"
                    : "text-secondaryText"
                }`}
                onClick={() => updateSetting("currency", currency)}>
                {currency === "ton" ? (
                  <Image
                    src='/images/toncoin.webp'
                    alt='ton'
                    width={18}
                    height={18}
                    unoptimized
                  />
                ) : (
                  <Image
                    src='/images/usdt.svg'
                    alt='usdt'
                    width={18}
                    height={18}
                    unoptimized
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className='w-full p-3 flex flex-col font-bold bg-secondaryTransparent rounded-3xl'>
          <div className='flex justify-between items-center'>
            <h1>{translate("giftStyle")}</h1>
            <div className='flex gap-x-1'>
              <div
                className={`flex ${
                  resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
                } rounded-3xl overflow-hidden`}>
                <button
                  className={`px-3 h-8 ${
                    settings.giftType === "line"
                      ? "font-bold text-white bg-primary rounded-3xl"
                      : "text-secondaryText"
                  }`}
                  onClick={() => updateSetting("giftType", "line")}>
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
                  className={`px-3 h-8 ${
                    settings.giftType === "block"
                      ? "font-bold text-white bg-primary rounded-3xl"
                      : "text-secondaryText"
                  }`}
                  onClick={() => updateSetting("giftType", "block")}>
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
              <div
                className={`flex ${
                  resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
                } rounded-3xl`}>
                <button
                  className={`px-3 h-8 ${
                    settings.giftBackground === "none"
                      ? "font-bold text-white bg-primary rounded-3xl"
                      : "text-secondaryText"
                  }`}
                  onClick={() => updateSetting("giftBackground", "none")}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'>
                    <path
                      fillRule='evenodd'
                      d='m6.72 5.66 11.62 11.62A8.25 8.25 0 0 0 6.72 5.66Zm10.56 12.68L5.66 6.72a8.25 8.25 0 0 0 11.62 11.62ZM5.105 5.106c3.807-3.808 9.98-3.808 13.788 0 3.808 3.807 3.808 9.98 0 13.788-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788Z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
                <button
                  className={`px-3 h-8 ${
                    settings.giftBackground === "color"
                      ? "font-bold text-white bg-primary rounded-3xl"
                      : "text-secondaryText"
                  }`}
                  onClick={() => updateSetting("giftBackground", "color")}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-5'>
                    <path
                      fillRule='evenodd'
                      d='M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.123 5.25 5.25 0 0 0 9.8-2.62 3.75 3.75 0 0 0-3.75-3.75Z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* <div className='w-full mt-3 px-3 pt-3 pb-1 bg-background rounded-3xl'>
          {settings.giftType === "line" ? (
            gifts.length === 0 ? (
              <ListSkeleton type='line' count={1} hideHeader={true} />
            ) : (
              <GiftItem
                item={gifts[0]}
                currency={settings.currency}
                sortBy='supply'
                displayValue='price'
                timeGap='24h'
                background={settings.giftBackground}
                number={0}
              />
            )
          ) : gifts.length === 0 ? (
            <ListSkeleton type='block' count={1} />
          ) : (
            <div className='grid grid-cols-4 gap-x-2 px-2'>
              <GiftBlockItem
                item={gifts[0]}
                currency={settings.currency}
                sortBy='supply'
                displayValue='price'
                timeGap='24h'
                background={settings.giftBackground}
              />
            </div>
          )}
        </div> */}
        </div>
      </div>
    </div>
  );
}
