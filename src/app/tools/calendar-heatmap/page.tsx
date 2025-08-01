'use client'

import CalendarHeatmap from "@/components/tools/calendar-heatmap/CalendarHeatmap";
import BackButton from "@/utils/ui/backButton";
import React from "react";

export default function Page() {
  return (
    <div className="w-screen pt-[70px] pb-24 flex justify-center">
      <div className="w-full lg:w-1/2 px-3">
        <div>
            <BackButton/>
        </div>
        <CalendarHeatmap />
      </div>
    </div>
  );
}
