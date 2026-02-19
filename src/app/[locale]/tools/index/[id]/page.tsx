"use client";

import { IndexInterface } from "@/interfaces/IndexInterface";
import { useState, useEffect } from "react";
import axios from "axios";
import { IndexDataInterface } from "@/interfaces/IndexDataInterface";
import IndexChart from "@/components/tools/IndexChart";
import { useRouter } from "next/navigation";
import IndexPie from "@/components/tools/IndexPie";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import useVibrate from "@/hooks/useVibrate";
import CalendarHeatmap from "@/components/tools/calendar-heatmap/CalendarHeatmap";
import { IndexMonthDataInterface } from "@/interfaces/IndexMonthDataInterface";
import BackButton from "@/utils/ui/backButton";
import { useQuery } from "@tanstack/react-query";
import Loader from "@/components/reusable/Loader";

async function fetchIndex(id: string): Promise<IndexInterface> {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/indexes/get-one/${id}`,
  );
  return data;
}

async function fetchIndexData(id: string): Promise<IndexDataInterface[]> {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/indexData/get-all/${id}`,
  );
  return data;
}

async function fetchIndexMonthData(
  id: string,
): Promise<IndexMonthDataInterface[]> {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/indexMonthData/${id}`,
  );
  return data;
}

export default function Page({ params }: any) {
  const [showCalendar, setShowCalendar] = useState<boolean>(false);

  const router = useRouter();

  const vibrate = useVibrate();

  const {
    data: index,
    isLoading: loadingIndex,
    error: errorIndex,
  } = useQuery({
    queryKey: ["index", params.id],
    queryFn: () => fetchIndex(params.id),
  });

  const {
    data: indexData = [],
    isLoading: loadingData,
    error: errorData,
  } = useQuery({
    queryKey: ["indexData", params.id],
    queryFn: () => fetchIndexData(params.id),
  });

  const {
    data: monthData = [],
    isLoading: loadingMonthData,
    error: errorMonthData,
  } = useQuery({
    queryKey: ["indexMonthData", params.id],
    queryFn: () => fetchIndexMonthData(params.id),
  });

  const isLoading = loadingIndex || loadingData || loadingMonthData;

  return (
    <div className='w-full pt-[0px]  pb-24 flex justify-center'>
      <div className='w-full lg:w-[98%]'>
        {!isLoading && index ? (
          <div className='flex flex-col'>
            <div className='w-full h-10 px-3 gap-x-3 flex items-center justify-between'>
              <BackButton />
            </div>
            <IndexChart
              index={index}
              indexData={indexData}
              indexMonthData={monthData}
            />
            {/* <div className='mt-5 px-3'>
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
                <CalendarHeatmap lifeData={indexData} />
              </div>
            </div> */}
          </div>
        ) : (
          <div className='w-full flex justify-center'>
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
