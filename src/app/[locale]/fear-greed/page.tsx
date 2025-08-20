"use client";

import { Angry, Gift, Laugh, Smile } from "lucide-react";
import GaugeChart from "react-gauge-chart";

export default function Page() {
  const percent = 0.05; // 65% greed

  return (
    <div className="w-full lg:w-1/2 mt-10 px-3 flex flex-col items-center">
      <div className="w-full flex flex-col items-center py-3 bg-secondaryTransparent rounded-xl">
        <h1 className="flex flex-row items-center gap-x-1 text-xl mb-3 mt-3 font-bold text-center">
          <Gift size={20} strokeWidth={2.5} /> Fear & Greed
        </h1>
        <div className="w-screen lg:w-full relative">
          <GaugeChart
            id="fear-greed-gauge"
            nrOfLevels={5}
            percent={percent}
            colors={["#ff4d4d", "#ffff66", "#00e600"]}
            arcWidth={0.17}
            cornerRadius={5}
            hideText={true}
            needleColor="#fff"
          />
          <span className="absolute lg:text-base text-xs top-1/3 md:top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500/30 pointer-events-none">
            @gift_charts
          </span>
        </div>

        {/* Custom percentage below chart */}
        <p className="-mt-2 w-1/2 mb-3 flex flex-row items-center justify-center gap-x-1 font-bold text-[#ff4d4d] bg-red-500/10 p-3 rounded-xl">
          <Angry size={18} strokeWidth={2.5} /> Extreme Fear
        </p>
      </div>
    </div>
  );
}
