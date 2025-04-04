'use client';

import { Inter } from 'next/font/google';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './globals.css';
import ReduxProvider from '@/redux/provider';
import NavbarTop from '@/components/navbar/NavbarTop';
import NavbarBottom from '@/components/navbar/NavbarBottom';
import { useEffect, useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const manifestUrl =
    'https://tomato-rapid-caterpillar-799.mypinata.cloud/ipfs/bafkreigq4ieb3yxtof4sful73y3o4pd2uc72h5aari3ldmiummapzgnhte';
  const isClient = typeof window !== 'undefined';
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isClient) {
      import('@twa-dev/sdk').then((WebApp) => {
        const telegramWebApp = WebApp.default;

        if (telegramWebApp) {
          telegramWebApp.ready();

          if (telegramWebApp.requestFullscreen) {
            telegramWebApp.requestFullscreen();
            setIsFullscreen(true);
            console.log('Requested fullscreen mode.');
          } else {
            telegramWebApp.expand();
            setIsFullscreen(false);
            console.log('Expanded to full height.');
          }

          if (telegramWebApp.disableVerticalSwipes) {
            telegramWebApp.disableVerticalSwipes();
            console.log('Vertical swipes disabled.');
          }

          if (telegramWebApp.setHeaderColor) {
            telegramWebApp.setHeaderColor('#000');
            console.log('Header set to transparent.');
          }

          if (telegramWebApp.BackButton) {
            telegramWebApp.BackButton.hide();
            console.log('BackButton hidden.');
          }

          // Dynamically adjust height based on Telegram viewport
          const updateViewportHeight = () => {
            document.documentElement.style.height = `${telegramWebApp.viewportHeight}px`;
          };
          telegramWebApp.onEvent('viewportChanged', updateViewportHeight);
          updateViewportHeight(); // Initial call
        }
      }).catch((err) => {
        console.error('Error loading WebApp SDK:', err);
      });
    }
  }, [isClient]);

  return (
    <html lang="en">
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <body className={inter.className}>
          <ReduxProvider>
            <div className="bg-fixed bg-cover bg-gradient-to-t from-[#0e1117] to-[#192231] min-h-screen">
              <div
                className={`w-full flex flex-col ${
                  isFullscreen ? 'pt-28' : 'pt-0'
                }`}
                style={{ height: isClient ? '100vh' : 'auto' }}
              >
                <NavbarTop isFullscreen={isFullscreen} />
                <div className="w-screen flex justify-center flex-grow overflow-y-auto">
                  {children}
                </div>
                <NavbarBottom />
              </div>
            </div>
          </ReduxProvider>
        </body>
      </TonConnectUIProvider>
    </html>
  );
}