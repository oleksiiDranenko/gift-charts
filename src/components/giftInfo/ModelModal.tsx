"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import GiftModelInterface from "@/interfaces/GiftModelInterface";
import { formatPrice } from "@/utils/formatNumber";
import { useQuery } from "react-query";
import axios from "axios";
import LineChart from "./LineChart";
import PriceDropdown from "./PriceDropdown";
import { GiftSkeleton } from "./ModelSkeleton";

type PriceOption = "ton" | "usd" | "onSale" | "volume" | "salesCount";

interface Props {
  model: GiftModelInterface | null;
  giftId?: string;
}

async function fetchWeekData(name: string, giftId: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/modelsWeekChart`,
    {
      params: { giftId, modelName: name },
    },
  );
  return data;
}

async function fetchLifeData(name: string, giftId: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/modelsLifeChart`,
    {
      params: { giftId, modelName: name },
    },
  );
  return data;
}

export default function ModelModal({ model, giftId }: Props) {
  const { resolvedTheme } = useTheme();
  const [percentChange, setPercentChange] = useState<number | "no data">(0);
  const [chartPercentChange, setChartPercentChange] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceOption>("ton");

  const { data: weekData = [], isLoading: isLoadingWeek } = useQuery(
    ["modelWeekData", model?.name, giftId],
    () => fetchWeekData(model?.name || "", giftId || ""),
    {
      enabled: !!model?.name && !!giftId,
      refetchOnWindowFocus: false,
      select: (data) => {
        console.log("Week data response:", data);
        // Handle different response structures
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === "object") {
          // Try to find an array property
          const possibleArrays = ["data", "models", "results", "items"];
          for (const key of possibleArrays) {
            if (Array.isArray(data[key])) {
              return data[key];
            }
          }
        }
        // If we can't find an array, return empty
        console.warn("Week data is not in expected format:", data);
        return [];
      },
    },
  );

  const { data: lifeData = [], isLoading: isLoadingLife } = useQuery(
    ["modelLifeData", model?.name, giftId],
    () => fetchLifeData(model?.name || "", giftId || ""),
    {
      enabled: !!model?.name && !!giftId,
      refetchOnWindowFocus: false,
      select: (data) => {
        console.log("Life data response:", data);
        // Handle different response structures
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === "object") {
          // Try to find an array property
          const possibleArrays = ["data", "models", "results", "items"];
          for (const key of possibleArrays) {
            if (Array.isArray(data[key])) {
              return data[key];
            }
          }
        }
        // If we can't find an array, return empty
        console.warn("Life data is not in expected format:", data);
        return [];
      },
    },
  );

  useEffect(() => {
    if (!model) return;

    const countPercentChange = (last24: number, current: number) => {
      return parseFloat((((current - last24) / last24) * 100).toFixed(2));
    };
    setPercentChange(countPercentChange(model.tonPrice24hAgo, model.priceTon));
  }, [model]);

  if (!model) return null;

  const isLoading = isLoadingWeek || isLoadingLife;

  return (
    <div className='flex flex-col space-y-4'>
      {isLoading ? (
        <GiftSkeleton />
      ) : (
        <>
          <div
            className={`w-full h-16 mt-3 gap-x-3 flex flex-row justify-between items-center ${
              resolvedTheme === "dark"
                ? ""
                : "bg-secondaryTransparent rounded-3xl pl-2"
            }`}>
            <div className='h-full flex items-center'>
              <Image
                alt={model.name}
                src={model.image}
                width={55}
                height={55}
                className={`w-[45px] h-[45px] overflow-hidden ml-2 mr-3 ${
                  resolvedTheme === "dark" ? "" : "bg-background rounded-full"
                }`}
              />
              <h1 className='flex flex-col'>
                <span className='text-lg font-bold'>{model.name}</span>
                <span className='text-secondaryText text-sm flex justify-start'>
                  Rarity: {model.rarity}%
                </span>
              </h1>
            </div>
            <div className=' h-14 pr-3 flex flex-col items-end justify-center'>
              <div className='flex flex-row items-center'>
                {selectedPrice === "ton" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className='mr-2'
                  />
                ) : selectedPrice === "usd" ? (
                  <Image
                    alt='usdt'
                    src='/images/usdt.svg'
                    width={18}
                    height={18}
                    className='mr-2'
                  />
                ) : selectedPrice === "onSale" ? null : selectedPrice ===
                  "volume" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className='mr-2'
                  />
                ) : (
                  <span className='mr-2 text-sm font-bold'></span>
                )}
                <span className='text-xl font-bold'>
                  {selectedPrice === "ton"
                    ? formatPrice(model.priceTon)
                    : selectedPrice === "usd"
                      ? formatPrice(model.priceUsd)
                      : selectedPrice === "onSale"
                        ? weekData.length > 0
                          ? weekData[weekData.length - 1].amountOnSale || 0
                          : 0
                        : selectedPrice === "volume"
                          ? formatPrice(currentValue || 0)
                          : currentValue?.toFixed(0) || "0"}
                </span>
              </div>
              <span
                className={`text-sm flex flex-row items-center ${
                  chartPercentChange >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                {chartPercentChange > 0 ? (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-3 mr-1'>
                    <path
                      fillRule='evenodd'
                      d='M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z'
                      clipRule='evenodd'
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-3 mr-1'>
                    <path
                      fillRule='evenodd'
                      d='M3.97 3.97a.75.75 0 0 1 1.06 0l13.72 13.72V8.25a.75.75 0 0 1 1.5 0V19.5a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1 0-1.5h9.44L3.97 5.03a.75.75 0 0 1 0-1.06Z'
                      clipRule='evenodd'
                    />
                  </svg>
                )}
                {chartPercentChange.toFixed(2) + "%"}
              </span>
            </div>
          </div>

          <div className='w-full'>
            <div className='w-full flex flex-row justify-start'>
              <PriceDropdown
                selectedPrice={selectedPrice}
                handleSelectedPrice={setSelectedPrice}
                ModelsOptions={true}
              />
            </div>
            <div className='pl-3'>
              <LineChart
                weekData={weekData}
                lifeData={lifeData}
                selectedPrice={selectedPrice}
                percentChange={chartPercentChange}
                setPercentChange={setChartPercentChange}
                onDataUpdate={({ currentValue }) =>
                  setCurrentValue(currentValue)
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
