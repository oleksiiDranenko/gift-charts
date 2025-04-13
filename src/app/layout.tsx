'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/redux/provider';
import NavbarTop from '@/components/navbar/NavbarTop';
import NavbarBottom from '@/components/navbar/NavbarBottom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';
import axios from 'axios';

const inter = Inter({ subsets: ['latin'] });

// Inner component to handle Telegram and Redux logic
function AppInitializer({ children }: { children: React.ReactNode }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        
        if (typeof window !== 'undefined') {
            import('@twa-dev/sdk').then(async (WebApp) => {
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
                    const telegramUser = telegramWebApp.initDataUnsafe?.user;
                   
                    if (telegramUser) {
                        const initialUser = {
                            _id: '',
                            telegramId: telegramUser.id.toString(),
                            username: telegramUser.username || telegramUser.first_name || 'User',
                            assets: [],
                            savedList: [],
                            ton: 0,
                            usd: 0,
                        };
                        dispatch(setUser(initialUser));
                        console.log('Initial Telegram User stored in Redux:', telegramUser);

                        // Fetch full user data from backend
                        try {
                            const userRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/users/check-account/${telegramUser.id}`);
                            if (userRes.data?._id) {
                                dispatch(setUser(userRes.data));
                                console.log('Fetched User stored in Redux:', userRes.data);
                            } else {
                                console.log('No user found in backend, keeping initial state');
                            }
                        } catch (err) {
                            console.error('Error fetching user from backend:', err);
                        }
                    } else {
                        dispatch(setUser({
                            _id: '',
                            telegramId: '',
                            username: '_guest',
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
                    username: '_guest',
                    assets: [],
                    savedList: [],
                    ton: 0,
                    usd: 0,
                }));
                console.error('Error loading WebApp SDK:', err);
            });
        }
    }, [dispatch]);

    return (
        <div
            className={`h-screen w-screen pb-5 overflow-scroll bg-fixed ${
                isFullscreen ? 'pt-[20px]' : null
            } flex flex-col`}
        >
            {/* <NavbarTop isFullscreen={isFullscreen} /> */}
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