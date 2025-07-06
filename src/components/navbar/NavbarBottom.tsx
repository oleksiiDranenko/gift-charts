'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useVibrate from "@/hooks/useVibrate";
import { House, User, ChartCandlestick } from 'lucide-react';

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
        <div className="fixed bottom-0 mb-0 w-screen z-50 flex justify-center gap-3 pt-3 pb-8 px-3 items-center bg-background border-t border-slate-800 ">
            <div className="w-full lg:w-1/2 flex flex-row justify-between">
                <Link
                    className={`w-1/4 flex flex-col justify-center items-center box-border ${selectedPage === 'home' ? 'text-primary' : 'text-foreground'}`}
                    href="/"
                    onClick={() => {
                        setSelectedPage('home')
                        vibrate()
                    }}
                >
                    <House />
                    <span className={`text-xs `}>
                        Home
                    </span>
                </Link>
                <Link
                    className={`w-1/4 h-10 flex flex-col justify-center items-center box-border ${selectedPage === 'tools' ? 'text-primary' : 'text-foreground'}`}
                    href="/tools"
                    onClick={() => {
                        setSelectedPage('tools')
                        vibrate()
                    }}
                >
                    <ChartCandlestick/>
                    <span className={`text-xs `}>
                        Tools
                    </span>
                </Link>
                <Link
                    className={`w-1/4 h-10 flex flex-col justify-center items-center box-border ${selectedPage === 'account' ? 'text-primary' : 'text-foreground'}`}
                    href="/account"
                    onClick={() => {
                        setSelectedPage('account')
                        vibrate()
                    }}
                >
                    <User/>
                    <span className={`text-xs `}>
                        Account
                    </span>
                </Link>
            </div>
        </div>
    );
}