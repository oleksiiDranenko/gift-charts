"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation"; // Use locale-aware usePathname
import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import NoPrefetchLink from "../NoPrefetchLink";
import { useAppSelector } from "@/redux/hooks";

export default function NavbarBottom() {
  const user = useAppSelector((state) => state.user);
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
    <div
      className={`lg:hidden ${
        pathname.startsWith("/gift/") ? "hidden" : ""
      } fixed bottom-0 mb-0 w-screen z-40 flex justify-center gap-3 items-center`}>
      <div
        className={`w-full flex flex-row justify-around items-center pt-3 ${
          user.username === "_guest" ? "pb-3" : "pb-10"
        } px-3 rounded-t-3xl bg-secondaryLight backdrop-blur-lg`}>
        <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[95%]  duration-200 ${
            selectedPage === "home" ? "text-primary " : "text-secondaryText"
          }`}
          href='/'
          onClick={() => {
            setSelectedPage("home");
            vibrate();
          }}>
          {/* <House size={24} /> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path d='M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z' />
            <path d='m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z' />
          </svg>

          <span className='text-xs'>{t("home")}</span>
        </NoPrefetchLink>
        {/* <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[90%]  duration-200 ${
            selectedPage === "gifts" ? "text-primary" : "text-secondaryText"
          }`}
          href='/gifts-list'
          onClick={() => {
            setSelectedPage("gifts");
            vibrate();
          }}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path d='M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z' />
          </svg>

          <span className='text-xs'>{t("gifts")}</span>
        </NoPrefetchLink> */}
        <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[90%]  duration-200 ${
            selectedPage === "tools" ? "text-primary" : "text-secondaryText"
          }`}
          href='/tools'
          onClick={() => {
            setSelectedPage("tools");
            vibrate();
          }}>
          {/* <ChartCandlestick size={24} /> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path
              fillRule='evenodd'
              d='M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z'
              clipRule='evenodd'
            />
          </svg>

          <span className='text-xs'>{t("tools")}</span>
        </NoPrefetchLink>
        <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[90%]  duration-200 ${
            selectedPage === "account" ? "text-primary" : "text-secondaryText"
          }`}
          href='/account'
          onClick={() => {
            setSelectedPage("account");
            vibrate();
          }}>
          {/* <UserRound size={24} /> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path
              fillRule='evenodd'
              d='M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z'
              clipRule='evenodd'
            />
          </svg>

          <span className='text-xs'>{t("profile")}</span>
        </NoPrefetchLink>
        <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[90%]  duration-200 ${
            selectedPage === "settings" ? "text-primary" : "text-secondaryText"
          }`}
          href='/settings'
          onClick={() => {
            setSelectedPage("settings");
            vibrate();
          }}>
          {/* <Settings size={24} /> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path
              fillRule='evenodd'
              d='M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z'
              clipRule='evenodd'
            />
          </svg>

          <span className='text-xs'>{t("settings")}</span>
        </NoPrefetchLink>
      </div>
    </div>
  );
}
