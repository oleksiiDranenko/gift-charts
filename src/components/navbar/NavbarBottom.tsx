"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation"; // Use locale-aware usePathname
import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import NoPrefetchLink from "../NoPrefetchLink";
import { useAppSelector } from "@/redux/hooks";

export default function NavbarBottom() {
  const pathname = usePathname(); // Returns pathname without locale (e.g., /tools)
  const vibrate = useVibrate();
  const t = useTranslations("navbar");
  const user = useAppSelector((state) => state.user);

  const [selectedPage, setSelectedPage] = useState<
    "home" | "research" | "tools" | "account" | "settings" | null
  >(null);

  useEffect(() => {
    if (pathname.startsWith("/tools")) {
      setSelectedPage("tools");
    } else if (pathname.startsWith("/account")) {
      setSelectedPage("account");
    } else if (pathname.startsWith("/settings")) {
      setSelectedPage("settings");
    } else if (pathname.startsWith("/research")) {
      setSelectedPage("research");
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
        className={`w-full flex flex-row justify-between items-center pt-3 ${
          user.username === "_guest" ? "pb-3" : "pb-10"
        } px-3 rounded-t-3xl bg-secondaryLight backdrop-blur-xl
`}>
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
        <NoPrefetchLink
          className={`w-1/5 h-12 gap-y-1 flex flex-col justify-end items-center box-border active:scale-[90%]  duration-200 ${
            selectedPage === "research" ? "text-primary" : "text-secondaryText"
          }`}
          href='/research'
          onClick={() => {
            setSelectedPage("research");
            vibrate();
          }}>
          {/* <Gift size={24} /> */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-7'>
            <path
              fillRule='evenodd'
              d='M2.25 2.25a.75.75 0 0 0 0 1.5H3v10.5a3 3 0 0 0 3 3h1.21l-1.172 3.513a.75.75 0 0 0 1.424.474l.329-.987h8.418l.33.987a.75.75 0 0 0 1.422-.474l-1.17-3.513H18a3 3 0 0 0 3-3V3.75h.75a.75.75 0 0 0 0-1.5H2.25Zm6.54 15h6.42l.5 1.5H8.29l.5-1.5Zm8.085-8.995a.75.75 0 1 0-.75-1.299 12.81 12.81 0 0 0-3.558 3.05L11.03 8.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l2.47-2.47 1.617 1.618a.75.75 0 0 0 1.146-.102 11.312 11.312 0 0 1 3.612-3.321Z'
              clipRule='evenodd'
            />
          </svg>

          <span className='text-xs'>{t("research")}</span>
        </NoPrefetchLink>
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
              d='M10.5 3.798v5.02a3 3 0 0 1-.879 2.121l-2.377 2.377a9.845 9.845 0 0 1 5.091 1.013 8.315 8.315 0 0 0 5.713.636l.285-.071-3.954-3.955a3 3 0 0 1-.879-2.121v-5.02a23.614 23.614 0 0 0-3 0Zm4.5.138a.75.75 0 0 0 .093-1.495A24.837 24.837 0 0 0 12 2.25a25.048 25.048 0 0 0-3.093.191A.75.75 0 0 0 9 3.936v4.882a1.5 1.5 0 0 1-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.47-4.881L15.44 9.879A1.5 1.5 0 0 1 15 8.818V3.936Z'
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
