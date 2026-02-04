"use client";

import Account from "@/components/account/Account";
import AccountTest from "@/components/account/AccountTest";
import useVibrate from "@/hooks/useVibrate";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

type Mode = "auto" | "manual";

export default function Page() {
  const [accountMode, setAccountMode] = useState<Mode>("auto");
  const [isMounted, setIsMounted] = useState(false);
  const translate = useTranslations("account");
  const vibrate = useVibrate();

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("accountMode") as Mode;
    if (saved) setAccountMode(saved);
    setIsMounted(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("accountMode", accountMode);
    }
  }, [accountMode, isMounted]);

  // Prevent hydration mismatch
  if (!isMounted) return null;

  return (
    <main className='w-full lg:w-[98%] pt-[0px] pb-20'>
      <div className='flex justify-center mb-5'>
        <div className='bg-secondaryTransparent rounded-3xl'>
          <button
            onClick={() => {
              setAccountMode("auto");
              vibrate();
            }}
            className={`px-6 py-2 text-sm rounded-3xl transition-all ${
              accountMode === "auto"
                ? "bg-secondary font-bold"
                : "text-secondaryText"
            }`}>
            {translate("auto")}
          </button>
          <button
            onClick={() => {
              setAccountMode("manual");
              vibrate();
            }}
            className={`px-6 py-2 text-sm rounded-3xl transition-all ${
              accountMode === "manual"
                ? "bg-secondary font-bold"
                : "text-secondaryText"
            }`}>
            {translate("manual")}
          </button>
        </div>
      </div>

      <div className='mt-4'>
        {accountMode === "auto" ? <AccountTest /> : <Account />}
      </div>
    </main>
  );
}
