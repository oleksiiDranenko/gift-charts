"use client";

import IndexWidget from "@/components/mainPage/IndexWidget";
import NoPrefetchLink from "@/components/NoPrefetchLink";
import TreemapChart from "@/components/tools/treemap/TreemapChart";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { useEffect, useState } from "react";

export default function Page() {
  const giftsList = useAppSelector((state) => state.giftsList);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(true);
  const [sortedList, setSortedList] = useState<any[]>([]);

  const [settings] = useState(() => {
    if (typeof window === "undefined")
      return { currency: "ton", giftType: "line", giftBackground: "none" };
    const saved = localStorage.getItem("settings");
    if (saved)
      try {
        return JSON.parse(saved);
      } catch {}
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });

  const { currency, giftType, giftBackground } = settings;

  useEffect(() => {
    if (giftsList) {
      let rawList = [...giftsList];

      let sortedList = rawList.filter(
        (gift) => gift.preSale === false || gift.preSale === undefined
      );
      setSortedList(
        sortedList.sort(
          (a, b) =>
            b.priceTon * b.upgradedSupply - a.priceTon * a.upgradedSupply
        )
      );
    }
  }, giftsList);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, giftsList]);
  return (
    <div className='w-full'>
      {loading ? (
        <div>loading</div>
      ) : (
        <div className='w-full p-3 gap-y-3 flex flex-col justify-center'>
          <div className='w-full flex flex-col gap-3'>
            <h1 className='flex flex-row items-center text-xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-6 mr-2 text-primary animate-pulse'>
                <path d='M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z' />
              </svg>
              Last 24 hours
            </h1>
            <div className='w-full rounded-3xl overflow-hidden bg-secondaryTransparent'>
              <NoPrefetchLink
                className='w-full flex justify-center'
                href={"/tools/treemap"}>
                <TreemapChart
                  data={sortedList.slice(0, 50)}
                  chartType={"marketCap"}
                  timeGap={"24h"}
                  currency={currency}
                  type={"default"}
                  customHeight={true}
                />
              </NoPrefetchLink>
            </div>
            <IndexWidget
              currency={currency}
              indexId='68493d064b37eed02b7ae5af'
              indexName='marketCap'
            />

            <div className='flex w-full gap-3'>
              <div className='w-full bg-secondaryTransparent rounded-3xl p-5'>
                <div className='w-full text-sm flex flex-row items-center justify-start gap-x-1'>
                  Total Supply
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

                <div className='mt-2 text-xl font-bold'>1,000,000,000</div>

                <div className='w-fit mt-2  flex flex-row items-center text-sm font-normal  text-green-500 py-1 px-3 rounded-3xl bg-green-500/10'>
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
                  </svg>{" "}
                  2.4%
                </div>
              </div>

              <div className='w-full bg-secondaryTransparent rounded-3xl p-5'>
                <div className='w-full text-sm flex flex-row items-center justify-start gap-x-1'>
                  Trading Volume
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

                <div className='mt-2 text-xl font-bold'>582,984.23</div>

                <div className='w-fit mt-2  flex flex-row items-center text-sm font-normal  text-green-500 py-1 px-3 rounded-3xl bg-green-500/10'>
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
                  </svg>{" "}
                  2.4%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
