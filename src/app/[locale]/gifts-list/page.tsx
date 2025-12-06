"use client";

import GiftsList from "@/components/giftsList/GiftsList";
import { useAppDispatch } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useQuery } from "react-query";

const fetchGifts = async () => {
  const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts`);
  return res.data;
};

export default function Page() {
  const dispatch = useAppDispatch();

  const { isLoading } = useQuery({
    queryKey: ["gifts"],
    queryFn: fetchGifts,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    onSuccess: (data) => {
      dispatch(setGiftsList(data));
    },
  });

  return (
    <div className='w-full lg:w-[98%] pt-[0px] pb-24'>
      <GiftsList loading={isLoading} />
    </div>
  );
}
