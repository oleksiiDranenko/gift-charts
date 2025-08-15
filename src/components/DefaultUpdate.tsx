'use client'

import { useEffect, useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { setDefaultFilters } from '@/redux/slices/filterListSlice';
import { useQuery } from 'react-query';
import axios from 'axios';
import Lottie from 'lottie-react';
import ProgressBar from '@ramonak/react-progress-bar';
import useVibrate from '@/hooks/useVibrate';
import { animations } from '@/animations/animations.js';

const fetchGifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
  return res.data;
};

export default function DefaultUpdate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const vibrate = useVibrate();
  const [progress, setProgress] = useState<number>(0);
  const [currentAnimation, setCurrentAnimation] = useState<any>(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * animations.length);
    setCurrentAnimation(animations[randomIndex]);
  }, []);

 const { data: gifts, isLoading, isFetching } = useQuery({
  queryKey: ['gifts'],
  queryFn: fetchGifts,
  refetchOnMount: false,
  onSuccess: (data: any) => {
    dispatch(setGiftsList(data));
  },
});

  useEffect(() => {
    dispatch(setDefaultFilters());
  }, [dispatch]);

  // Progress simulation
  useEffect(() => {
  if (isLoading) {
    setProgress(40);
    const timer = setTimeout(() => setProgress(80), 500);
    return () => clearTimeout(timer);
  } else if (!isLoading) {
    setProgress(100);
    const timer = setTimeout(() => vibrate(), 400);
    return () => clearTimeout(timer);
  }
}, [isLoading]);


  return (
    <>
      {(isLoading || isFetching) ? (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-background">
          <div className="w-40 h-40 mb-5">
            {currentAnimation && (
              <Lottie 
                animationData={currentAnimation} 
                loop={true} 
              />
            )}
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
  );
}
