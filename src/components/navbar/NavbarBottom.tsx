"use client";

import { Link } from "@/i18n/navigation"; // Use locale-aware Link
import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation"; // Use locale-aware usePathname
import useVibrate from "@/hooks/useVibrate";
import {
  House,
  User,
  ChartCandlestick,
  Settings,
  Gift,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { BiSolidGift } from "react-icons/bi";
import { IoHome, IoSettingsSharp, IoBarChart } from "react-icons/io5";
import { FaCircleUser } from "react-icons/fa6";

export default function NavbarBottom() {
  const pathname = usePathname(); // Returns pathname without locale (e.g., /tools)
  const vibrate = useVibrate();
  const t = useTranslations("navbar");

  const [selectedPage, setSelectedPage] = useState<
    "home" | "gifts" | "tools" | "account" | "settings" | null
  >(null);

  useEffect(() => {
    if (pathname.startsWith("/tools")) {
      setSelectedPage("tools");
    } else if (pathname.startsWith("/account")) {
      setSelectedPage("account");
    } else if (pathname.startsWith("/settings")) {
      setSelectedPage("settings");
    } else if (pathname.startsWith("/gifts-list")) {
      setSelectedPage("gifts");
    } else {
      setSelectedPage("home");
    }
  }, [pathname]);

  return (
    <div className='lg:hidden fixed bottom-0 mb-0 w-screen z-40 flex justify-center gap-3 items-center'>
      <div className='w-full flex flex-row justify-between items-center pt-3 pb-10 px-3 rounded-t-2xl bg-secondaryTransparent'>
        <Link
          className={`w-1/5 gap-y-1 flex flex-col justify-center items-center box-border ${
            selectedPage === "home" ? "text-primary " : "text-secondaryText"
          }`}
          href='/'
          onClick={() => {
            setSelectedPage("home");
            vibrate();
          }}>
          <IoHome size={24} />
          <span className='text-xs'>{t("home")}</span>
        </Link>
        <Link
          className={`w-1/5 gap-y-1 flex flex-col justify-center items-center box-border ${
            selectedPage === "gifts" ? "text-primary" : "text-secondaryText"
          }`}
          href='/gifts-list'
          onClick={() => {
            setSelectedPage("gifts");
            vibrate();
          }}>
          <BiSolidGift size={24} />
          <span className='text-xs'>{t("gifts")}</span>
        </Link>
        <Link
          className={`w-1/5 gap-y-1 flex flex-col justify-center items-center box-border ${
            selectedPage === "tools" ? "text-primary" : "text-secondaryText"
          }`}
          href='/tools'
          onClick={() => {
            setSelectedPage("tools");
            vibrate();
          }}>
          <IoBarChart size={24} />
          <span className='text-xs'>{t("tools")}</span>
        </Link>
        <Link
          className={`w-1/5 gap-y-1 flex flex-col justify-center items-center box-border ${
            selectedPage === "account" ? "text-primary" : "text-secondaryText"
          }`}
          href='/account'
          onClick={() => {
            setSelectedPage("account");
            vibrate();
          }}>
          <FaCircleUser size={24} />
          <span className='text-xs'>{t("profile")}</span>
        </Link>
        <Link
          className={`w-1/5 gap-y-1 flex flex-col justify-center items-center box-border ${
            selectedPage === "settings" ? "text-primary" : "text-secondaryText"
          }`}
          href='/settings'
          onClick={() => {
            setSelectedPage("settings");
            vibrate();
          }}>
          <IoSettingsSharp size={24} />
          <span className='text-xs'>{t("settings")}</span>
        </Link>
      </div>
    </div>
  );
}
