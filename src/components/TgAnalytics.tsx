"use client";

import { useEffect } from "react";

export default function TgAnalytics() {
  useEffect(() => {
    // Inject external script
    const script = document.createElement("script");
    script.src = "https://tganalytics.xyz/index.js";
    script.async = true;

    script.onload = () => {
      if (typeof window !== "undefined" && window.telegramAnalytics) {
        window.telegramAnalytics.init({
          token: process.env.NEXT_PUBLIC_TG_APPS_KEY!,
          appName: "gift_charts",
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // optional cleanup
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
