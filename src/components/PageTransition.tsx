"use client";

import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useIsMobile } from "@/hooks/useMobile";
import { useTmaPlatform } from "@/hooks/usePlatform";

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { isMobile: isMobilePlatform } = useTmaPlatform();

  return (
    <div
      className={`relative w-full flex flex-row justify-center ${
        isMobilePlatform
          ? "px-3 pt-[105px] pb-28"
          : isMobile
            ? "px-3 pt-3 pb-28"
            : "px-8 py-6"
      }`}>
      <Transition
        key={pathname}
        appear
        show={true}
        enter='transition-all ease-out duration-300'
        enterFrom='opacity-0 translate-y-0'
        enterTo='opacity-100 translate-y-0'
        leave='transition-all ease-in duration-300'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-0'>
        <div className='w-full flex flex-row justify-center'>{children}</div>
      </Transition>
    </div>
  );
}
