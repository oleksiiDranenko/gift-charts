'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/redux/provider';
import NavbarBottom from '@/components/navbar/NavbarBottom';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/slices/userSlice';
import axios from 'axios';
import { ThemeProvider } from 'next-themes';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { setDefaultFilters } from '@/redux/slices/filterListSlice';
import Lottie from 'lottie-react';
import ProgressBar from '@ramonak/react-progress-bar';
import useVibrate from '@/hooks/useVibrate';
import {animations} from '@/animations/animations.js';

const inter =  Inter ({ subsets: ['latin', 'cyrillic'] });

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
                        if(screen.width < 1024) {
                            telegramWebApp.requestFullscreen();
                            setIsFullscreen(true);
                            console.log('Requested fullscreen mode.');
                        }
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
                isFullscreen ? 'pt-[40px]' : null
            } flex flex-col`}
        >
            <div className="w-screen flex justify-center flex-grow">
                {children}
            </div>
            <NavbarBottom />
        </div>
    );
}

function DefaultUpdate({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const giftsList = useAppSelector((item) => item.giftsList);
    const [loading, setLoading] = useState<boolean>(true);
    const [progress, setProgress] = useState<number>(0);
    const vibrate = useVibrate()
    const [currentAnimation, setCurrentAnimation] = useState<any>(null);

    useEffect(() => {
      const randomIndex = Math.floor(Math.random() * animations.length);
      setCurrentAnimation(animations[randomIndex]);
    }, []);

     const handleAnimationComplete = () => {
        if (loading) {
          let newIndex = Math.floor(Math.random() * animations.length);
          currentAnimation(animations[newIndex])
        }
    };


  useEffect(() => {
    const fetchGifts = async () => {
      try {
        setLoading(true);
        setProgress(40);
        setTimeout(() => {
          setProgress(60)
        }, 500);
        
        
        
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
          setProgress(80);
          dispatch(setGiftsList(giftsRes.data));
        }
      } catch (error) {
        console.error('Error fetching gifts:', error);
        setProgress(50);
      } finally {
        setProgress(100);
        setTimeout(() => {
          setLoading(false);
          vibrate()
        }, 400);
      }
    };

    fetchGifts();
  }, [dispatch, giftsList]);

  useEffect(() => {
    dispatch(setDefaultFilters());
  }, [dispatch]);

  return (
    <>
        {loading ? (
                <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-background">
                  <div className="w-40 h-40 mb-5">
                    {currentAnimation &&
                        <Lottie 
                            animationData={currentAnimation} 
                            loop={true}
                        />
                    }
                  </div>
                  <div className="w-1/2 max-w-96">
                    <ProgressBar
                      completed={progress}
                      bgColor="var(--primary)"
                      height="3px"
                      baseBgColor="var(--secondary)"
                      isLabelVisible={false}
                      transitionDuration="0.5s"
                      transitionTimingFunction="ease-in-out"
                    />
                  </div>
                </div>
              ) : (
                <>{children}</>
              )}
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
    return (
        <html lang="en">
            <body className={inter.className}>
                <ReduxProvider>
                     <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                        <AppInitializer>
                            <DefaultUpdate>
                              {children}
                            </DefaultUpdate>
                        </AppInitializer>
                    </ThemeProvider>
                </ReduxProvider>
            </body>
        </html>
    );
}