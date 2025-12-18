"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function TgAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle manual page view tracking if the SDK requires it
  useEffect(() => {
    if (window.telegramAnalytics) {
      // If the SDK has a 'track' or 'pageview' method, call it here
      // window.telegramAnalytics.track('pageview', { path: pathname });
      console.log("Page changed to:", pathname);
    }
  }, [pathname, searchParams]);

  return (
    <Script
      src='https://tganalytics.xyz/index.js'
      strategy='afterInteractive'
      onLoad={() => {
        if (window.telegramAnalytics) {
          window.telegramAnalytics.init({
            token: process.env.NEXT_PUBLIC_TG_APPS_KEY!,
            appName: "gift_charts",
          });
        }
      }}
    />
  );
}
