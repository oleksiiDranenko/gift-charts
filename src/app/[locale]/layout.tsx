import "./globals.css";
import { Wix_Madefor_Display } from "next/font/google";
import ReduxProvider from "@/redux/provider";
import { ThemeProvider } from "next-themes";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import Script from "next/script";
import AppInitializer from "../../components/AppInitializer";
import DefaultUpdate from "../../components/DefaultUpdate";
import Analytics from "../../components/Analytics";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ReactQueryProvider from "@/components/ReactQueryProvider";
import PageTransition from "@/components/PageTransition";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Gift Charts",
    template: "% | Gift Charts",
  },
  description: "Telegram NFT gifts analytics",
  openGraph: {
    title: "Gift Charts",
    description: "Telegram NFT gifts analytics",
    url: "https://giftcharts.com",
    siteName: "Gift Charts",
    images: [{ url: "/images/logo.webp" }],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/images/logo.webp",
  },
  metadataBase: new URL("https://giftcharts.com"),
  alternates: {
    canonical: "https://giftcharts.com",
  },
  keywords: [
    "telegram gifts analytics",
    "telegram nft analytics",
    "telegram collectibles tracker",
    "gift charts",
  ],
};

const inter = Wix_Madefor_Display({ subsets: ["latin", "cyrillic"] });

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = await getMessages();
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <>
      <Script
        src='https://www.googletagmanager.com/gtag/js?id=G-HFQGDBLR7K'
        strategy='afterInteractive'
      />
      <Script id='google-analytics' strategy='afterInteractive'>
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-HFQGDBLR7K', { page_path: window.location.pathname });
        `}
      </Script>

      <html lang={locale}>
        <body
          className={`${inter.className} min-h-screen overflow-auto transition-all duration-300 ease-in-out`}>
          <NextIntlClientProvider messages={messages}>
            <ReduxProvider>
              <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>
                <ReactQueryProvider>
                  <Analytics />
                  <AppInitializer>
                    <DefaultUpdate>
                      <PageTransition>{children}</PageTransition>
                    </DefaultUpdate>
                  </AppInitializer>
                </ReactQueryProvider>
              </ThemeProvider>
            </ReduxProvider>
          </NextIntlClientProvider>

          <Script
            src='https://tganalytics.xyz/index.js'
            strategy='afterInteractive'
            onLoad={() => {
              if (typeof window !== "undefined" && window.telegramAnalytics) {
                window.telegramAnalytics.init({
                  token: process.env.NEXT_PUBLIC_TG_APPS_KEY!,
                  appName: "gift_charts",
                });
              }
            }}
          />
        </body>
      </html>
    </>
  );
}
