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

async function fetchGift(id: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/gifts/${id}`
  );
  return data;
}

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

  // Fetch gift
  const {
    data: gift,
    isLoading: isGiftLoading,
    isError: isGiftError,
  } = useQuery<GiftInterface, Error>(["gift", id], () => fetchGift(id));

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

  const loading = isGiftLoading || isWeekLoading || isLifeLoading;

  return (
    <div className='w-full lg:w-[98%] pt-[0px] flex justify-center'>
      <div className='w-full'>
        <div className='px-3'>
          <BackButton />
        </div>
        {loading ? (
          <div className='flex flex-col'>
            <div className='w-full h-20 flex justify-center items-center'>
              <ReactLoading
                type='spin'
                color='var(--primary)'
                height={30}
                width={30}
                className='mt-5'
              />
            </div>
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
