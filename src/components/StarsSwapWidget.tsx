import useVibrate from "@/hooks/useVibrate";
import { LoaderCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    StarsSwapWidget?: any;
    TonConnectUI?: any;
  }
}

export default function StarsSwapWidget() {
  const [loading, setLoading] = useState(false);
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const vibrate = useVibrate();
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const linkRef = useRef<HTMLLinkElement | null>(null);

  // Load widget script & styles once
  useEffect(() => {
    if (widgetLoaded || window.StarsSwapWidget) {
      setWidgetLoaded(true);
      return;
    }

    const timestamp = Date.now();
    const cssUrl = `https://swap2stars.app/src/v1/widget/css/${timestamp}/stars-swap.css`;
    const jsUrl = `https://swap2stars.app/src/v1/widget/js/${timestamp}/stars-swap-widget.umd.js`;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.head.appendChild(link);
    linkRef.current = link;

    const script = document.createElement("script");
    script.src = jsUrl;
    script.async = true;

    script.onload = () => {
      if (window.StarsSwapWidget) {
        window.StarsSwapWidget.init({ partnerUid: "3cx12ApImF9dq" });
        setWidgetLoaded(true);
      }
    };

    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      scriptRef.current?.parentNode?.removeChild(scriptRef.current);
      linkRef.current?.parentNode?.removeChild(linkRef.current);
    };
  }, []);

  const openWidget = () => {
    if (!widgetLoaded || !window.StarsSwapWidget) return;

    setLoading(true);
    vibrate();

    window.StarsSwapWidget.open({
      tonConnect: window.TonConnectUI || undefined,
    });

    const checkInterval = setInterval(() => {
      if (document.querySelector("stars-swap-widget")) {
        setLoading(false);
        clearInterval(checkInterval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      setLoading(false);
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  };

  return (
    <button
      onClick={openWidget}
      disabled={loading || !widgetLoaded}
      className={`flex w-full h-10 items-center justify-center rounded-3xl bg-primary text-white font-medium transition-all ${
        loading
          ? "animate-pulse opacity-80"
          : "hover:brightness-110 active:brightness-90"
      }`}>
      {loading ? (
        <LoaderCircle className='size-5 animate-spin' />
      ) : (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='mr-1.5 size-5'>
            <path
              fillRule='evenodd'
              d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
              clipRule='evenodd'
            />
          </svg>
          Buy Stars
        </>
      )}
    </button>
  );
}
