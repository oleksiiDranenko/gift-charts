'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { setDefaultFilters } from '@/redux/slices/filterListSlice';
import Lottie from 'lottie-react';
import ProgressBar from '@ramonak/react-progress-bar';
import useVibrate from '@/hooks/useVibrate';
import {animations} from '@/animations/animations.js';

export default function DefaultUpdate({ children }: { children: React.ReactNode }) {
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
                  <div className="w-2/3 lg:w-1/2 max-w-96">
                    <ProgressBar
                      completed={progress}
                      bgColor="var(--primary)"
                      height="2px"
                      baseBgColor="var(--secondary-transparent)"
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