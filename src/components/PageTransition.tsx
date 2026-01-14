"use client";

import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);

  const [isTelegram, setIsTelegram] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    // 1. Handle Telegram User logic
    setIsTelegram(user.username !== "_guest");

    // 2. Detect Telegram Fullscreen/Expanded state
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      // Set initial state
      setIsFullscreen(tg.isExpanded);

      // Listen for changes (Telegram triggers viewportChanged when expanding/collapsing)
      const handleViewportChange = () => {
        setIsFullscreen(tg.isExpanded);
      };

      tg.onEvent("viewportChanged", handleViewportChange);

      return () => {
        tg.offEvent("viewportChanged", handleViewportChange);
      };
    }
  }, [user]);

  const topPadding = isTelegram && !isFullscreen ? "pt-[110px]" : "pt-5";

  return (
    <div
      className={`relative w-full flex flex-row justify-center ${topPadding} lg:pt-5`}>
      <Transition
        key={pathname}
        appear
        show={true}
        enter='transition-all ease-out duration-300'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='transition-all ease-in duration-300'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'>
        <div className='w-full flex flex-row justify-center'>{children}</div>
      </Transition>
    </div>
  );
}
