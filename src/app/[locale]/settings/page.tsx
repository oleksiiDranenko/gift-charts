"use client";

import LanguageSwitcher from "@/components/languageSwitcher";
import useVibrate from "@/hooks/useVibrate";
import { useAppSelector } from "@/redux/hooks";
import {
  ChevronRight,
  Gift,
  Moon,
  Palette,
  Star,
  Sun,
  SunMoon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export default function Page() {
  const user = useAppSelector((state) => state.user);
  const { theme, setTheme, resolvedTheme } = useTheme();

  const vibrate = useVibrate();

  return (
    <div className='w-full lg:w-5/6 pt-[70px] lg:pt-10 pb-24 px-3'>
      <div className='w-full p-3 mb-3 gap-y-3 flex flex-col justify-center font-bold bg-secondaryTransparent rounded-xl'>
        <div className='flex flex-row items-center gap-x-3'>
          <Palette size={20} />
          <h1>Color Theme:</h1>
        </div>
        <div
          className={`flex flex-row ${
            resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
          } rounded-xl`}>
          <button
            className={`w-full flex flex-col items-center justify-center gap-y-1 py-3 text-xs ${
              theme === "light"
                ? "font-bold text-foreground bg-primary rounded-xl text-white"
                : resolvedTheme === "dark"
                ? "text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("light")}>
            <Sun size={14} />
            <span className='test-sm'>Light</span>
          </button>
          <button
            className={`w-full flex flex-col items-center justify-center gap-y-1 py-3 text-xs ${
              theme === "dark"
                ? "font-bold text-foreground bg-primary rounded-xl text-white"
                : resolvedTheme === "dark"
                ? "text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("dark")}>
            <Moon size={14} />
            <span>Dark</span>
          </button>
          <button
            className={`w-full flex flex-col items-center justify-center gap-y-1 py-3 text-xs ${
              theme === "system"
                ? "font-bold text-foreground bg-primary rounded-xl text-white"
                : resolvedTheme === "dark"
                ? "text-white"
                : "text-secondaryText"
            }`}
            onClick={() => setTheme("system")}>
            <SunMoon size={14} />
            <span>System</span>
          </button>
        </div>
      </div>

      {/* <LanguageSwitcher/> */}
      {user.username !== "_guest" && (
        <div className='w-full flex flex-col items-center'>
          <Link
            href={"/settings/edit-assets"}
            className='w-full h-14 px-3 mb-3 flex justify-between items-center font-bold bg-secondaryTransparent rounded-xl'
            onClick={() => vibrate()}>
            <span className='flex flex-row items-center gap-3'>
              <Gift size={20} />
              Edit Assets
            </span>
            <ChevronRight />
          </Link>
          <Link
            href={"/settings/edit-watchlist"}
            className='w-full h-14 px-3 flex flex-row justify-between items-center font-bold bg-secondaryTransparent rounded-xl'
            onClick={() => vibrate()}>
            <span className='flex flex-row items-center gap-3'>
              <Star size={20} />
              Edit Watchlist
            </span>
            <ChevronRight />
          </Link>
        </div>
      )}
    </div>
  );
}
