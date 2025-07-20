"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Asset from "./Asset";
import Cash from "./Cash";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import GiftInterface from "@/interfaces/GiftInterface";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import ReactLoading from "react-loading";
import Link from "next/link";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { countPercentChange } from "@/numberFormat/functions";
import { Gift, Settings } from "lucide-react";

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
  const [loading, setLoading] = useState<boolean>(true);

  const [assetsArray, setAssetsArray] = useState<AssetDisplayInterface[]>([]);
  const [assetsPriceTon, setAssetsPriceTon] = useState<number>(0);
  const [assetsPriceUsd, setAssetsPriceUsd] = useState<number>(0);

  const [ton, setTon] = useState<number>(3);
  const [tonPercentage, setTonPercentage] = useState<number>(0);
  const [usdPercentage, setUsdPercentage] = useState<number>(0);

  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [portfolioValue24hAgo, setPortfolioValue24hAgo] = useState<number>(0);
  const [portfolioInitValue, setPortfolioInitValue] = useState<number>(0);

  useEffect(() => {
    console.log(user);
    const fetchGifts = async () => {
      try {
        setLoading(true);
        if (giftsList.length === 0) {
          const giftsRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/gifts`
          );
          dispatch(setGiftsList(giftsRes.data));
          setTon(
            giftsList[1].priceUsd / giftsList[1].priceTon
          );
        }
      } catch (error) {
        console.error("Error fetching gifts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGifts();
  }, [dispatch, giftsList]);

  useEffect(() => {
    if (giftsList.length > 0) {
      const latestGift = giftsList[giftsList.length - 1];
      setTon(latestGift.priceUsd / latestGift.priceTon);
    }
    setCashPercentages();
    updateAssetsArray();
  }, [user, currency, giftsList]);

  useEffect(() => {
    setCashPercentages();
    updateAssetsArray();
  }, [user, currency, giftsList]);

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

      const totalPriceTon = updatedAssets.reduce(
        (sum, asset) => sum + asset.priceTon * asset.amount,
        0
      );
      const totalPriceUsd = updatedAssets.reduce(
        (sum, asset) => sum + asset.priceUsd * asset.amount,
        0
      );
      const totalPriceTon24Ago = updatedAssets.reduce(
        (sum, asset) => sum + asset.tonPrice24hAgo * asset.amount,
        0
      );
      const totalPriceUsd24Ago = updatedAssets.reduce(
        (sum, asset) => sum + asset.usdPrice24hAgo * asset.amount,
        0
      );

      setAssetsPriceTon(totalPriceTon);
      setAssetsPriceUsd(totalPriceUsd);

      // Calculate initial portfolio value (using avgPrice, stored in TON)
      const initialAssetsValue = updatedAssets.reduce(
        (sum, asset) => sum + (currency === "ton" ? asset.avgPrice : asset.avgPrice * ton) * asset.amount,
        0
      );

      // Calculate portfolio values (current, past, and initial)
      if (currency === "ton") {
        const current = parseFloat(
          (totalPriceTon + user.ton + user.usd / ton).toFixed(2)
        );
        const past = parseFloat(
          (totalPriceTon24Ago + user.ton + user.usd / ton).toFixed(2)
        );
        const initial = parseFloat(
          (initialAssetsValue + user.ton + user.usd / ton).toFixed(2)
        );
        setPortfolioValue(current);
        setPortfolioValue24hAgo(past);
        setPortfolioInitValue(initial);
      } else {
        const current = parseFloat(
          (totalPriceUsd + user.ton * ton + user.usd).toFixed(2)
        );
        const past = parseFloat(
          (totalPriceUsd24Ago + user.ton * ton + user.usd).toFixed(2)
        );
        const initial = parseFloat(
          (initialAssetsValue + user.ton * ton + user.usd).toFixed(2)
        );
        setPortfolioValue(current);
        setPortfolioValue24hAgo(past);
        setPortfolioInitValue(initial);
      }
    }
  };

  const setCashPercentages = () => {
    if (user) {
      if (currency === "ton") {
        const totalTon = user.ton + user.usd / ton;
        setTonPercentage(
          totalTon ? Math.round((user.ton / totalTon) * 100) : 0
        );
        setUsdPercentage(
          totalTon ? Math.round((user.usd / ton / totalTon) * 100) : 0
        );
      } else {
        const totalUsd = user.ton * ton + user.usd;
        setTonPercentage(
          totalUsd ? Math.round(((user.ton * ton) / totalUsd) * 100) : 0
        );
        setUsdPercentage(
          totalUsd ? Math.round((user.usd / totalUsd) * 100) : 0
        );
      }
    }
  };

  return (
    <div className="w-full flex flex-col justify-center px-3 relative">
      {loading ? (
        <div className="w-full flex justify-center">
          <ReactLoading
            type="spin"
            color="#0098EA"
            height={30}
            width={30}
            className="mt-5"
          />
        </div>
      ) : user.username === "_guest" ? (
        <div className="w-full p-3 flex justify-center font-bold text-foreground bg-secondaryTransparent rounded-lg">
          Please open this app in Telegram
        </div>
      ) : (
        <>
          <div className="w-full h-28 flex flex-row justify-center items-center">
            <div className="flex flex-col items-center">
              <div className="flex flex-row items-center">
                {currency === "ton" ? (
                  <Image
                    alt="ton logo"
                    src="/images/toncoin.webp"
                    width={30}
                    height={30}
                    className="mr-2"
                  />
                ) : (
                  <span className="text-4xl mr-1">$</span>
                )}
                <h1 className="text-4xl font-bold">{portfolioValue}</h1>
              </div>
              <span
                className={`mt-1 font-bold ${
                  changeType === '24h%' ? 
                  (countPercentChange(portfolioValue24hAgo, portfolioValue) >= 0
                    ? "text-green-500"
                    : "text-red-500")
                    : changeType === 'PNL' ?
                    (portfolioValue - portfolioInitValue >=0 ? "text-green-500"
                    : "text-red-500")
                    : changeType === 'PNL%' &&
                    (countPercentChange(portfolioInitValue, portfolioValue) >= 0
                    ? "text-green-500"
                    : "text-red-500")
                }`}
              >
                {changeType === "24h%"
                  ? `${
                      countPercentChange(
                        portfolioValue24hAgo,
                        portfolioValue
                      ) >= 0
                        ? "+"
                        : ""
                    }
                ${countPercentChange(portfolioValue24hAgo, portfolioValue).toFixed(2)}% `
                  : changeType === "PNL"
                  ? `${portfolioValue - portfolioInitValue > 0 && '+'} ${(portfolioValue - portfolioInitValue).toFixed(2)}`
                  : changeType === "PNL%" &&
                    `${
                      countPercentChange(portfolioInitValue, portfolioValue) >=
                      0
                        ? "+"
                        : ""
                    }
                ${countPercentChange(portfolioInitValue, portfolioValue).toFixed(2)}% `}
              </span>
            </div>
          </div>

          <div className="flex flex-row gap-3 mt-3 justify-between">
            <div className="flex flex-row box-border bg-secondaryTransparent rounded-lg gap-x-1">
              <button
                className={`text-xs h-8 px-3 box-border ${
                  currency === "ton" ? 'rounded-lg bg-primary font-bold text-white' : null
                }`}
                onClick={() => {
                  setCurrency("ton");
                  vibrate();
                }}
              >
                Ton
              </button>
              <button
                className={`text-xs h-8 px-3 box-border ${
                  currency === "usd" ? 'rounded-lg bg-primary font-bold text-white' : null
                }`}
                onClick={() => {
                  setCurrency("usd");
                  vibrate();
                }}
              >
                Usd
              </button>
            </div>

            <div className="flex flex-row box-border bg-secondaryTransparent rounded-lg gap-x-1">
              <button
                className={`text-xs h-8 px-3 box-border ${
                  changeType === "24h%" && 'rounded-lg bg-primary font-bold text-white'
                }`}
                onClick={() => {
                  setChangeType("24h%");
                  vibrate();
                }}
              >
                24h %
              </button>
              <button
                className={`text-xs h-8 px-3 box-border ${
                  changeType === "PNL" && 'rounded-lg bg-primary font-bold text-white'
                }`}
                onClick={() => {
                  setChangeType("PNL");
                  vibrate();
                }}
              >
                PNL
              </button>
              <button
                className={`text-xs h-8 px-3 box-border ${
                  changeType === "PNL%" && 'rounded-lg bg-primary font-bold text-white'
                }`}
                onClick={() => {
                  setChangeType("PNL%");
                  vibrate();
                }}
              >
                PNL %
              </button>
            </div>
          </div>

          <div className="w-full h-auto">
            <div className="mt-5">
              <div className="w-full flex justify-between items-center text-lg font-bold mb-3 pr-2">
                <h2>
                  Assets
                </h2>
                <div className="flex flex-row items-center">
                  {currency === "ton" ? (
                    <Image
                      alt="ton logo"
                      src="/images/toncoin.webp"
                      width={16}
                      height={16}
                      className="mr-1"
                    />
                  ) : (
                    <span className="mr-1">$</span>
                  )}
                  <span>
                    {currency === "ton"
                      ? assetsPriceTon.toFixed(2)
                      : assetsPriceUsd.toFixed(2)}
                  </span>
                </div>
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
                    assetsPrice={
                      currency === "ton" ? assetsPriceTon : assetsPriceUsd
                    }
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
                <h2 className="text-secondary mt-3">No assets yet</h2>
              )}
            </div>

            {user?.ton !== 0 || user.usd !== 0 ? (
              <div className="mt-5">
                <div className="w-full flex justify-between items-center text-lg font-bold mb-3 pr-2">
                  <h2>Cash</h2>
                  <div className="flex flex-row items-center">
                    {currency === "ton" ? (
                      <Image
                        alt="ton logo"
                        src="/images/toncoin.webp"
                        width={16}
                        height={16}
                        className="mr-1"
                      />
                    ) : (
                      <span className="mr-1">$</span>
                    )}
                    <span>
                      {currency === "ton"
                        ? (user.ton + user.usd / ton).toFixed(2)
                        : (user.ton * ton + user.usd).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div>
                  {user.ton !== 0 ? (
                    <Cash
                      name="ton"
                      amount={user.ton}
                      percentage={tonPercentage}
                    />
                  ) : null}
                  {user.usd !== 0 ? (
                    <Cash
                      name="usd"
                      amount={user.usd}
                      percentage={usdPercentage}
                    />
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}