'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useVibrate from "@/hooks/useVibrate";

export default function NavbarBottom() {
    const pathname = usePathname();

    const vibrate = useVibrate()

    const [selectedPage, setSelectedPage] = useState<'home' | 'tools' | 'account' | null>(null);

    useEffect(() => {
        if (pathname.startsWith('/tools')) {
            setSelectedPage('tools');
        } else if (pathname.startsWith('/account')) {
            setSelectedPage('account');
        } else {
            setSelectedPage('home');
        }
    }, [pathname]);

    return (
        <div className="fixed bottom-0 mb-0 w-screen z-50 flex justify-center gap-3 pt-2 pb-10 px-3 items-center">
            <div className="w-full lg:w-1/2 flex flex-row justify-between p-3 backdrop-blur-md rounded-2xl">
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'home' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/"
                    onClick={() => {
                        setSelectedPage('home')
                        vibrate()
                    }}
                >
                    Home
                </Link>
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'tools' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/tools"
                    onClick={() => {
                        setSelectedPage('tools')
                        vibrate()
                    }}
                >
                    Tools
                </Link>
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'account' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/account"
                    onClick={() => {
                        setSelectedPage('account')
                        vibrate()
                    }}
                >
                    Account
                </Link>
            </div>
        </div>
    );
}