import "./globals.css";
import { Inter } from "next/font/google";
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
import ModalWrapper from "@/components/ModalWrapper";
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
};

const inter = Inter({ subsets: ["latin", "cyrillic"] });

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
        <body className={inter.className}>
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
        </body>
      </html>
    </>
  );
}
