"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
import { useQuery } from "react-query";
import IndexChart from "./IndexChart";
import Image from "next/image";
import { Activity, ChartSpline } from "lucide-react";
import { useTranslations } from "next-intl";
import NoPrefetchLink from "../NoPrefetchLink";

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
    queryKey: ["marketCapWidget"],
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/indexMonthData/${indexId}`
      );
      return data.slice(-48);
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
    <NoPrefetchLink
      href={`/tools/index/${indexId}`}
      className={`w-full flex flex-col box-border h-44 rounded-3xl bg-secondaryTransparent overflow-hidden ${
        isLoading && "animate-pulse"
      }`}>
      {!isLoading ? (
        <>
          <div className='p-5 flex flex-row justify-between items-center'>
            <div className='flex flex-col'>
              <div className='flex flex-row items-center gap-x-1'>
                <span className='text-sm'>{translate(indexName)}</span>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-4 text-primary'>
                  <path
                    fillRule='evenodd'
                    d='M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <span className='flex flex-row items-center mt-1 text-xl font-bold'>
                {currency === "ton" ? (
                  <Image
                    alt='ton'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className='mr-[6px]'
                  />
                ) : (
                  <Image
                    alt='usdt'
                    src='/images/usdt.svg'
                    width={18}
                    height={18}
                    className='mr-[6px]'
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
              className={`flex flex-row items-center text-sm font-normal py-1 px-3 rounded-3xl ${
                percentChange < 0
                  ? "text-red-500 bg-red-500/10"
                  : "text-green-500 bg-green-500/10"
              }`}>
              {percentChange >= 0 ? (
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
              )}{" "}
              {percentChange}%
            </span>
          </div>

          {monthData && <IndexChart data={monthData} currency={currency} />}
        </>
      ) : (
        <div className='h-full w-full flex flex-col justify-center items-center text-secondary animate-pulse'>
          <ChartSpline size={30} />
        </div>
      )}
    </NoPrefetchLink>
  );
}
