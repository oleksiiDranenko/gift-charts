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
        src="https://www.googletagmanager.com/gtag/js?id=G-HFQGDBLR7K"
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
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
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <ReactQueryProvider>
                  <Analytics />
                  <AppInitializer>
                    <DefaultUpdate><PageTransition>{children}</PageTransition></DefaultUpdate>
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
