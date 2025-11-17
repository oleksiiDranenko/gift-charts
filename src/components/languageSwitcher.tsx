"use client";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useTheme } from "next-themes";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();
  const [isPending, startTransition] = useTransition();

  const { theme, setTheme, resolvedTheme } = useTheme();

  const translate = useTranslations("settings");

  const changeLocale = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className='w-full h-14 box-border p-3 gap-y-3 flex flex-row justify-between bg-secondaryTransparent rounded-2xl'>
      <div className='flex flex-row items-center font-bold'>
        {translate("language")}
      </div>
      <div
        className={`flex flex-row ${
          resolvedTheme === "dark" ? "bg-secondary" : "bg-background"
        } rounded-2xl`}>
        {routing.locales.map((locale) => (
          <button
            key={locale}
            className={`w-full h-full flex flex-col items-center justify-center gap-y-1 px-3 text-xs ${
              locale === currentLocale
                ? "font-bold text-foreground bg-primary text-white rounded-2xl"
                : "text-secondaryText"
            }`}
            onClick={() => changeLocale(locale)}
            disabled={isPending}
            aria-current={locale === currentLocale ? "true" : undefined}>
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
