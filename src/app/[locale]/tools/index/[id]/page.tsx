"use client";

import { IndexInterface } from "@/interfaces/IndexInterface";
import { useState, useEffect } from "react";
import axios from "axios";
import { IndexDataInterface } from "@/interfaces/IndexDataInterface";
import IndexChart from "@/components/tools/IndexChart";
import ReactLoading from "react-loading";
import { useRouter } from "next/navigation";
import IndexPie from "@/components/tools/IndexPie";
import { Link } from "@/i18n/navigation";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import useVibrate from "@/hooks/useVibrate";
import CalendarHeatmap from "@/components/tools/calendar-heatmap/CalendarHeatmap";
import { IndexMonthDataInterface } from "@/interfaces/IndexMonthDataInterface";
import BackButton from "@/utils/ui/backButton";

export default function Page({ params }: any) {
  const [index, setIndex] = useState<IndexInterface>();
  const [data, setData] = useState<IndexDataInterface[]>([]);
  const [monthData, setMonthData] = useState<IndexMonthDataInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const router = useRouter();

  const vibrate = useVibrate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const indexRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/indexes/get-one/${params.id}`
        );
        const dataRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/indexData/get-all/${params.id}`
        );
        const monthDataRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/indexMonthData/${params.id}`
        );
        setIndex(indexRes.data);
        setData(dataRes.data);
        setMonthData(monthDataRes.data);

        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    })();
  }, [params.id]);

  const goBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className='w-full pt-[0px]  pb-24 flex justify-center'>
      <div className='w-full lg:w-5/6'>
        {!loading && index ? (
          <div className='flex flex-col'>
            <div className='w-full h-10 px-3 gap-x-3 flex items-center justify-between'>
              <BackButton />
            </div>
            <IndexChart
              index={index}
              indexData={data}
              indexMonthData={monthData}
            />
            <div className='mt-5 px-3'>
              <div className='w-full flex flex-row justify-between items-center'>
                <div className='flex flex-row items-center'>
                  <h2 className='text-lg font-bold'>Yearly Performance</h2>
                </div>
                <div>
                  <button
                    onClick={() => setShowCalendar(!showCalendar)}
                    className='flex flex-row items-center py-2 px-3 gap-1 text-sm bg-secondaryTransparent rounded-3xl'>
                    {showCalendar ? (
                      <>
                        Hide
                        <ChevronUp size={18} />
                      </>
                    ) : (
                      <>
                        Show
                        <ChevronDown size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <div className={showCalendar ? "visible" : "hidden"}>
                <CalendarHeatmap lifeData={data} />
              </div>
            </div>
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
