"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
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
  const vibrate = useVibrate();
  const translate = useTranslations("account");

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [currency, setCurrency] = useState<"ton" | "usd">("ton");
  const [loading, setLoading] = useState<boolean>(false);
  const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([]);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioValuePrev, setPortfolioValuePrev] = useState<number>(0);

  // 🟢 1. TanStack Query to fetch and cache chart data
  const {
    data: chartData = [],
    isLoading: chartLoading,
    isError: chartError,
  } = useQuery<GiftWeekDataInterface[]>({
    queryKey: ["userChart", user.telegramId],
    queryFn: async () => {
      if (user.assets.length > 0) {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/get-user-chart/${user.telegramId}`
        );
        return data;
      } else {
        return [];
      }
    },
    enabled: !!user.telegramId, // Only run when user is known
    refetchOnWindowFocus: false,
  });

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

  // 🟢 3. Calculate portfolio change based on cached chart data
  useEffect(() => {
    if (chartData.length > 1) {
      const first = chartData[0];
      const last = chartData[chartData.length - 1];

      if (currency === "ton") {
        setPortfolioValue(last.priceTon);
        setPortfolioValuePrev(first.priceTon);
      } else {
        setPortfolioValue(last.priceUsd);
        setPortfolioValuePrev(first.priceUsd);
      }
    }
  }, [chartData, currency]);

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
    <div className='w-full flex flex-col justify-center px-3 relative'>
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
        <div className='w-full p-3 flex justify-center font-bold text-foreground bg-secondaryTransparent rounded-3xl'>
          {translate("openInTelegram")}
        </div>
      ) : assetsArray.length > 0 ? (
        <>
          <div className='w-full flex flex-row justify-start items-center relative'>
            <div className='flex flex-col gap-x-3'>
              <div className='flex flex-row items-center'>
                {currency === "ton" ? (
                  <Image
                    alt='ton logo'
                    src='/images/toncoin.webp'
                    width={25}
                    height={25}
                    className='mr-2'
                  />
                ) : (
                  <span className='text-3xl mr-1'>$</span>
                )}
                {chartLoading ? (
                  <h1 className='text-3xl font-bold text-secondaryText animate-pulse'>
                    ...
                  </h1>
                ) : (
                  <h1 className='text-3xl font-bold'>
                    {portfolioValue.toFixed(2)}
                  </h1>
                )}
              </div>
              <div className='flex flex-row items-center gap-x-2 mt-1 ml-1'>
                <span className='text-sm text-secondaryText'>
                  Last 24 hours
                </span>
                <span
                  className={`flex flex-row items-center text-sm font-bold ${
                    countPercentChange(portfolioValuePrev, portfolioValue) >= 0
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

          {/* Cached Portfolio Chart */}
          <PortfolioChart data={chartData} currency={currency} />

          {/* Assets List */}
          <div className='w-full h-auto mt-3'>
            <div className='w-full flex justify-between items-end mb-5'>
              <h2 className='flex flex-row items-center text-lg font-bold'>
                Portfolio
              </h2>
              <div className='flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-sm h-8 px-5 box-border ${
                    currency === "ton"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrency("ton");
                    vibrate();
                  }}>
                  Ton
                </button>
                <button
                  className={`text-sm h-8 px-5 box-border ${
                    currency === "usd"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrency("usd");
                    vibrate();
                  }}>
                  Usd
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
        <div className='w-full h-1/2 flex flex-col justify-center items-center'>
          <Link
            href={"/settings/edit-assets"}
            className='px-3 py-2 text-sm text-white bg-primary rounded-3xl'>
            Add Gifts to portfolio
          </Link>
        </div>
      )}
    </div>
  );
}
