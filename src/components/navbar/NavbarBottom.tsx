'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavbarBottom() {
    const pathname = usePathname();
    const [selectedPage, setSelectedPage] = useState<'home' | 'tools' | 'account' | null>(null);

    useEffect(() => {
        if (pathname === '/tools') {
            setSelectedPage('tools');
        } else if (pathname === '/account') {
            setSelectedPage('account');
        } else {
            setSelectedPage('home');
        }
    }, [pathname]);

    return (
        <div className="fixed bottom-0 mb-0 w-screen flex justify-center pt-2 pb-10 px-3 items-center bg-[#111827]">
            <div className="w-full lg:w-1/2 flex flex-row justify-between">
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'home' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/"
                    onClick={() => setSelectedPage('home')}
                >
                    Home
                </Link>
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'tools' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/tools"
                    onClick={() => setSelectedPage('tools')}
                >
                    Tools
                </Link>
                <Link
                    className={`w-1/4 h-10 flex justify-center items-center box-border ${selectedPage === 'account' ? 'bg-[#0098EA] rounded-lg' : ''}`}
                    href="/account"
                    onClick={() => setSelectedPage('account')}
                >
                    Account
                </Link>
            </div>
        </div>
    );
}