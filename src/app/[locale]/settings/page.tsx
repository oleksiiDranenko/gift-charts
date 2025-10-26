"use client";

import LanguageSwitcher from "@/components/languageSwitcher";
import useVibrate from "@/hooks/useVibrate";
import { useAppSelector } from "@/redux/hooks";
import {
  ChevronRight,
  CircleSlash2,
  Gift,
  Grid2x2,
  MonitorCog,
  Moon,
  PaintBucket,
  Palette,
  Rows3,
  Star,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import GiftItem from "@/components/giftsList/GiftItem";
import GiftBlockItem from "@/components/giftsList/GiftBlockItem";

export default function Page() {
  const user = useAppSelector((state) => state.user);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const gifts = useAppSelector((state) => state.giftsList);

  const vibrate = useVibrate();

  const [isMounted, setIsMounted] = useState(false);

  const [currency, setCurrency] = useState<"ton" | "usd">(
    typeof window !== "undefined"
      ? (localStorage.getItem("currency") as "ton" | "usd") || "ton"
      : "ton"
  );

  const [giftType, setGiftType] = useState<"line" | "block">(
    typeof window !== "undefined"
      ? (localStorage.getItem("giftType") as "line" | "block") || "line"
      : "line"
  );

  const [giftBackground, setGiftBackground] = useState<"color" | "none">(
    typeof window !== "undefined"
      ? (localStorage.getItem("giftBackground") as "color" | "none") || "none"
      : "none"
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("currency", currency);
    }
  }, [currency, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("giftType", giftType);
    }
  }, [giftType, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("giftBackground", giftBackground);
    }
  }, [giftBackground, isMounted]);

  return (
    <div className='w-full lg:w-5/6 pt-[0px] pb-24 px-3 space-y-3'>
      <h1 className='text-xl font-bold'>Account settings</h1>
      {user.username !== "_guest" && (
        <>
          <Link
            href={"/settings/edit-assets"}
            className='w-full h-14 px-3 flex justify-between items-center font-bold bg-secondaryTransparent rounded-2xl'
            onClick={() => vibrate()}>
            <span className='flex flex-row items-center gap-3'>
              <Gift size={20} />
              Edit Assets
            </span>
            <ChevronRight />
          </Link>
          <Link
            href={"/settings/edit-watchlist"}
            className='w-full h-14 px-3 flex flex-row justify-between items-center font-bold bg-secondaryTransparent rounded-2xl'
            onClick={() => vibrate()}>
            <span className='flex flex-row items-center gap-3'>
              <Star size={20} />
              Edit Watchlist
            </span>
            <ChevronRight />
          </Link>
        </>
      )}

      <h1 className='text-xl font-bold pt-3'>General settings</h1>

      <div className='w-full p-3 gap-y-3 flex flex-row justify-between font-bold bg-secondaryTransparent rounded-2xl'>
        <div className='flex flex-row items-center'>
          <h1>Color Theme</h1>
        </div>
        <div
          className={`flex flex-row ${
            resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
          } rounded-2xl`}>
          <button
            className={`w-full p-3 flex flex-row items-center justify-center gap-y-1 ${
              theme === "light"
                ? "font-bold text-foreground bg-primary rounded-2xl text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("light")}>
            <Sun size={18} />
          </button>
          <button
            className={`w-full p-3 flex flex-row items-center justify-center gap-y-1 ${
              theme === "dark"
                ? "font-bold text-foreground bg-primary rounded-2xl text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("dark")}>
            <Moon size={18} />
          </button>
          <button
            className={`w-full p-3 flex flex-row items-center justify-center gap-y-1 ${
              theme === "system"
                ? "font-bold text-foreground bg-primary rounded-2xl text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("system")}>
            <MonitorCog size={18} />
          </button>
        </div>
      </div>

      <LanguageSwitcher />

      <div className='w-full h-14 px-3 flex justify-between items-center font-bold bg-secondaryTransparent rounded-2xl'>
        <h1>Currency</h1>
        <div className='w-fit flex items-center justify-between bg-secondary gap-x-2 rounded-2xl'>
          <button
            className={`w-full px-3 flex flex-row items-center gap-x-2 justify-center text-xs h-8 ${
              currency === "ton"
                ? "font-bold text-white bg-primary rounded-2xl"
                : "text-secondaryText font-normal"
            }`}
            onClick={() => {
              setCurrency("ton");
              vibrate();
            }}>
            <Image src='/images/toncoin.webp' alt={""} width={15} height={15} />{" "}
            Ton
          </button>
          <button
            className={`w-full px-3 flex flex-row items-center justify-center text-xs h-8 ${
              currency === "usd"
                ? "font-bold text-white bg-primary rounded-2xl"
                : "text-secondaryText font-normal"
            }`}
            onClick={() => {
              setCurrency("usd");
              vibrate();
            }}>
            $ Usd
          </button>
        </div>
      </div>

      <div className='w-full p-3 flex flex-col items-start font-bold bg-secondaryTransparent rounded-2xl'>
        <div className='w-full flex flex-row items-center text-center justify-between'>
          <h1>Gift style</h1>
          <div className='flex flex-row gap-x-1'>
            <div className='w-fit flex flex-row bg-secondary rounded-2xl overflow-hidden'>
              <button
                className={`px-3 flex flex-row items-center justify-center text-xs h-8 ${
                  giftType === "line"
                    ? "font-bold text-white bg-primary rounded-2xl"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setGiftType("line");
                  vibrate();
                }}>
                <Rows3 size={18} />
              </button>
              <button
                className={`px-3 flex flex-row items-center justify-center text-xs h-8 ${
                  giftType === "block"
                    ? "font-bold text-white bg-primary rounded-2xl"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setGiftType("block");
                  vibrate();
                }}>
                <Grid2x2 size={18} />
              </button>
            </div>
            <div className='w-fit flex flex-row bg-secondary rounded-2xl'>
              <button
                className={`px-3 flex flex-row items-center justify-center text-xs h-8 ${
                  giftBackground === "color"
                    ? "font-bold text-white bg-primary rounded-2xl"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setGiftBackground("color");
                  vibrate();
                }}>
                <PaintBucket size={18} />
              </button>
              <button
                className={`px-3 flex flex-row items-center justify-center text-xs h-8 ${
                  giftBackground === "none"
                    ? "font-bold text-white bg-primary rounded-2xl"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setGiftBackground("none");
                  vibrate();
                }}>
                <CircleSlash2 size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className='w-full mt-3 px-3 pt-3 pb-1 lg:pb-3 bg-background rounded-2xl'>
          {giftType === "line" ? (
            <div>
              <GiftItem
                item={gifts[0]}
                currency={currency}
                sortBy={"supply"}
                displayValue={"price"}
                timeGap={"24h"}
                background={giftBackground}
                number={0}
              />
            </div>
          ) : (
            <div className='grid grid-flow-row grid-cols-4 gap-x-2 px-2'>
              <GiftBlockItem
                item={gifts[0]}
                currency={currency}
                sortBy={"supply"}
                displayValue={"price"}
                timeGap={"24h"}
                background={giftBackground}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
