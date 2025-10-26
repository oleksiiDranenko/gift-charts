"use client";

import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import { IndexDataInterface } from "@/interfaces/IndexDataInterface";
import Image from "next/image";
import { useMemo } from "react";

interface CalendarHeatmapProps {
  lifeData: GiftLifeDataInterface[] | IndexDataInterface[];
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ lifeData }) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = useMemo(() => {
    const monthlyMap = new Map<string, GiftLifeDataInterface[]>();

    lifeData.forEach((entry) => {
      const [day, month, year] = entry.date.split("-").map(Number);
      const dateObj = new Date(year, month - 1, day);
      const monthKey = `${year}-${dateObj.getMonth()}`; // "2025-0" to "2025-11"

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, []);
      }

      // Store with valid date string for sorting
      monthlyMap.get(monthKey)!.push({
        ...entry,
        date: dateObj.toISOString(),
        name: "",
      });
    });

    const result: {
      month: string;
      percentChange: number | null;
    }[] = [];

    for (let i = 0; i < 12; i++) {
      const monthKey = `2025-${i}`;
      const entries = monthlyMap.get(monthKey);

      if (entries && entries.length >= 2) {
        const sorted = entries.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        const startPrice = sorted[0].priceTon;
        const endPrice = sorted[sorted.length - 1].priceTon;
        const percentChange = ((endPrice - startPrice) / startPrice) * 100;

        result.push({
          month: months[i],
          percentChange,
        });
      } else if (entries && entries.length === 1) {
        result.push({
          month: months[i],
          percentChange: 0,
        });
      } else {
        result.push({
          month: months[i],
          percentChange: null,
        });
      }
    }

    return result;
  }, [lifeData]);

  const getColor = (percentChange: number | null): string => {
    if (percentChange === null) return "bg-secondaryTransparent";
    if (percentChange > 0) return "bg-green-600";
    if (percentChange < 0) return "bg-red-600";
    return "bg-[#8F9779]";
  };

  return (
    <div className='w-full mt-3'>
      <div className='w-full overflow-hidden'>
        <div className='grid grid-cols-6 text-white'>
          {monthlyData.map((item, index) => (
            <div
              key={index}
              className={`aspect-square flex flex-col border border-background items-center justify-center text-xl ${getColor(
                item.percentChange
              )} ${item.percentChange === null && "text-secondaryText"}`}
              title={
                item.percentChange === null
                  ? `${item.month}: No data`
                  : `${item.month}: ${item.percentChange.toFixed(2)}%`
              }>
              <span className='text-sm font-bold'>{item.month}</span>
              <span className='text-xs'>
                {item.percentChange === null
                  ? ""
                  : `${
                      item.percentChange > 0 ? "+" : ""
                    }${item.percentChange.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarHeatmap;
