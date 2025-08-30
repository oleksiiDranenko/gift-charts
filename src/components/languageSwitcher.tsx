'use client';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const changeLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="w-full p-3 mb-3 gap-y-3 flex flex-col justify-center font-bold border border-secondary bg-secondaryTransparent rounded-xl">
      <div className="flex flex-row items-center gap-x-1">
        <Languages size={16}/>
        Language
      </div>
      <div className="flex flex-row bg-secondaryTransparent border border-secondary rounded-xl">
        {routing.locales.map((locale) => (
          <button
            key={locale}
            className={`w-full flex flex-col items-center justify-center gap-y-1 py-2 text-xs ${
              locale === currentLocale
                ? 'font-bold text-foreground bg-secondary rounded-xl'
                : 'text-secondaryText'
            }`}
            onClick={() => changeLocale(locale)}
            disabled={isPending}
            aria-current={locale === currentLocale ? 'true' : undefined}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}