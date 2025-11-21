import useVibrate from "@/hooks/useVibrate";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";

export default function StarsSwapWidget() {
  const [loading, setLoading] = useState(false);
  const vibrate = useVibrate();

  const openWidget = () => {
    setLoading(true);

    const cssUrl = `https://swap2stars.app/src/v1/widget/css/${Date.now()}/stars-swap.css`;
    const jsUrl = `https://swap2stars.app/src/v1/widget/js/${Date.now()}/stars-swap-widget.umd.js`;

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src = jsUrl;

    script.onload = () => {
      const widget = (window as any).StarsSwapWidget;

      if (widget) {
        widget.init({ partnerUid: process.env.STARS_UID });

        widget.open({
          tonConnect: (window as any).TonConnectUI,
        });

        // Wait for widget DOM to exist → then hide loading
        const interval = setInterval(() => {
          const element = document.querySelector("stars-swap-widget");
          if (element) {
            setLoading(false);
            clearInterval(interval);
          }
        }, 200);
      }
    };

    script.onerror = () => {
      console.error("Widget init error");
      setLoading(false); // hide loading if failed
    };

    document.head.appendChild(script);
  };

  return (
    <button
      className={`z-0 relative flex flex-row justify-center items-center w-full h-10 bg-primary rounded-3xl ${
        loading && "animate-pulse"
      }`}
      onClick={() => {
        openWidget();
        vibrate();
      }}
      disabled={loading}>
      {loading ? (
        <LoaderCircle className='text-white animate-spin' />
      ) : (
        <>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5 mr-1'>
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
