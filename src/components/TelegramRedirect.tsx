// components/TelegramRedirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function TelegramRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Try to get ID from the URL parameter Telegram adds
    const tgId = searchParams.get("tgWebAppStartParam");

    // 2. Alternatively, get it from the official Telegram SDK if loaded
    const startParam = window.Telegram?.WebApp?.initDataUnsafe?.start_param;

    const giftId = tgId || startParam;

    if (giftId) {
      // Redirect to your clean path: /gift/67d6191f4b4e341848689bf3
      router.replace(`/gift/${giftId}`);
    }
  }, [searchParams, router]);

  return null;
}
