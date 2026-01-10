"use client";

import { useAppSelector } from "@/redux/hooks";
import axios from "axios";
import { useQuery } from "react-query";
import Image from "next/image";

export interface GiftAttribute {
  name: string;
  rarity_percent: number;
}

export interface Gift {
  base_name: string;
  name: string;
  number: number;
  model: GiftAttribute;
  symbol: GiftAttribute;
  backdrop: GiftAttribute;
}

export default function AccountTest() {
  const user = useAppSelector((state) => state.user);

  const {
    data: gifts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["userGifts"],
    queryFn: async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/portfolio/get-gifts/${user.telegramId}`
      );
      return res.data as Gift[];
    },
  });

  return (
    <div>
      <div className='h-48 w-full flex items-center justify-center'>
        @{user.username}
      </div>
      <div className='w-full grid grid-cols-3 lg:grid-cols-6 gap-3 px-3'>
        {isLoading && "loading..."}
        {gifts &&
          gifts.map((gift) => {
            return (
              <div className='p-3 bg-secondaryTransparent rounded-3xl'>
                <Image
                  src={`https://nft.fragment.com/gift/${gift.name.toLowerCase()}.medium.jpg`}
                  alt={""}
                  width={70}
                  height={70}
                  className='w-full rounded-3xl mb-3'
                />
                <div className='w-full flex flex-col justify-center items-center'>
                  <div className='w-full flex flex-col justify-center items-start gap-y-1'>
                    <span className='w-full font-bold truncate'>
                      {gift.base_name}
                    </span>
                    <span className='text-xs text-secondaryText'>
                      #{gift.number}
                    </span>
                  </div>

                  <span className='w-full mt-3 font-bold flex flex-row justify-start items-center rounded-3xl'>
                    <Image
                      alt='toncoin'
                      src='/images/toncoin.webp'
                      width={15}
                      height={15}
                      className='mr-1'
                    />
                    <span className='font-bold'>123</span>
                  </span>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
