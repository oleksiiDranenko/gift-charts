"use client";

import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
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
      } lg:pt-5`}>
      <div
        className={`lg:hidden ${isTelegram ? "" : "hidden"} z-50 fixed top-0 right-0 w-full h-[110px] flex justify-center items-center`}>
        <div className='flex flex-row bg-secondaryLight backdrop-blur-md rounded-3xl mt-3 px-3 py-2 gap-2'>
          <Image src={"/images/logo.webp"} alt={""} width={24} height={24} />
          <span className='font-medium'>Gift Charts</span>
        </div>
      </div>
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
