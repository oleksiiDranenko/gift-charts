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
      {/* <div className='w-full px-3'>
        <AddBanner className='mb-5' />
      </div> */}

      <div className='px-3 mb-5'>
        <VoteBanner />
      </div>

      <GiftsList loading={loading} />
    </div>
  );
}
