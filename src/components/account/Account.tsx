"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Asset from "./Asset";
import Cash from "./Cash";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import GiftInterface from "@/interfaces/GiftInterface";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import ReactLoading from "react-loading";
import { Link } from "@/i18n/navigation";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { countPercentChange } from "@/numberFormat/functions";
import { Copy, Gift } from "lucide-react";
import { useTranslations } from "next-intl";
import PortfolioChart from "./PortfolioChart";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";

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

  const giftsList = useAppSelector((state) => state.giftsList);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [currency, setCurrency] = useState<"ton" | "usd">("ton");
  const [changeType, setChangeType] = useState<"24h%" | "PNL" | "PNL%">("24h%");
  const [loading, setLoading] = useState<boolean>(false);

  const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([]);

  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioValuePrev, setPortfolioValuePrev] = useState<number>(0);
  const [referralLink, setReferralLink] = useState("");

  // 🆕 Added chart data
  const [chartData, setChartData] = useState<GiftWeekDataInterface[]>([]);
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [chartError, setChartError] = useState<boolean>(false);

  const translate = useTranslations("account");

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.Telegram?.WebApp?.initDataUnsafe?.user
    ) {
      const userId = window.Telegram.WebApp.initDataUnsafe.user.id;
      const link = `https://t.me/gift_charts_bot?start=ref_${userId}`;
      setReferralLink(link);
    }
  }, []);

  const handleClick = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      alert("Referral link copied!");
    } else {
      alert("Referral link not available.");
    }
  };

  // 🧩 Fetch chart data (formerly inside PortfolioChart)
  useEffect(() => {
    const fetchLifeData = async () => {
      try {
        setChartLoading(true);
        setChartError(false);
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/users/get-user-chart/${user.telegramId}`
        );
        setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setChartError(true);
      } finally {
        setChartLoading(false);
      }
    };

    fetchLifeData();
  }, []);

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

  // 🧩 Update portfolio value and percent change based on chart data
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

  const updateAssetsArray = () => {
    if (giftsList.length > 0) {
      const updatedAssets = (user.assets || [])
        .map((asset: { giftId: string; amount: number; avgPrice: number }) => {
          const gift = giftsList.find(
            (gift: GiftInterface) => gift._id === asset.giftId
          );
          if (gift) {
            return {
              _id: gift._id,
              name: gift.name,
              image: gift.image,
              currency: currency,
              amount: asset.amount,
              avgPrice: asset.avgPrice,
              priceTon: gift.priceTon,
              priceUsd: gift.priceUsd,
              tonPrice24hAgo: gift.tonPrice24hAgo,
              usdPrice24hAgo: gift.usdPrice24hAgo,
            };
          }
          return undefined;
        })
        .filter((asset): asset is AssetDisplayInterface => asset !== undefined);
      updatedAssets.sort((a, b) => {
        const valueA =
          currency === "ton" ? a.priceTon * a.amount : a.priceUsd * a.amount;
        const valueB =
          currency === "ton" ? b.priceTon * b.amount : b.priceUsd * b.amount;
        return valueB - valueA;
      });
      setAssetsArray(updatedAssets);
    }
  };

  useEffect(updateAssetsArray, []);

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
      ) : (
        <>
          {/* Header */}
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

          <PortfolioChart data={chartData} currency={currency} />

          {/* <div className='flex flex-row gap-3 mt-3 justify-between'>
            <div className='flex flex-row box-border bg-secondaryTransparent rounded-xl gap-x-1'>
              <button
                className={`text-xs h-8 px-3 box-border ${
                  currency === "ton"
                    ? "rounded-xl bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  setCurrency("ton");
                  vibrate();
                }}>
                Ton
              </button>
              <button
                className={`text-xs h-8 px-3 box-border ${
                  currency === "usd"
                    ? "rounded-xl bg-primary font-bold text-white"
                    : null
                }`}
                onClick={() => {
                  setCurrency("usd");
                  vibrate();
                }}>
                Usd
              </button>
            </div>
          </div> */}

          <div className='w-full h-auto mt-5'>
            <div className=' bg-secondaryTransparent p-3 rounded-xl'>
              <div className='w-full flex justify-between items-center text-xl mb-3'>
                <h2 className='flex flex-row items-center gap-x-1'>
                  <Gift size={20} />
                  {translate("assets")}:
                </h2>
              </div>

              {assetsArray.length !== 0 ? (
                assetsArray.map((asset) => (
                  <Asset
                    _id={asset._id}
                    name={asset.name}
                    image={asset.image}
                    currency={currency}
                    amount={asset.amount}
                    avgPrice={asset.avgPrice}
                    priceTon={asset.priceTon}
                    priceUsd={asset.priceUsd}
                    assetsPrice={portfolioValue}
                    percentChange={
                      currency === "ton"
                        ? countPercentChange(
                            asset.tonPrice24hAgo,
                            asset.priceTon
                          )
                        : countPercentChange(
                            asset.usdPrice24hAgo,
                            asset.priceUsd
                          )
                    }
                    key={asset._id}
                  />
                ))
              ) : (
                <h2 className='text-secondaryText text-sm mt-3'>
                  {translate("noAssets")}
                </h2>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
