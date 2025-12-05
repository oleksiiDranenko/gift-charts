"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Asset from "./Asset";
import ReactLoading from "react-loading";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import GiftInterface from "@/interfaces/GiftInterface";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import axios from "axios";
import { countPercentChange } from "@/numberFormat/functions";
import useVibrate from "@/hooks/useVibrate";
import PortfolioChart from "./PortfolioChart";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useTranslations } from "next-intl";
import { useQuery } from "react-query";
import { Link } from "@/i18n/navigation";

interface AssetDisplayInterface {
  _id: string;
  name: string;
  image: string;
  currency: "ton" | "usd";
  amount: number;
  avgPrice: number;
  priceTon: number;
  priceUsd: number;
  tonPrice24hAgo: number;
  usdPrice24hAgo: number;
}

export default function Account() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("settings");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          console.warn("Failed to parse settings from localStorage");
        }
      }
    }
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });
  const vibrate = useVibrate();
  const translate = useTranslations("account");

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [currency, setCurrency] = useState<"ton" | "usd">(settings.currency);
  const [loading, setLoading] = useState<boolean>(false);
  const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioValuePrev, setPortfolioValuePrev] = useState<number>(0);

  const giftsMap = useMemo(() => {
    const map = new Map<string, GiftInterface>();

    for (const gift of giftsList) {
      map.set(gift._id, gift);
    }

    return map;
  }, [giftsList]);

  useEffect(() => {
    if (!user.assets?.length || giftsList.length === 0) return;

    let current = 0;
    let previous = 0;

    for (const { giftId, amount } of user.assets) {
      const gift = giftsMap.get(giftId);
      if (!gift) continue;

      if (currency === "ton") {
        current += gift.priceTon * amount;
        previous += (gift.tonPrice24hAgo ?? gift.priceTon) * amount;
      } else {
        current += gift.priceUsd * amount;
        previous += (gift.usdPrice24hAgo ?? gift.priceUsd) * amount;
      }
    }

    setPortfolioValue(current);
    setPortfolioValuePrev(previous);
  }, [user.assets, giftsMap, currency]);

  // 🟣 2. Fetch gifts if not in Redux store
  useEffect(() => {
    const fetchGifts = async () => {
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
    };
    fetchGifts();
  }, [dispatch, giftsList]);

  // 🟣 4. Build assets list
  useEffect(() => {
    if (giftsList.length > 0 && user.assets) {
      const updatedAssets = user.assets
        .map((asset: { giftId: string; amount: number; avgPrice: number }) => {
          const gift = giftsList.find(
            (gift: GiftInterface) => gift._id === asset.giftId
          );
          if (!gift) return undefined;
          return {
            _id: gift._id,
            name: gift.name,
            image: gift.image,
            currency,
            amount: asset.amount,
            avgPrice: asset.avgPrice,
            priceTon: gift.priceTon,
            priceUsd: gift.priceUsd,
            tonPrice24hAgo: gift.tonPrice24hAgo,
            usdPrice24hAgo: gift.usdPrice24hAgo,
          };
        })
        .filter(Boolean) as AssetDisplayInterface[];

      updatedAssets.sort((a, b) => {
        const valueA =
          currency === "ton" ? a.priceTon * a.amount : a.priceUsd * a.amount;
        const valueB =
          currency === "ton" ? b.priceTon * b.amount : b.priceUsd * b.amount;
        return valueB - valueA;
      });

      setAssetsArray(updatedAssets);
    }
  }, [giftsList, currency, user.assets]);

  return (
    <div className='w-full flex flex-col justify-center relative'>
      {loading ? (
        <div className='w-full flex justify-center'>
          <ReactLoading
            type='spin'
            color='#0098EA'
            height={30}
            width={30}
            className='mt-5'
          />
        </div>
      ) : user.username === "_guest" ? (
        <div className='w-full px-3 flex items-center justify-center'>
          <div className='w-full lg:w-1/2 p-3 flex flex-col items-center justify-center bg-secondaryTransparent rounded-3xl'>
            <span className=' font-bold mb-3'>
              {translate("openInTelegram")}
            </span>
            <Link
              className='w-full h-12 flex flex-row items-center justify-center rounded-3xl text-white bg-primary gap-x-1'
              href={"https://t.me/gift_charts_bot/?startapp"}
              target='_blank'>
              <Image
                src={"/images/telegram-svgrepo-com.svg"}
                alt={""}
                width={20}
                height={20}
              />{" "}
              Gift Charts Bot
            </Link>
          </div>
        </div>
      ) : assetsArray.length > 0 ? (
        <>
          <div className=''>
            <div className='w-full flex flex-row justify-center items-center relative px-3'>
              <div className='w-full h-44 flex flex-col items-center justify-center'>
                <div className='flex flex-row items-center'>
                  {currency === "ton" ? (
                    <Image
                      alt='ton'
                      src='/images/toncoin.webp'
                      width={25}
                      height={25}
                      className='mr-2'
                    />
                  ) : (
                    <Image
                      alt='usdt'
                      src='/images/usdt.svg'
                      width={25}
                      height={25}
                      className='mr-2'
                    />
                  )}

                  <h1 className='text-4xl font-bold '>
                    {portfolioValue.toFixed(2)}
                  </h1>
                </div>
                <div className='flex flex-row items-center gap-x-2 mt-2 bg-secondaryTransparent px-3 py-1 rounded-3xl'>
                  <span className='text-sm text-secondaryText'>
                    {translate("last24h")}
                  </span>
                  <span
                    className={`flex flex-row items-center text-sm font-bold ${
                      countPercentChange(portfolioValuePrev, portfolioValue) >=
                      0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}>
                    {countPercentChange(portfolioValuePrev, portfolioValue) >= 0
                      ? "+"
                      : ""}
                    {countPercentChange(
                      portfolioValuePrev,
                      portfolioValue
                    ).toFixed(2)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Assets List */}
          <div className='w-full h-auto mt-3 px-2'>
            <div className='w-full mb-5 flex flex-row justify-between items-center'>
              <Link
                className='w-fit flex flex-row items-center text-sm h-8 px-3  box-border bg-secondaryTransparent rounded-3xl gap-x-2'
                href={"/settings/edit-assets"}
                onClick={() => vibrate()}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                  className='size-4 text-primary'>
                  <path
                    fillRule='evenodd'
                    d='M6.455 1.45A.5.5 0 0 1 6.952 1h2.096a.5.5 0 0 1 .497.45l.186 1.858a4.996 4.996 0 0 1 1.466.848l1.703-.769a.5.5 0 0 1 .639.206l1.047 1.814a.5.5 0 0 1-.14.656l-1.517 1.09a5.026 5.026 0 0 1 0 1.694l1.516 1.09a.5.5 0 0 1 .141.656l-1.047 1.814a.5.5 0 0 1-.639.206l-1.703-.768c-.433.36-.928.649-1.466.847l-.186 1.858a.5.5 0 0 1-.497.45H6.952a.5.5 0 0 1-.497-.45l-.186-1.858a4.993 4.993 0 0 1-1.466-.848l-1.703.769a.5.5 0 0 1-.639-.206l-1.047-1.814a.5.5 0 0 1 .14-.656l1.517-1.09a5.033 5.033 0 0 1 0-1.694l-1.516-1.09a.5.5 0 0 1-.141-.656L2.46 3.593a.5.5 0 0 1 .639-.206l1.703.769c.433-.36.928-.65 1.466-.848l.186-1.858Zm-.177 7.567-.022-.037a2 2 0 0 1 3.466-1.997l.022.037a2 2 0 0 1-3.466 1.997Z'
                    clipRule='evenodd'
                  />
                </svg>
                {translate("editPortfolio")}
              </Link>
              <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-sm h-8 px-3 box-border ${
                    currency === "ton"
                      ? "rounded-3xl bg-secondary font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrency("ton");
                    vibrate();
                  }}>
                  <Image
                    src='/images/toncoin.webp'
                    alt='ton'
                    width={18}
                    height={18}
                  />
                </button>
                <button
                  className={`text-sm h-8 px-3 box-border ${
                    currency === "usd"
                      ? "rounded-3xl bg-secondary font-bold"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrency("usd");
                    vibrate();
                  }}>
                  <Image
                    src='/images/usdt.svg'
                    alt='usdt'
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>
            {assetsArray.map((asset) => (
              <Asset
                key={asset._id}
                {...asset}
                assetsPrice={portfolioValue}
                percentChange={
                  currency === "ton"
                    ? countPercentChange(asset.tonPrice24hAgo, asset.priceTon)
                    : countPercentChange(asset.usdPrice24hAgo, asset.priceUsd)
                }
              />
            ))}
          </div>
        </>
      ) : (
        <div className='w-full lg:w-1/2 px-3 flex flex-col justify-center items-center'>
          <div className='w-full p-3 bg-secondaryTransparent rounded-3xl'>
            <div className='w-full flex flex-col items-center mb-5'>
              <h1 className='flex flex-row gap-x-2 items-center text-xl font-bold mb-3'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 16 16'
                  fill='currentColor'
                  className='size-6 text-primary'>
                  <path
                    fillRule='evenodd'
                    d='M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM6.75 8a.75.75 0 0 0 0 1.5h.75v1.75a.75.75 0 0 0 1.5 0v-2.5A.75.75 0 0 0 8.25 8h-1.5Z'
                    clipRule='evenodd'
                  />
                </svg>
                {translate("noAssets")}
              </h1>
              <p className='px-3'>{translate("addGiftsInstruction")}</p>
            </div>
            <Link
              href={"/settings/edit-assets"}
              className='w-full h-12 font-bold flex items-center justify-center text-sm text-white bg-primary rounded-3xl'
              onClick={() => vibrate()}>
              {translate("addGiftsToPortfolio")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
