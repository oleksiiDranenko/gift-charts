"use client";

import GiftChart from "@/components/giftInfo/GiftChart";
import GiftStats from "@/components/giftInfo/GiftStats";
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import axios from "axios";
import { useQuery } from "react-query";
import ReactLoading from "react-loading";
import BackButton from "@/utils/ui/backButton";
import GiftSupplyPie from "@/components/giftInfo/GiftSupplyPie";
import GiftInitPriceSection from "@/components/giftInfo/GiftInitPriceSection";
import { useAppSelector } from "@/redux/hooks";
import { useEffect, useState } from "react";

async function fetchWeekData(name: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
    params: { name },
  });
  return data;
}

async function fetchLifeData(name: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
    params: { name },
  });
  return data;
}

export default function Page({ params }: any) {
  const { id } = params;

  const giftsList = useAppSelector(
    (state) => state.giftsList as GiftInterface[]
  );

  const [gift, setGift] = useState<GiftInterface | null>(null);

  useEffect(() => {
    if (giftsList) {
      const selectedGift = giftsList.find((item) => item._id === id) || null;
      setGift(selectedGift);
    }
  }, [giftsList, id]);

  // Fetch week data (depends on gift)
  const {
    data: weekList = [],
    isLoading: isWeekLoading,
    isError: isWeekError,
  } = useQuery<GiftWeekDataInterface[], Error>(
    ["weekData", gift?.name],
    () => fetchWeekData(gift!.name),
    { enabled: !!gift } // only fetch when gift is loaded
  );

  // Fetch life data (depends on gift)
  const {
    data: lifeList = [],
    isLoading: isLifeLoading,
    isError: isLifeError,
  } = useQuery<GiftLifeDataInterface[], Error>(
    ["lifeData", gift?.name],
    () => fetchLifeData(gift!.name),
    { enabled: !!gift } // only fetch when gift is loaded
  );

  const giftLoading = !gift && giftsList !== null;
  const loading = giftLoading || isWeekLoading || isLifeLoading;

  return (
    <div className='w-full lg:w-[98%] pt-[0px] flex justify-center pb-20'>
      <div className='w-full'>
        <div className='px-3'>
          <BackButton />
        </div>
        {loading ? (
          <div className='flex flex-col'>
            <div className='w-full flex h-20 justify-center items-center'>
              <ReactLoading
                type='spin'
                color='var(--primary)'
                height={30}
                width={30}
                className='mt-5'
              />
            </div>
            {/* <div className='block lg:hidden'>
              <GiftSkeleton />
            </div> */}
          </div>
        ) : gift ? (
          <div className='flex flex-col'>
            <GiftChart gift={gift} lifeData={lifeList} weekData={weekList} />
            {/* <GiftStats gift={gift} /> */}

            <div className='w-full flex flex-col lg:items-start lg:flex-row px-3 mt-5 space-y-5 lg:space-y-0 lg:space-x-3'>
              <GiftInitPriceSection
                initStarsPrice={gift.starsPrice}
                initSupply={gift.initSupply}
                starUsdtCost={0.015}
              />
              <GiftSupplyPie
                initSupply={gift.initSupply}
                supply={gift.supply}
                upgradedSupply={gift.upgradedSupply}
              />
            </div>
          </div>
        ) : (
          <div className='text-center text-red-500'>
            Error loading gift data
          </div>
        )}
      </div>
    </div>
  );
}
