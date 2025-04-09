'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/redux/provider';
import NavbarTop from '@/components/navbar/NavbarTop';
import NavbarBottom from '@/components/navbar/NavbarBottom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';

const inter = Inter({ subsets: ['latin'] });

// Inner component to handle Telegram and Redux logic
function AppInitializer({ children }: { children: React.ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dispatch = useDispatch(); // Now safe within ReduxProvider

    useEffect(() => {
        if (typeof window !== 'undefined') {
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

                    // Set height to viewportStableHeight to avoid gaps
                    const updateViewportHeight = () => {
                        const height = telegramWebApp.viewportStableHeight;
                        document.documentElement.style.height = `${height}px`;
                        document.body.style.height = `${height}px`;
                        console.log('Viewport stable height set to:', height);
                    };

                    telegramWebApp.onEvent('viewportChanged', updateViewportHeight);
                    updateViewportHeight(); // Initial call

                    // Get Telegram user data and update Redux
                    const user = telegramWebApp.initDataUnsafe?.user;
                    if (user) {
                        dispatch(setUser({
                            _id: '', // Default, update later if fetched from backend
                            telegramId: user.id.toString(), // Telegram user ID
                            username: user.username || user.first_name || 'User', // Username or fallback
                            assets: [], // Default empty
                            savedList: [], // Default empty
                            ton: 0, // Default, update later if needed
                            usd: 0, // Default, update later if needed
                        }));
                        console.log('Telegram User stored in Redux:', user);
                    } else {
                        dispatch(setUser({
                            _id: '',
                            telegramId: '',
                            username: 'Guest',
                            assets: [],
                            savedList: [],
                            ton: 0,
                            usd: 0,
                        }));
                        console.log('No Telegram user data available');
                    }
                }
            }).catch((err) => {
                dispatch(setUser({
                    _id: '',
                    telegramId: '',
                    username: 'Guest',
                    assets: [],
                    savedList: [],
                    ton: 0,
                    usd: 0,
                }));
                console.error('Error loading WebApp SDK:', err);
            });
        }
    }, [dispatch]); // Only dispatch in dependencies now

    return (
        <div
            className={`h-screen w-screen pb-5 overflow-scroll bg-fixed ${
                isFullscreen ? 'pt-[105px]' : null
            } flex flex-col`}
        >
            <NavbarTop isFullscreen={isFullscreen} />
            <div className="w-screen flex justify-center flex-grow">
                {children}
            </div>
            <NavbarBottom />
        </div>
    );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ReduxProvider>
                    <AppInitializer>
                        {children}
                    </AppInitializer>
                </ReduxProvider>
            </body>
        </html>
    );
}