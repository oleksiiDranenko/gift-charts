"use client";

import BackButton from "@/utils/ui/backButton";
import axios from "axios";
import {
  Activity,
  Angry,
  Frown,
  Gift,
  Info,
  Laugh,
  Meh,
  Smile,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import GaugeChart from "react-gauge-chart";

export default function Page() {
  // const fetchIndex = async () => {
  //   const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/fearAndGreed`);
  //   const percent = res.data.value / 100;
  //   console.log(percent);
  //   return percent;
  // };

  // const { data: percent, isLoading } = useQuery<number>({
  //   queryKey: ["fearAndGreed"],
  //   queryFn: fetchIndex,
  // });

  // const { resolvedTheme } = useTheme();

  // const t = useTranslations("fearAndGreed");

  return (
    <main className='w-full lg:w-[98%] pt-[0px]  px-3'>
      <div className='w-full h-10 gap-x-3 flex items-center justify-between'>
        <BackButton />
      </div>

      {/* {isLoading ? (
        <div>loading</div>
      ) : (
        <div className='w-full lg:1/2 mt-3 flex flex-col lg:flex-row lg:justify-between items-center py-3 '>
          <h1 className='flex flex-row items-center gap-x-1 text-xl font-bold mb-2 lg:hidden'>
            <Gift size={18} strokeWidth={2} />
            {t("name")}
          </h1>
          <div className='w-full relative'>
            <GaugeChart
              id='fear-greed-gauge'
              nrOfLevels={5}
              percent={percent}
              colors={
                resolvedTheme === "dark"
                  ? ["#ff4d4d", "#ffff66", "#00e600"]
                  : ["#ff4d4d", "#d1b500", "#00e600"]
              }
              arcWidth={0.17}
              cornerRadius={5}
              hideText={true}
              needleColor={resolvedTheme === "dark" ? "#fff" : "#000"}
            />
            <span className='absolute lg:text-base text-xs top-1/3 md:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-secondary pointer-events-none'>
              @gift_charts
            </span>
          </div>
          <div className='w-full lg:1/2 flex flex-col lg:items-center items-center gap-y-2'>
            <h1 className='text-xl font-bold mb-2 hidden lg:block'>
              {t("name")}
            </h1>
            <div
              className={`w-fit flex flex-row items-center gap-x-1 px-3 py-2 rounded-3xl ${
                percent !== undefined
                  ? percent >= 0 && percent < 0.2
                    ? "text-red-500 bg-red-500/5"
                    : percent >= 0.2 && percent < 0.4
                    ? "text-red-500 bg-red-500/5"
                    : percent >= 0.4 && percent < 0.6
                    ? "text-yellow-500 bg-yellow-500/5"
                    : percent >= 0.6 && percent < 0.8
                    ? "text-green-500 bg-green-500/5"
                    : percent >= 0.8 && percent <= 1
                    ? "text-green-500 bg-green-500/5"
                    : ""
                  : ""
              }`}>
              {percent !== undefined ? (
                percent >= 0 && percent < 0.2 ? (
                  <>
                    <Angry size={20} /> {t("extremeFear")}
                  </>
                ) : percent >= 0.2 && percent < 0.4 ? (
                  <>
                    <Frown size={20} /> {t("fear")}
                  </>
                ) : percent >= 0.4 && percent < 0.6 ? (
                  <>
                    <Meh size={20} /> {t("neutral")}
                  </>
                ) : percent >= 0.6 && percent < 0.8 ? (
                  <>
                    <Smile size={20} /> {t("greed")}
                  </>
                ) : percent >= 0.8 && percent <= 1 ? (
                  <>
                    <Laugh size={20} /> {t("extremeGreed")}
                  </>
                ) : null
              ) : (
                <div className='w-full h-20 flex justify-center items-center'>
                  <ReactLoading
                    type='spin'
                    color='var(--primary)'
                    height={30}
                    width={30}
                    className='mt-5'
                  />
                </div>
              )}

              {percent !== undefined && (
                <span className='font-bold'>
                  - {(percent * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='flex flex-row items-center gap-x-3 bg-blue-400 text-primary bg-opacity-15 mt-5 p-5 rounded-3xl'>
        <Info size={20} /> Index is currently in testing
      </div> */}
    </main>
  );
}
