"use client";

import GiftsList from "@/components/giftsList/GiftsList";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";

export default function Page() {
  const giftsList = useAppSelector((state) => state.giftsList);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (giftsList.length > 0) setLoading(false);
  }, [giftsList]);

  return (
    <div className='w-full lg:w-[98%] pt-[0px] pb-24'>
      <GiftsList loading={loading} />
    </div>
  );
}
