'use client';

import {Link} from '@/i18n/navigation'; // Use locale-aware Link
import { useEffect, useState } from 'react';
import { usePathname } from '@/i18n/navigation'; // Use locale-aware usePathname
import useVibrate from '@/hooks/useVibrate';
import { House, User, ChartCandlestick, Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function NavbarBottom() {
  const pathname = usePathname(); // Returns pathname without locale (e.g., /tools)
  const vibrate = useVibrate();
  const t = useTranslations('navbar');

  const [selectedPage, setSelectedPage] = useState<'home' | 'tools' | 'account' | 'settings' | null>(null);

  useEffect(() => {
    if (pathname.startsWith('/tools')) {
      setSelectedPage('tools');
    } else if (pathname.startsWith('/account')) {
      setSelectedPage('account');
    } else if (pathname.startsWith('/settings')) {
      setSelectedPage('settings');
    } else {
      setSelectedPage('home');
    }
  }, [pathname]);

  return (
    <div className="fixed bottom-0 mb-0 w-screen z-40 flex justify-center gap-3 items-center">
      <div className="w-full lg:w-1/2 flex flex-row justify-between pt-3 pb-8 px-3 rounded-t-xl bg-secondaryTransparent">
        <Link
          className={`w-1/4 flex flex-col justify-center items-center box-border ${
            selectedPage === 'home' ? 'text-foreground' : 'text-secondaryText'
          }`}
          href="/"
          onClick={() => {
            setSelectedPage('home');
            vibrate();
          }}
        >
          <House />
          <span className="text-xs">
            {t('home')}
          </span>
        </Link>
        <Link
          className={`w-1/4 h-10 flex flex-col justify-center items-center box-border ${
            selectedPage === 'tools' ? 'text-foreground' : 'text-secondaryText'
          }`}
          href="/tools"
          onClick={() => {
            setSelectedPage('tools');
            vibrate();
          }}
        >
          <ChartCandlestick />
          <span className="text-xs">
            {t('tools')}
          </span>
        </Link>
        <Link
          className={`w-1/4 h-10 flex flex-col justify-center items-center box-border ${
            selectedPage === 'account' ? 'text-foreground' : 'text-secondaryText'
          }`}
          href="/account"
          onClick={() => {
            setSelectedPage('account');
            vibrate();
          }}
        >
          <User />
          <span className="text-xs">
            {t('profile')}
        </span>
        </Link>
        <Link
          className={`w-1/4 h-10 flex flex-col justify-center items-center box-border ${
            selectedPage === 'settings' ? 'text-foreground' : 'text-secondaryText'
          }`}
          href="/settings"
          onClick={() => {
            setSelectedPage('settings');
            vibrate();
          }}
        >
          <Settings />
          <span className="text-xs">
            {t('settings')}
        </span>
        </Link>
      </div>
    </div>
  );
}