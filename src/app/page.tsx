'use client';

import { useEffect } from 'react';
import axios from 'axios';
import { useAppDispatch } from '@/redux/hooks';
import { setGiftsList } from '@/redux/slices/giftsListSlice';
import { useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import MainPage from '@/components/mainPage/MainPage';
import { setDefaultFilters } from '@/redux/slices/filterListSlice';
import Lottie from 'lottie-react';
import animationData from '@/animations/lowRide.json';
import ProgressBar from '@ramonak/react-progress-bar';

export default function Page() {
  // const dispatch = useAppDispatch();
  // const giftsList = useAppSelector((item) => item.giftsList);
  // const [loading, setLoading] = useState<boolean>(true);
  // const [progress, setProgress] = useState<number>(0);

  // useEffect(() => {
  //   const fetchGifts = async () => {
  //     try {
  //       setLoading(true);
  //       setProgress(30); // Start at 30%
  //       if (giftsList.length === 0) {
  //         const giftsRes = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
  //         setProgress(80); // Set to 80% after data fetch
  //         dispatch(setGiftsList(giftsRes.data));
  //       }
  //     } catch (error) {
  //       console.error('Error fetching gifts:', error);
  //       setProgress(100); // Complete progress even on error
  //     } finally {
  //       setProgress(100); // Ensure progress reaches 100%
  //       setTimeout(() => {
  //         setLoading(false); // Hide the loading UI after a delay
  //       }, 500); // 500ms delay for smooth completion
  //     }
  //   };

  //   fetchGifts();
  // }, [dispatch, giftsList]);

  // useEffect(() => {
  //   dispatch(setDefaultFilters());
  // }, [dispatch]);

  return (
    <main className="w-full lg:w-1/2 pt-[70px] pb-24">
      <MainPage />
    </main>
  );
}