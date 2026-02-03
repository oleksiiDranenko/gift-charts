import CompareCharts from "@/components/tools/compare-charts/CompareCharts";
import BackButton from "@/utils/ui/backButton";
import React from "react";

export default function Page() {
  return (
    <div className='w-full pt-[0px] px-3 pb-24 flex justify-center'>
      <div className='w-full lg:w-[98%]'>
        <div className='w-full h-10 mb-3 gap-x-3 flex items-center justify-between'>
          <BackButton />
        </div>
        <CompareCharts giftNames={["Ion Gem", "Astral Shard"]} />
      </div>
    </div>
  );
}
