'use client';

import GiftChart from '@/components/giftInfo/GiftChart';
import GiftStats from '@/components/giftInfo/GiftStats';
import GiftInterface from '@/interfaces/GiftInterface';
import GiftLifeDataInterface from '@/interfaces/GiftLifeDataInterface';
import GiftWeekDataInterface from '@/interfaces/GiftWeekDataInterface';
import axios from 'axios';
import { useQuery } from 'react-query';
import { AlarmClock } from 'lucide-react';
import ReactLoading from 'react-loading';
import BackButton from '@/utils/ui/backButton';

async function fetchGift(id: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/gifts/${id}`);
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
  } = useQuery<GiftInterface, Error>(['gift', id], () => fetchGift(id));

  // Fetch week data (depends on gift)
  const {
    data: weekList = [],
    isLoading: isWeekLoading,
    isError: isWeekError,
  } = useQuery<GiftWeekDataInterface[], Error>(
    ['weekData', gift?.name],
    () => fetchWeekData(gift!.name),
    { enabled: !!gift } // only fetch when gift is loaded
  );

  // Fetch life data (depends on gift)
  const {
    data: lifeList = [],
    isLoading: isLifeLoading,
    isError: isLifeError,
  } = useQuery<GiftLifeDataInterface[], Error>(
    ['lifeData', gift?.name],
    () => fetchLifeData(gift!.name),
    { enabled: !!gift } // only fetch when gift is loaded
  );

  const loading = isGiftLoading || isWeekLoading || isLifeLoading;

  return (
    <div className="w-screen pt-[70px] pb-24 flex justify-center">
      <div className="w-full lg:w-1/2">
        {loading ? (
          <div className="flex flex-col">
            <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
              <BackButton />
            </div>
            <div className="w-full h-20 flex justify-center items-center">
              <ReactLoading
                type="spin"
                color="var(--primary)"
                height={30}
                width={30}
                className="mt-5"
              />
            </div>
          </div>
        ) : gift ? (
          <div className="flex flex-col">
            <div className="w-full h-10 px-3 gap-x-3 flex items-center justify-between">
              <BackButton />
              <div className="w-1/2 h-10 pr-3 flex items-center justify-end text-sm text-secondaryText">
                {weekList.length > 0 ? (
                  <span className="flex flex-row items-center gap-x-1">
                    <AlarmClock size={14} />
                    {`${weekList[weekList.length - 1].time} UTC+1`}
                  </span>
                ) : (
                  'No time data'
                )}
              </div>
            </div>
            <GiftChart gift={gift} lifeData={lifeList} weekData={weekList} />
            <GiftStats gift={gift} />
          </div>
        ) : (
          <div className="text-center text-red-500">Error loading gift data</div>
        )}
      </div>
    </div>
  );
}
