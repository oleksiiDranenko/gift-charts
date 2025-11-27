"use client";

import { LoaderCircle } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

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

  const loadWidget = useCallback((callback?: () => void) => {
    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://swap2stars.app/src/v1/widget/css/" +
      Date.now() +
      "/stars-swap.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src =
      "https://swap2stars.app/src/v1/widget/js/" +
      Date.now() +
      "/stars-swap-widget.umd.js";

    script.onload = () => {
      initWidget();
      setIsLoaded(true);
      callback?.();
    };

    script.onerror = () => {
      console.error("Stars Swap widget load error");
      setIsLoading(false);
    };

    document.head.appendChild(script);
  }, []);

  const initWidget = () => {
    if (window.StarsSwapWidget) {
      window.StarsSwapWidget.init({
        partnerUid: "partner_id", // replace with real ID
      });
    }
  };

  const openWidget = () => {
    if (!window.StarsSwapWidget?.open) {
      console.error("Stars Swap widget not loaded");
      return;
    }

    window.StarsSwapWidget.open({
      tonConnect: window.TonConnectUI,
    });

    // Force top-level z-index
    setTimeout(() => {
      const widget = document.querySelector(
        "stars-swap-widget"
      ) as HTMLElement | null;
      widget?.style.setProperty("z-index", "999", "important");
    }, 50);

    setIsLoading(false);
  };

  const handleClick = () => {
    setIsLoading(true);

    if (!isLoaded) {
      // Load script then open widget
      loadWidget(() => openWidget());
    } else {
      // Already loaded → open immediately
      openWidget();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`w-full py-2 rounded-3xl text-white flex justify-center ${
        isLoading ? "bg-secondaryTransparent cursor-not-allowed" : "bg-primary"
      }`}>
      {isLoading ? (
        <LoaderCircle className='size-6 animate-spin' />
      ) : (
        "Swap Stars"
      )}
    </button>
  );
}
