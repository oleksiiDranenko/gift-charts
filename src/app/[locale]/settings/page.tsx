"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAppSelector } from "@/redux/hooks";
import useVibrate from "@/hooks/useVibrate";
import LanguageSwitcher from "@/components/languageSwitcher";
import GiftItem from "@/components/giftsList/GiftItem";
import GiftBlockItem from "@/components/giftsList/GiftBlockItem";
import { Link } from "@/i18n/navigation";
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
    value: Settings[K]
  ) => {
    vibrate();
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className='w-full lg:w-11/12 pt-0 pb-24 px-3 space-y-3'>
      <h1 className='text-xl font-bold'>{translate("accountSettings")}</h1>
      {user.username && (
        <div className='flex flex-col gap-3 lg:grid lg:grid-cols-2'>
          <Link
            href='/settings/edit-assets'
            className='w-full h-14 px-3 flex justify-between items-center font-bold bg-secondaryTransparent rounded-3xl'
            onClick={() => vibrate}>
            <span className='flex flex-row items-center gap-3'>
              <Gift size={20} className='text-primary' />
              {translate("editAssets")}
            </span>
            <ChevronRight size={20} className='text-primary' />
          </Link>
          <Link
            href='/settings/edit-watchlist'
            className='w-full h-14 px-3 flex flex-row justify-between items-center font-bold bg-secondaryTransparent rounded-3xl'
            onClick={() => vibrate}>
            <span className='flex flex-row items-center gap-3'>
              <Star size={20} className='text-primary' />
              {translate("editWatchlist")}
            </span>
            <ChevronRight size={20} className='text-primary' />
          </Link>
        </div>
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
                {t === "light" && <Sun size={18} />}
                {t === "dark" && <Moon size={18} />}
                {t === "system" && <MonitorCog size={18} />}
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
            } gap-x-2 rounded-3xl`}>
            {(["ton", "usd"] as const).map((c) => (
              <button
                key={c}
                className={`px-3 flex items-center justify-center gap-2 text-xs h-8 ${
                  settings.currency === c
                    ? "font-bold text-white bg-primary rounded-3xl"
                    : "text-secondaryText"
                }`}
                onClick={() => updateSetting("currency", c)}>
                {c === "ton" && (
                  <Image
                    src='/images/toncoin.webp'
                    alt='ton'
                    width={15}
                    height={15}
                  />
                )}
                {c === "usd" ? "$ Usd" : "Ton"}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Gift Style */}
      <div className='w-full p-3 flex flex-col font-bold bg-secondaryTransparent rounded-3xl'>
        <div className='flex justify-between'>
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
                <Rows3 size={18} />
              </button>
              <button
                className={`px-3 h-8 ${
                  settings.giftType === "block"
                    ? "font-bold text-white bg-primary rounded-3xl"
                    : "text-secondaryText"
                }`}
                onClick={() => updateSetting("giftType", "block")}>
                <LayoutGrid size={18} />
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
                <CircleSlash2 size={18} />
              </button>
              <button
                className={`px-3 h-8 ${
                  settings.giftBackground === "color"
                    ? "font-bold text-white bg-primary rounded-3xl"
                    : "text-secondaryText"
                }`}
                onClick={() => updateSetting("giftBackground", "color")}>
                <PaintBucket size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className='w-full mt-3 px-3 pt-3 pb-1 bg-background rounded-3xl'>
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
        </div>
      </div>
    </div>
  );
}
