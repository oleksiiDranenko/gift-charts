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
import Image from "next/image";

export default function NavbarLeft() {
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
    <div className='hidden lg:block fixed left-0 top-0 h-screen w-64 z-40 bg-secondaryTransparent rounded-r-lg p-3 space-y-3'>
      <Link href={"/"} className='flex flex-row gap-x-2 mb-6 mt-3'>
        <Image src={"/images/logo.webp"} alt={""} width={30} height={30} />
        <h1 className='text-lg '>Gift Charts</h1>
      </Link>
      <Link
        className={`flex flex-row gap-x-2 items-center p-3 rounded-2xl box-border hover:bg-secondary ${
          selectedPage === "home"
            ? "text-white bg-primary hover:!bg-primary"
            : "text-secondaryText"
        }`}
        href='/'
        onClick={() => {
          setSelectedPage("home");
          vibrate();
        }}>
        <House size={18} />
        <span>{t("home")}</span>
      </Link>
      <Link
        className={`flex flex-row gap-x-2 items-center p-3 rounded-2xl box-border hover:bg-secondary ${
          selectedPage === "gifts"
            ? "text-white bg-primary hover:!bg-primary"
            : "text-secondaryText"
        }`}
        href='/gifts-list'
        onClick={() => {
          setSelectedPage("gifts");
          vibrate();
        }}>
        <Gift size={18} />
        <span>{t("gifts")}</span>
      </Link>
      <Link
        className={`flex flex-row gap-x-1 items-center p-3 rounded-2xl box-border hover:bg-secondary ${
          selectedPage === "tools"
            ? "text-white bg-primary hover:!bg-primary"
            : "text-secondaryText"
        }`}
        href='/tools'
        onClick={() => {
          setSelectedPage("tools");
          vibrate();
        }}>
        <ChartCandlestick size={18} />
        <span>{t("tools")}</span>
      </Link>
      <Link
        className={`flex flex-row gap-x-1 items-center p-3 rounded-2xl box-border hover:bg-secondary ${
          selectedPage === "account"
            ? "text-white bg-primary hover:!bg-primary"
            : "text-secondaryText"
        }`}
        href='/account'
        onClick={() => {
          setSelectedPage("account");
          vibrate();
        }}>
        <UserRound size={18} />
        <span>{t("profile")}</span>
      </Link>
      <Link
        className={`flex flex-row gap-x-1 items-center p-3 rounded-2xl box-border hover:bg-secondary ${
          selectedPage === "settings"
            ? "text-white bg-primary hover:!bg-primary"
            : "text-secondaryText"
        }`}
        href='/settings'
        onClick={() => {
          setSelectedPage("settings");
          vibrate();
        }}>
        <Settings size={18} />
        <span>{t("settings")}</span>
      </Link>
    </div>
  );
}
