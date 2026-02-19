"use client";

import GiftChart from "@/components/giftInfo/GiftChart";
import GiftStats from "@/components/giftInfo/GiftStats";
import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import ReactLoading from "react-loading";
import BackButton from "@/utils/ui/backButton";
import GiftSupplyPie from "@/components/giftInfo/GiftSupplyPie";
import GiftInitPriceSection from "@/components/giftInfo/GiftInitPriceSection";
import { useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import ModelsList from "@/components/giftInfo/ModelsList";
import { Transition } from "@headlessui/react";
import { GiftSkeleton } from "@/components/giftInfo/GiftSkeleton";

async function fetchWeekData(name: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/weekChart`, {
    params: { name },
  });
  return data;
}

async function fetchLifeData(name: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/lifeChart`, {
    params: { name },
  });
  return data;
}

async function fetchGift(id: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/gifts/${id}`,
  );
  return data;
}

export default function Page({ params }: any) {
  const { id } = params;
  const vibrate = useVibrate();

  const [page, setPage] = useState<"overview" | "models">("overview");

  // Fetch gift data from API
  const {
    data: gift = null,
    isLoading: isGiftLoading,
    isError: isGiftError,
  } = useQuery<GiftInterface | null, Error>({
    queryKey: ["gift", id],
    queryFn: () => fetchGift(id),
    enabled: !!id,
  });
  // Fetch week data (depends on gift)
  const {
    data: weekList = [],
    isLoading: isWeekLoading,
    isError: isWeekError,
  } = useQuery<GiftWeekDataInterface[], Error>({
    queryKey: ["weekData", gift?.name],
    queryFn: () => fetchWeekData(gift!.name),
    enabled: !!gift,
  });

  const {
    data: lifeList = [],
    isLoading: isLifeLoading,
    isError: isLifeError,
  } = useQuery<GiftLifeDataInterface[], Error>({
    queryKey: ["lifeData", gift?.name],
    queryFn: () => fetchLifeData(gift!.name),
    enabled: !!gift,
  });

  const giftLoading = isGiftLoading;
  const loading = giftLoading || isWeekLoading || isLifeLoading;

  return (
    <div className='w-full lg:w-[98%] pt-[0px] flex justify-center pb-20'>
      <div className='w-full'>
        <div className='px-3 mb-1'>
          <BackButton
            rightElement={
              <div className='w-full flex flex-row justify-end'>
                <button
                  className={`flex flex-row items-center justify-center h-8 gap-x-1 px-3 border-b-2 ${
                    page === "overview"
                      ? "border-foreground"
                      : "border-secondaryTransparent text-secondaryText"
                  }`}
                  onClick={() => {
                    vibrate();
                    setPage("overview");
                  }}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-4 mr-1 text-primary'>
                    <path d='M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z' />
                  </svg>
                  Overview
                </button>
                <button
                  className={`flex flex-row items-center justify-center h-8 gap-x-1 px-3 border-b-2 ${
                    page === "models"
                      ? "border-foreground"
                      : "border-secondaryTransparent text-secondaryText"
                  }`}
                  onClick={() => {
                    vibrate();
                    setPage("models");
                  }}>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                    className='size-4 mr-1 text-primary'>
                    <path
                      fillRule='evenodd'
                      d='M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z'
                      clipRule='evenodd'
                    />
                  </svg>
                  Models
                </button>
              </div>
            }
          />
        </div>
        <Transition
          key={loading ? "loading" : "content"}
          appear
          show={true}
          enter='transition-all ease-out duration-300'
          enterFrom='opacity-0 translate-y-0'
          enterTo='opacity-100 translate-y-0'
          leave='transition-all ease-in duration-300'
          leaveFrom='opacity-100 translate-y-0'
          leaveTo='opacity-0 translate-y-0'>
          {loading ? (
            <div className='flex flex-col'>
              <GiftSkeleton />
            </div>
          ) : gift ? (
            <Transition
              key={page}
              appear
              show={true}
              enter='transition-all ease-out duration-300'
              enterFrom='opacity-0 translate-y-0'
              enterTo='opacity-100 translate-y-0'
              leave='transition-all ease-in duration-300'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 translate-y-0'>
              {page === "overview" ? (
                <div className='flex flex-col'>
                  <GiftChart
                    gift={gift}
                    lifeData={lifeList}
                    weekData={weekList}
                  />

                  <div className='w-full flex flex-col lg:items-start lg:flex-row px-3 mt-5 space-y-5 lg:space-y-0 lg:space-x-3'>
                    <GiftInitPriceSection
                      initStarsPrice={gift.starsPrice}
                      initSupply={gift.initSupply}
                      starUsdtCost={0.015}
                    />
                    <GiftSupplyPie
                      initSupply={gift.initSupply}
                      supply={gift.supply}
                      upgradedSupply={gift.upgradedSupply}
                    />
                  </div>
                </div>
              ) : (
                <div className='w-full pt-5'>
                  <ModelsList
                    isOpen={page === "models"}
                    giftName={gift.name}
                    giftId={gift._id}
                  />
                </div>
              )}
            </Transition>
          ) : (
            <div className='text-center text-red-500'>
              Error loading gift data
            </div>
          )}
        </Transition>
      </div>
    </div>
  );
}
