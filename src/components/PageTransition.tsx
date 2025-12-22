"use client";

import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import AddBanner from "./AddBanner";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);

  const [isTelegram, setIsTelegram] = useState<boolean>(true);

  useEffect(() => {
    if (user.username === "_guest") {
      setIsTelegram(false);
    } else {
      setIsTelegram(true);
    }
  }, [user]);

  return (
    <div
      className={`relative w-full flex flex-row justify-center ${
        isTelegram ? "pt-[110px]" : "pt-5"
      }`}>
      {/* <AddBanner className={isTelegram ? "pt-[110px]" : "pt-5"} /> */}
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
        <div className='w-full flex flex-row justify-center'>
          {isTelegram && (
            <div className='w-full h-[110px] fixed z-50 bg-background top-0 flex justify-center items-center'>
              <Image
                src={"/images/logo.webp"}
                alt={"Gift Charts"}
                width={30}
                height={30}
              />
            </div>
          )}
          {children}
        </div>
      </Transition>
    </div>
  );
}
