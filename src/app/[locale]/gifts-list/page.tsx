"use client";

import GiftsList from "@/components/giftsList/GiftsList";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, giftsList]);

  return (
    <div className='w-full lg:w-11/12 pt-[0px] pb-24'>
      <GiftsList loading={loading} />
    </div>
  );
}
