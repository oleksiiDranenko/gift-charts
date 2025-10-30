"use client";

import { Fragment, useEffect, useState } from "react";
import { useAppDispatch } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setDefaultFilters } from "@/redux/slices/filterListSlice";
import { useQuery } from "react-query";
import axios from "axios";
import ProgressBar from "@ramonak/react-progress-bar";
import useVibrate from "@/hooks/useVibrate";
import Image from "next/image";

const fetchGifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
  return res.data;
};

export default function DefaultUpdate({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const vibrate = useVibrate();
  const [progress, setProgress] = useState<number>(0);

  const {
    data: gifts,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["gifts"],
    queryFn: fetchGifts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false, // this prevents refetch on remount
    onSuccess: (data: any) => {
      dispatch(setGiftsList(data));
    },
  });

  const {} = useQuery(
    ["voteStatus", "marketSentiment"],
    async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/vote/marketSentiment`
      );
      return response.data;
    },
    {
      onError: (error: any) => {
        console.error("Error checking vote status:", error);
      },
      retry: false, // Don't retry on failure
    }
  );

  useQuery({
    queryKey: ["monthData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/indexMonthData/68493d064b37eed02b7ae5af`
      );
      return data.slice(-336);
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
      {isLoading || isFetching ? (
        <div className='fixed inset-0 z-50 flex flex-col justify-center items-center bg-background'>
          <div className='w-1/2 lg:w-5/6 max-w-96  rounded-2xl'>
            <div className='w-full flex flex-col items-center justify-center mb-3'>
              <Image
                alt='Logo'
                src={"/images/logo.webp"}
                width={100}
                height={100}
              />
            </div>
            <ProgressBar
              completed={progress}
              bgColor='var(--primary)'
              height='6px'
              baseBgColor='var(--secondary)'
              isLabelVisible={false}
              transitionDuration='0.5s'
              transitionTimingFunction='ease-in-out'
            />
          </div>
        </div>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
