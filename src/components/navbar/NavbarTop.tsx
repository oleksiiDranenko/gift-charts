'use client';

import useVibrate from '@/hooks/useVibrate';
import { TonConnectButton } from '@tonconnect/ui-react';
import Image from 'next/image';

interface NavbarTopProps {
  isFullscreen: boolean;
}

export default function NavbarTop({ isFullscreen }: NavbarTopProps) {
  const vibrate = useVibrate();

  return (
    <div
      className={`fixed w-screen top-0 pb-2 h-16 pl-2 pr-2 flex justify-center items-center  ${
        isFullscreen ? 'pt-[120px]' : null
      }`}
    >
        <div className="w-full lg:w-1/2 flex flex-row justify-between items-center">
            <div className="flex flex-row items-center pl-1 pr-3 bg-slate-800 rounded-lg">
                <Image
                    src={'/images/logo.webp'}
                    alt="Gift Charts Logo"
                    width={40}
                    height={40}
                    className="p-2"
                />
                <span className="font-bold">
                    Gift Charts
                </span>
            </div>
            <div onClick={() => vibrate()}>
                <TonConnectButton className="bg-[#0098EA] rounded-full border border-[#0098EA]" />
            </div>
        </div>
    </div>
  );
}