"use client";

import { Link } from "@/i18n/navigation";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import IndexChart from "./IndexChart";
import Image from "next/image";
import { Activity, ChartSpline } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  indexId: string;
  indexName: string;
  currency: "ton" | "usd";
}

export default function IndexWidget({ indexId, indexName, currency }: Props) {
  const [percentChange, setPercentChange] = useState<number>(0);
  const translate = useTranslations("indexWidget");

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const {
    data: monthData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["monthData"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/indexMonthData/68493d064b37eed02b7ae5af`
      );
      return data.slice(-336);
    },
  });

  const countPercentChange = (last24: number, current: number) => {
    return parseFloat((((current - last24) / last24) * 100).toFixed(2));
  };

  useEffect(() => {
    if (monthData) {
      if (currency === "ton") {
        const result = countPercentChange(
          monthData[0]?.priceTon,
          monthData[monthData.length - 1]?.priceTon
        );
        setPercentChange(result);
      } else {
        const result = countPercentChange(
          monthData[0]?.priceUsd,
          monthData[monthData.length - 1]?.priceUsd
        );
        setPercentChange(result);
      }
    }
  }, [monthData]);
  return (
    <Link
      href={`/tools/index/${indexId}`}
      className={`flex flex-col box-border h-40 rounded-3xl bg-secondaryTransparent overflow-hidden ${
        isLoading && "animate-pulse"
      }`}>
      {!isLoading ? (
        <>
          <div className='p-3 flex flex-row justify-between items-center'>
            <div className='flex flex-col'>
              <div className='flex flex-row items-center gap-x-2'>
                <span className='text-sm'>{translate(indexName)}</span>
                <span className='text-xs text-secondaryText'>
                  {translate("7days")}
                </span>
              </div>
              <span className='flex flex-row items-center mt-1 text-xl font-bold'>
                {currency === "ton" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className='mr-1'
                  />
                ) : (
                  <Image
                    alt='usdt'
                    src='/images/usdt.svg'
                    width={15}
                    height={15}
                    className='mr-1'
                  />
                )}

                {!isLoading && monthData ? (
                  currency === "ton" ? (
                    formatNumber(monthData[monthData.length - 1]?.priceTon ?? 0)
                  ) : (
                    formatNumber(monthData[monthData.length - 1]?.priceUsd ?? 0)
                  )
                ) : (
                  <span className='text-secondaryText'>—</span>
                )}
              </span>
            </div>

            <span
              className={`py-[2px] px-2 rounded-3xl bg-opacity-10 flex flex-row items-center text-sm font-normal ${
                percentChange < 0
                  ? "text-red-500 bg-red-500"
                  : "text-green-500 bg-green-500"
              }`}>
              {percentChange >= 0 && "+"} {percentChange}%
            </span>
          </div>

          {monthData && <IndexChart data={monthData} currency={currency} />}
        </>
      ) : (
        <div className='h-full w-full flex flex-col justify-center items-center text-secondary animate-pulse'>
          <ChartSpline size={30} />
        </div>
      )}
    </Link>
  );
}
