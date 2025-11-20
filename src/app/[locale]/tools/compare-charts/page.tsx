"use client";

import CompareCharts from "@/components/tools/compare-charts/CompareChart";
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";

export default function Page() {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);

  const [gifts, setGifts] = useState<GiftInterface[]>([]);
  const [weekData, setWeekData] = useState<GiftWeekDataInterface[][]>([]);
  const [lifeData, setLifeData] = useState<GiftLifeDataInterface[][]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // Fetch gifts if giftsList is empty
        let updatedGiftsList = giftsList;
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
          updatedGiftsList = giftsRes.data; // Use fetched data directly
        }

        // Only proceed if giftsList has enough items
        if (updatedGiftsList.length < 4) {
          console.error("Not enough gifts in giftsList");
          return;
        }

        // Call getChartData with the updated giftsList
        await getChartData(updatedGiftsList);
      } catch (error) {
        console.error("Error fetching gifts or chart data:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, giftsList.length]);

  const getChartData = async (giftsList: GiftInterface[]) => {
    const weekList: GiftWeekDataInterface[][] = [];
    const lifeList: GiftLifeDataInterface[][] = [];

    const selectedGifts = [giftsList[0], giftsList[1], giftsList[51]];
    setGifts(selectedGifts);

    try {
      for (const gift of selectedGifts) {
        const weekRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/weekChart`,
          {
            params: { name: gift.name },
          }
        );
        const lifeRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/lifeChart`,
          {
            params: { name: gift.name },
          }
        );

        weekList.push(weekRes.data);
        lifeList.push(lifeRes.data);
      }

      setWeekData(weekList);
      setLifeData(lifeList);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className='w-screen pt-[0px]  px-3 pb-24 flex justify-center'>
      <div className='w-full lg:w-11/12'>
        {!loading ? (
          <div className='flex flex-col'>
            <div className='w-full h-10 gap-x-3 flex items-center justify-between'>
              <button
                onClick={goBack}
                className='w-1/2 h-10 flex items-center justify-center bg-slate-800 rounded-3xl'>
                {"<- Back"}
              </button>
              <div className='w-1/2 h-10 flex items-center justify-center text-sm text-slate-400 bg-slate-800 rounded-3xl'>
                @gift_charts_bot
              </div>
            </div>
            <CompareCharts
              listType='1w'
              setListType={() => console.log()}
              gifts={gifts}
              weekData={weekData}
              lifeData={lifeData}
              isInfoHidden={false}
            />
          </div>
        ) : (
          <div className='w-full flex justify-center'>
            <ReactLoading
              type='spin'
              color='#0098EA'
              height={30}
              width={30}
              className='mt-5'
            />
          </div>
        )}
      </div>
    </div>
  );
}
