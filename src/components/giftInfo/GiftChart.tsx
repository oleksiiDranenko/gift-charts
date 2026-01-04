"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import { useEffect, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import CandleChart from "./CandleChart";
import BarChart from "./BarChart";
import {
  ChartCandlestick,
  ChartNoAxesColumn,
  ChartSpline,
  ChevronDown,
  ChevronUp,
  Component,
  SquareArrowOutUpRight,
  Store,
  BarChart4,
} from "lucide-react";
import { useTheme } from "next-themes";
import CalendarHeatmap from "../tools/calendar-heatmap/CalendarHeatmap";
import MarketsModal from "./MarketsModal";
import ModelsModal from "./ModelsModal";
import SettingsModal from "./PriceDropdown";
import LineChart from "./LineChart";
import PriceDropdown from "./PriceDropdown";
import { useTranslations } from "next-intl";
import useWindowSize from "@/hooks/useWindowSize";
import { formatAmount, formatPrice } from "@/utils/formatNumber";
import Watermark from "@/utils/ui/Watermark";
import AddBanner from "../AddBanner";

interface PropsInterface {
  gift: GiftInterface | null;
  weekData: GiftWeekDataInterface[];
  lifeData: GiftLifeDataInterface[];
}

export default function GiftChart({
  gift,
  weekData,
  lifeData,
}: PropsInterface) {
  const vibrate = useVibrate();
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
  const [selectedPrice, setSelectedPrice] = useState<
    "ton" | "usd" | "onSale" | "volume" | "salesCount"
  >(settings.currency);
  const [candleData, setCandleData] = useState<GiftLifeDataInterface[]>([]);
  const [chartType, setChartType] = useState<"line" | "candle" | "bar">("line");
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [percentChange, setPercentChange] = useState<number>(0);
  const [currentValue, setCurrentValue] = useState<number | null>(null);
  const { resolvedTheme } = useTheme();

  const { width } = useWindowSize();
  const smallScreen = width < 1024;

  const translateGeneral = useTranslations("general");
  const translateInfo = useTranslations("giftInfo");

  useEffect(() => {
    const filteredCandleData = lifeData.filter(
      (item) =>
        typeof item.openTon === "number" &&
        typeof item.closeTon === "number" &&
        typeof item.highTon === "number" &&
        typeof item.lowTon === "number"
    );
    setCandleData(filteredCandleData);
  }, [lifeData]);

  const formatNumber = (number: number) => {
    if (number >= 1000) {
      const shortNumber = (number / 1000).toFixed(1);
      return `${shortNumber}K`;
    }
    return number.toString();
  };

  return (
    <>
      {smallScreen ? (
        <div className='h-auto w-full'>
          <div
            className={`w-full h-16 px-3 mt-3 gap-x-3 flex flex-row justify-between items-center ${
              resolvedTheme === "dark"
                ? ""
                : "bg-secondaryTransparent rounded-3xl pl-2"
            }`}>
            <div className='h-full flex items-center'>
              <Image
                alt='gift'
                src={`/gifts/${gift?.image}.webp`}
                width={55}
                height={55}
                className={`w-[50px] h-[50px] p-1 overflow-hidden ml-2 mr-2 ${
                  resolvedTheme === "dark" ? "" : "bg-background rounded-full"
                }`}
              />
              <h1 className='flex flex-col'>
                <span className='text-lg font-bold'>{gift?.name}</span>
                <span className='text-secondaryText text-sm flex justify-start'>
                  {gift ? formatNumber(gift?.upgradedSupply) : null}
                </span>
              </h1>
            </div>
            <div className='w-1/3 h-14 pr-3 flex flex-col items-end justify-center'>
              <div className='flex flex-row items-center'>
                {selectedPrice === "ton" || chartType === "candle" ? (
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
                ) : selectedPrice === "onSale" ? (
                  <Store size={18} className='mr-2 font-bold' />
                ) : selectedPrice === "volume" ? (
                  <Image
                    alt='TON logo'
                    src='/images/toncoin.webp'
                    width={18}
                    height={18}
                    className='mr-2'
                  />
                ) : (
                  <ChartNoAxesColumn size={18} className='mr-2 font-bold' />
                )}
                <span className='text-xl font-bold'>
                  {currentValue !== null ? currentValue.toFixed(2) : "N/A"}
                </span>
              </div>
              <span
                className={`text-sm flex flex-row items-center ${
                  percentChange >= 0 ? "text-green-500" : "text-red-500"
                }`}>
                {percentChange > 0 ? (
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
                {percentChange.toFixed(2) + "%"}
              </span>
            </div>
          </div>

          {/* <div className='w-full h-fit px-3 mb-3 mt-3 flex flex-col gap-y-3'>
            <div className='w-full flex flex-row justify-between'>
              <PriceDropdown
                selectedPrice={selectedPrice}
                handleSelectedPrice={setSelectedPrice}
              />
              <div className='flex flex-row mr-2 box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "line"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setChartType("line");
                    vibrate();
                  }}>
                  <ChartSpline size={16} />
                </button>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "candle"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : selectedPrice !== "ton"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (selectedPrice === "ton") {
                      setChartType("candle");
                      vibrate();
                    }
                  }}>
                  <ChartCandlestick size={16} />
                </button>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "bar"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setChartType("bar");
                    vibrate();
                  }}>
                  <BarChart4 size={16} />
                </button>
              </div>
            </div>
          </div> */}

          <div className='relative pl-3'>
            {chartType === "line" ? (
              <LineChart
                weekData={weekData}
                lifeData={lifeData}
                selectedPrice={selectedPrice}
                percentChange={percentChange}
                setPercentChange={setPercentChange}
                onDataUpdate={({ currentValue }) => {
                  setCurrentValue(currentValue);
                }}
              />
            ) : chartType === "candle" && selectedPrice === "ton" ? (
              <CandleChart
                data={candleData}
                weekData={weekData}
                percentChange={percentChange}
                setPercentChange={setPercentChange}
                onDataUpdate={({ currentValue }) => {
                  setCurrentValue(currentValue);
                }}
              />
            ) : (
              <BarChart
                weekData={weekData}
                lifeData={lifeData}
                selectedPrice={selectedPrice}
                percentChange={percentChange}
                setPercentChange={setPercentChange}
                onDataUpdate={({ currentValue }) => {
                  setCurrentValue(currentValue);
                }}
              />
            )}
          </div>

          <div className=' w-full fixed bottom-0 left-0 flex flex-row gap-x-2 bg-secondaryLight backdrop-blur-xl rounded-t-3xl pb-10 pt-3'>
            <MarketsModal
              trigger={
                <button
                  className='w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-red-600 rounded-3xl text-white'
                  onClick={() => vibrate()}>
                  {translateGeneral("sell")}
                  <SquareArrowOutUpRight size={16} />
                </button>
              }
            />
            <MarketsModal
              trigger={
                <button
                  className='w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-green-600 rounded-3xl text-white'
                  onClick={() => vibrate()}>
                  {translateGeneral("buy")}
                  <SquareArrowOutUpRight size={16} />
                </button>
              }
            />
          </div>

          <div className='w-full px-3'>
            <div className='w-full mt-5 flex flex-col gap-y-2 font-normal bg-secondaryTransparent p-3 rounded-3xl'>
              <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1 border-b border-background dark:border-secondary'>
                <span className='w-full text-secondaryText'>
                  {translateInfo("marketCap")}
                </span>
                <span className='flex flex-row items-center'>
                  {selectedPrice === "usd" ? (
                    <Image
                      alt='usdt'
                      src='/images/usdt.svg'
                      width={16}
                      height={16}
                      className='mr-1'
                    />
                  ) : (
                    <Image
                      alt='ton'
                      src='/images/toncoin.webp'
                      width={16}
                      height={16}
                      className='mr-1'
                    />
                  )}
                  {formatPrice(
                    ((selectedPrice === "usd"
                      ? gift?.priceUsd
                      : gift?.priceTon) || 0) * (gift?.upgradedSupply || 0)
                  )}
                </span>
              </div>
              <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1 border-b border-background dark:border-secondary'>
                <span className='w-full text-secondaryText'>
                  {translateInfo("upgradedSupply")}
                </span>
                <span>{formatAmount(gift?.upgradedSupply || 0)}</span>
              </div>
              <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1 border-b border-background dark:border-secondary'>
                <span className='w-full text-secondaryText'>
                  {translateInfo("supply")}
                </span>
                <span>{formatAmount(gift?.supply || 0)}</span>
              </div>
              <div className='w-full flex flex-col justify-between items-start p-2 gap-y-1'>
                <span className='w-full text-secondaryText'>
                  {translateInfo("initialSupply")}
                </span>
                <span>{formatAmount(gift?.initSupply || 0)}</span>
              </div>
            </div>
          </div>

          {/* <div className='mt-5'>
            <div className='w-full flex flex-row justify-between items-center'>
              <div className='flex flex-row items-center'>
                <h2 className='text-lg font-bold'>
                  {translateInfo("yearlyPerformance")}
                </h2>
              </div>
              <div>
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className='flex flex-row items-center py-2 px-3 gap-1 text-sm bg-secondaryTransparent rounded-3xl'>
                  {showCalendar ? (
                    <>
                      {translateGeneral("hide")}
                      <ChevronUp size={18} />
                    </>
                  ) : (
                    <>
                      {translateGeneral("show")}
                      <ChevronDown size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className={showCalendar ? "visible" : "hidden"}>
              <CalendarHeatmap lifeData={lifeData} />
            </div>
          </div> */}
        </div>
      ) : (
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN
        // WIDE SCREEN

        <div className='flex flex-row box-border mt-5'>
          <div
            className={`w-1/4 flex flex-col justify-between mr-3 ${
              resolvedTheme === "dark"
                ? "border-r-2 border-secondaryTransparent pt-3 px-3"
                : "bg-secondaryTransparent rounded-3xl p-3"
            } `}>
            <div>
              <div className='h-fit flex items-center mb-5'>
                <Image
                  alt='gift'
                  src={`/gifts/${gift?.image}.webp`}
                  width={55}
                  height={55}
                  className={`w-[60px] h-[60px] p-1 overflow-hidden mr-3  ${
                    resolvedTheme === "dark" ? "" : "bg-background rounded-full"
                  } `}
                />
                <h1 className='flex flex-col'>
                  <span className='text-xl font-bold'>{gift?.name}</span>
                  <span className='text-sm text-secondaryText'>All models</span>
                </h1>
              </div>

              <div className='flex flex-row items-center justify-start gap-x-3 gap-y-2  mt-3 flex-wrap'>
                <div className='flex flex-row items-center'>
                  {selectedPrice === "ton" || chartType === "candle" ? (
                    <Image
                      alt='TON logo'
                      src='/images/toncoin.webp'
                      width={24}
                      height={24}
                      className='mr-2'
                    />
                  ) : selectedPrice === "usd" ? (
                    <Image
                      alt='usdt'
                      src='/images/usdt.svg'
                      width={24}
                      height={24}
                      className='mr-2'
                    />
                  ) : selectedPrice === "onSale" ? (
                    <Store size={18} className='mr-2 font-bold' />
                  ) : selectedPrice === "volume" ? (
                    <Image
                      alt='TON logo'
                      src='/images/toncoin.webp'
                      width={18}
                      height={18}
                      className='mr-2'
                    />
                  ) : (
                    <ChartNoAxesColumn size={18} className='mr-2 font-bold' />
                  )}
                  <span className='text-3xl font-bold'>
                    {currentValue !== null
                      ? selectedPrice === "onSale" ||
                        selectedPrice === "salesCount"
                        ? currentValue
                        : formatPrice(currentValue)
                      : "N/A"}
                  </span>
                </div>
                <span
                  className={` w-fit h-fit flex flex-row items-center ${
                    percentChange >= 0 ? "text-green-500 " : "text-red-500 "
                  }`}>
                  {percentChange >= 0 ? (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-5 mr-1'>
                      <path
                        fillRule='evenodd'
                        d='M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-5 mr-1'>
                      <path
                        fillRule='evenodd'
                        d='M1.72 5.47a.75.75 0 0 1 1.06 0L9 11.69l3.756-3.756a.75.75 0 0 1 .985-.066 12.698 12.698 0 0 1 4.575 6.832l.308 1.149 2.277-3.943a.75.75 0 1 1 1.299.75l-3.182 5.51a.75.75 0 0 1-1.025.275l-5.511-3.181a.75.75 0 0 1 .75-1.3l3.943 2.277-.308-1.149a11.194 11.194 0 0 0-3.528-5.617l-3.809 3.81a.75.75 0 0 1-1.06 0L1.72 6.53a.75.75 0 0 1 0-1.061Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                  {Math.abs(percentChange) + "%"}
                </span>
              </div>
              <div className='w-full mt-5 flex flex-col gap-y-2'>
                <div className='w-full flex flex-col justify-between items-start p-1 gap-y-1 border-b border-secondaryTransparent'>
                  <span className='w-full text-secondaryText'>
                    {translateInfo("marketCap")}
                  </span>
                  <span className='flex flex-row items-center'>
                    {selectedPrice === "usd" ? (
                      <Image
                        alt='usdt'
                        src='/images/usdt.svg'
                        width={14}
                        height={14}
                        className='mr-1'
                      />
                    ) : (
                      <Image
                        alt='ton'
                        src='/images/toncoin.webp'
                        width={14}
                        height={14}
                        className='mr-1'
                      />
                    )}
                    {formatPrice(
                      ((selectedPrice === "usd"
                        ? gift?.priceUsd
                        : gift?.priceTon) || 0) * (gift?.upgradedSupply || 0)
                    )}
                  </span>
                </div>
                <div className='w-full flex flex-col justify-between items-start p-1 gap-y-1 border-b border-secondaryTransparent'>
                  <span className='w-full text-secondaryText'>
                    {translateInfo("upgradedSupply")}
                  </span>
                  <span>{formatAmount(gift?.upgradedSupply || 0)}</span>
                </div>
                <div className='w-full flex flex-col justify-between items-start p-1 gap-y-1 border-b border-secondaryTransparent'>
                  <span className='w-full text-secondaryText'>
                    {translateInfo("supply")}
                  </span>
                  <span>{formatAmount(gift?.supply || 0)}</span>
                </div>
                <div className='w-full flex flex-col justify-between items-start p-1 gap-y-1'>
                  <span className='w-full text-secondaryText'>
                    {translateInfo("initialSupply")}
                  </span>
                  <span>{formatAmount(gift?.initSupply || 0)}</span>
                </div>
              </div>
            </div>

            <div className='w-full flex flex-col gap-y-2'>
              <MarketsModal
                trigger={
                  <button
                    className='w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-red-600 rounded-3xl text-white'
                    onClick={() => vibrate()}>
                    {translateGeneral("sell")}
                    <SquareArrowOutUpRight size={16} />
                  </button>
                }
              />
              <MarketsModal
                trigger={
                  <button
                    className='w-full flex flex-row items-center justify-center gap-x-2 h-10 bg-green-600 rounded-3xl text-white'
                    onClick={() => vibrate()}>
                    {translateGeneral("buy")}
                    <SquareArrowOutUpRight size={16} />
                  </button>
                }
              />
            </div>
          </div>

          <div className='w-3/4'>
            <div className='w-full h-fit mb-3 flex flex-row gap-x-2'>
              <PriceDropdown
                selectedPrice={selectedPrice}
                handleSelectedPrice={setSelectedPrice}
              />
              <div className='w-fit flex flex-row box-border bg-secondaryTransparent rounded-3xl gap-x-1'>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "line"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setChartType("line");
                    vibrate();
                  }}>
                  <ChartSpline size={16} />
                </button>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "candle"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : selectedPrice !== "ton"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => {
                    if (selectedPrice === "ton") {
                      setChartType("candle");
                      vibrate();
                    }
                  }}>
                  <ChartCandlestick size={16} />
                </button>
                <button
                  className={`text-xs h-8 px-3 box-border ${
                    chartType === "bar"
                      ? "rounded-3xl bg-primary font-bold text-white"
                      : ""
                  }`}
                  onClick={() => {
                    setChartType("bar");
                    vibrate();
                  }}>
                  <BarChart4 size={16} />
                </button>
              </div>
            </div>
            <div className='relative'>
              {chartType === "line" ? (
                <LineChart
                  weekData={weekData}
                  lifeData={lifeData}
                  selectedPrice={selectedPrice}
                  percentChange={percentChange}
                  setPercentChange={setPercentChange}
                  onDataUpdate={({ currentValue }) => {
                    setCurrentValue(currentValue);
                  }}
                />
              ) : chartType === "candle" && selectedPrice === "ton" ? (
                <CandleChart
                  data={candleData}
                  weekData={weekData}
                  percentChange={percentChange}
                  setPercentChange={setPercentChange}
                  onDataUpdate={({ currentValue }) => {
                    setCurrentValue(currentValue);
                  }}
                />
              ) : (
                <BarChart
                  weekData={weekData}
                  lifeData={lifeData}
                  selectedPrice={selectedPrice}
                  percentChange={percentChange}
                  setPercentChange={setPercentChange}
                  onDataUpdate={({ currentValue }) => {
                    setCurrentValue(currentValue);
                  }}
                />
              )}

              <span className='absolute bottom-20 left-7 flex flex-row text-white/15 select-none pointer-events-none'>
                <ChartSpline className='mr-1 size-5' /> Gift Charts
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
