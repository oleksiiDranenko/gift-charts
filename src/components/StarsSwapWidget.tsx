"use client";

import useVibrate from "@/hooks/useVibrate";
import { LoaderCircle } from "lucide-react";
import { useState, useCallback } from "react";

// Add global typings for the widget
declare global {
  interface Window {
    StarsSwapWidget?: {
      init: (config: { partnerUid: string }) => void;
      open: (config: { tonConnect?: any }) => void;
    };
    TonConnectUI?: any;
  }
}

export default function StarsSwapWidget() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const vibrate = useVibrate();

  const loadWidget = useCallback((callback?: () => void) => {
    // 1. Load CSS first
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href =
      "https://swap2stars.app/src/v1/widget/css/" +
      Date.now() +
      "/stars-swap.css";

    css.onload = () => {
      // 2. CSS is ready → load JS
      const script = document.createElement("script");
      script.src =
        "https://swap2stars.app/src/v1/widget/js/" +
        Date.now() +
        "/stars-swap-widget.umd.js";

      script.onload = () => {
        window.StarsSwapWidget?.init({
          partnerUid: process.env.NEXT_PUBLIC_STARS_UID || "",
        });

        setIsLoaded(true);
        callback?.();
      };

      script.onerror = () => {
        console.error("Stars Swap JS failed to load");
        setIsLoading(false);
      };

      document.head.appendChild(script);
    };

    css.onerror = () => {
      console.error("Stars Swap CSS failed to load");
      setIsLoading(false);
    };

    document.head.appendChild(css);
  }, []);

  const openWidget = () => {
    window.StarsSwapWidget?.open({
      tonConnect: window.TonConnectUI,
    });

    // Force z-index
    setTimeout(() => {
      const widget = document.querySelector("stars-swap-widget") as HTMLElement;
      widget?.style.setProperty("z-index", "999", "important");
    }, 50);

    setIsLoading(false);
  };

  const handleClick = () => {
    setIsLoading(true);

    if (!isLoaded) {
      loadWidget(() => openWidget());
    } else {
      openWidget();
    }
  };

  return (
    <button
      onClick={() => {
        handleClick();
        vibrate();
      }}
      disabled={isLoading}
      className={`w-full h-10 rounded-3xl text-white flex justify-center items-center ${
        isLoading ? "bg-secondary cursor-not-allowed" : "bg-primary"
      }`}>
      {isLoading ? (
        <LoaderCircle className='size-6 animate-spin' />
      ) : (
        "Swap Stars"
      )}
    </button>
  );
}
