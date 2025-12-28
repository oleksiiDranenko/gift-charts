"use client";

import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import AddBanner from "../AddBanner";
import GiftsList from "../giftsList/GiftsList";
import NoPrefetchLink from "../NoPrefetchLink";
import VoteBanner from "../tools/vote/VoteBanner";

export default function MainPage() {
  const vibrate = useVibrate();

  const giftsList = useAppSelector((state) => state.giftsList);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (giftsList.length > 0) setLoading(false);
  }, [giftsList]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div>
      {/* <div className='px-3 mb-3'>
        <IndexWidget
          currency={currency}
          indexId='68493d064b37eed02b7ae5af'
          indexName='marketCap'
        />
      </div> */}

      <div className='flex w-full gap-3 p-3 mb-1'>
        <div className='w-full bg-secondaryTransparent rounded-3xl p-5'>
          <div className='w-full text-sm flex flex-row items-center justify-start gap-x-1'>
            Total Supply
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4 text-primary'>
              <path
                fillRule='evenodd'
                d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z'
                clipRule='evenodd'
              />
            </svg>
          </div>

          <div className='mt-2 text-xl font-bold'>1,000,000,000</div>

          <div className='w-fit mt-2  flex flex-row items-center text-sm font-normal  text-green-500 py-1 px-3 rounded-3xl bg-green-500/10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-3 mr-1'>
              <path
                fillRule='evenodd'
                d='M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z'
                clipRule='evenodd'
              />
            </svg>{" "}
            2.4%
          </div>
        </div>

        <div className='w-full bg-secondaryTransparent rounded-3xl p-5'>
          <div className='w-full text-sm flex flex-row items-center justify-start gap-x-1'>
            Trading Volume
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-4 text-primary'>
              <path
                fillRule='evenodd'
                d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z'
                clipRule='evenodd'
              />
            </svg>
          </div>

          <div className='mt-2 text-xl font-bold'>582,984.23</div>

          <div className='w-fit mt-2  flex flex-row items-center text-sm font-normal  text-green-500 py-1 px-3 rounded-3xl bg-green-500/10'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-3 mr-1'>
              <path
                fillRule='evenodd'
                d='M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z'
                clipRule='evenodd'
              />
            </svg>{" "}
            2.4%
          </div>
        </div>
      </div>

      <GiftsList loading={loading} />
    </div>
  );
}
