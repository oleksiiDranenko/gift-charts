"use client";

import { usePathname } from "next/navigation";
import { Transition } from "@headlessui/react";
import { useAppSelector } from "@/redux/hooks";

interface Props {
  children: React.ReactNode;
}

export default function PageTransition({ children }: Props) {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.user);

  return (
    <div
      className={`relative w-full flex flex-row justify-center pt-5 ${
        user.token && "pt-[80px]"
      }`}>
      <Transition
        key={pathname}
        appear
        show={true}
        enter='transition-all ease-out duration-300'
        enterFrom='opacity-0 translate-y-6'
        enterTo='opacity-100 translate-y-0'
        leave='transition-all ease-in duration-300'
        leaveFrom='opacity-100 translate-y-0'
        leaveTo='opacity-0 translate-y-6'>
        <div className='w-full flex flex-row justify-center'>{children}</div>
      </Transition>
    </div>
  );
}
