"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  ColorType,
  UTCTimestamp,
  AreaSeries,
  LineType,
} from "lightweight-charts";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useQueries, useQuery } from "react-query";
import axios from "axios";
import useVibrate from "@/hooks/useVibrate";
import GiftLifeDataInterface from "@/interfaces/GiftLifeDataInterface";
import GiftWeekDataInterface from "@/interfaces/GiftWeekDataInterface";
import ModalBase from "@/utils/ui/ModalBase";
import Image from "next/image";
import { X, Search } from "lucide-react";
import FilterGiftItem from "@/components/filterGifts/FilterGiftItem";
import GiftInterface from "@/interfaces/GiftInterface";

interface MinimalGift {
  _id: string;
  name: string;
  image: string;
}

interface ExtendedMinimalGift extends MinimalGift {
  supply?: number;
  initSupply?: number;
  upgradedSupply?: number;
  releaseDate?: string;
  starsPrice?: number;
  upgradePrice?: number;
  initTonPrice?: number;
  initUsdPrice?: number;
  tonPrice24hAgo?: number;
  usdPrice24hAgo?: number;
  tonPriceWeekAgo?: number;
  usdPriceWeekAgo?: number;
  tonPriceMonthAgo?: number;
  usdPriceMonthAgo?: number;
  priceTon?: number;
  priceUsd?: number;
  staked?: boolean;
  preSale?: boolean;
}

interface CompareChartsProps {
  giftNames?: string[];
}

const COLORS = [
  {
    line: "#2962FF",
    top: "rgba(41, 98, 255, 0.3)",
    bottom: "rgba(41, 98, 255, 0)",
  },
  {
    line: "#ef5350",
    top: "rgba(239, 83, 80, 0.3)",
    bottom: "rgba(239, 83, 80, 0)",
  },
  {
    line: "#26a69a",
    top: "rgba(38, 166, 154, 0.3)",
    bottom: "rgba(38, 166, 154, 0)",
  },
];

const TIME_RANGES = [
  { key: "all", label: (t: any) => t("all"), requiresLifeData: true },
  { key: "3m", label: (t: any) => `3${t("month")}`, requiresLifeData: true },
  { key: "1m", label: (t: any) => `1${t("month")}`, requiresLifeData: true },
  { key: "1w", label: (t: any) => `1${t("week")}` },
  { key: "24h", label: (t: any) => `24${t("hour")}` },
] as const;

const fetchGiftDataset = async (name: string) => {
  const [weekRes, lifeRes] = await Promise.all([
    axios.get<GiftWeekDataInterface[]>(
      `${process.env.NEXT_PUBLIC_API}/weekChart`,
      { params: { name } },
    ),
    axios.get<GiftLifeDataInterface[]>(
      `${process.env.NEXT_PUBLIC_API}/lifeChart`,
      { params: { name } },
    ),
  ]);
  return { name, week: weekRes.data, life: lifeRes.data };
};

export default function CompareCharts({ giftNames = [] }: CompareChartsProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRefs = useRef<ISeriesApi<"Area">[]>([]);

  const [listType, setListType] =
    useState<(typeof TIME_RANGES)[number]["key"]>("24h");
  const [selectedGifts, setSelectedGifts] = useState<MinimalGift[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [localSelection, setLocalSelection] = useState<MinimalGift[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<"ton" | "usd">("ton");

  const { resolvedTheme } = useTheme();
  const vibrate = useVibrate();
  const translateTime = useTranslations("timegap");
  const translate = useTranslations("compare");
  const translateGeneral = useTranslations("general");

  // Sync local state when modal opens
  useEffect(() => {
    console.log("Modal state changed:", { isModalOpen });
    if (isModalOpen) {
      setLocalSelection(selectedGifts);
    }
  }, [isModalOpen, selectedGifts]);

  // Fetch all gifts for the modal
  const { data: allGiftsMinimal } = useQuery(
    ["giftsMinimal"],
    async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/gifts/minimal`,
      );
      return res.data;
    },
    {
      staleTime: 1000 * 60 * 30, // Cache for 30 minutes since gift lists rarely change
      refetchOnWindowFocus: false,
    },
  );

  const results = useQueries(
    selectedGifts.slice(0, 3).map((gift) => ({
      queryKey: ["compare-gifts", gift.name],
      queryFn: () => fetchGiftDataset(gift.name),
      staleTime: 1000 * 60 * 5,
    })),
  );

  // Initialize Chart
  useEffect(() => {
    console.log("Chart initialization effect triggered:", {
      hasContainer: !!chartContainerRef.current,
      selectedGiftsCount: selectedGifts.length,
      isLoading: results.some((r) => r.isLoading),
      shouldInitialize: selectedGifts.length > 0 && !results.some((r) => r.isLoading),
    });

    if (!chartContainerRef.current || selectedGifts.length === 0 || results.some((r) => r.isLoading)) {
      console.log("Chart not initialized:", {
        hasContainer: !!chartContainerRef.current,
        selectedGiftsCount: selectedGifts.length,
        isLoading: results.some((r) => r.isLoading),
      });
      return;
    }

    console.log(
      "Initializing chart with gifts:",
      selectedGifts.map((g) => g.name),
    );

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.6)"
            : "rgba(0, 0, 0, 0.6)",
        attributionLogo: false,
        fontSize: 11,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: {
          color:
            resolvedTheme === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "rgba(0, 0, 0, 0.05)",
        },
      },
      rightPriceScale: {
        borderVisible: true, // This adds the line at the right side before the numbers
        borderColor:
          resolvedTheme === "dark"
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)",
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
      height: window.innerWidth < 1080 ? 300 : 450,
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chartRef.current.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        } catch (error) {
          console.warn("Chart resize failed:", error);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          console.warn("Chart removal failed:", error);
        }
        chartRef.current = null;
      }
    };
  }, [resolvedTheme, selectedGifts.length > 0, results.some((r) => r.isLoading)]);

  // Update Series Data when results or listType changes
  useEffect(() => {
    if (!chartRef.current || selectedGifts.length === 0) {
      console.log("Series data not updated:", {
        hasChart: !!chartRef.current,
        selectedGiftsCount: selectedGifts.length,
      });
      return;
    }

    // 2. Safely Clear existing series
    if (seriesRefs.current.length > 0) {
      seriesRefs.current.forEach((s) => {
        // Check if series (s) is defined and valid before removing
        if (s && chartRef.current) {
          try {
            chartRef.current.removeSeries(s);
          } catch (e) {
            console.warn("Series already removed or invalid", e);
          }
        }
      });
      seriesRefs.current = [];
    }

    // 3. If still loading, wait
    if (results.some((r) => r.isLoading)) {
      console.log("Still loading data...");
      return;
    }

    console.log(
      "Results data:",
      results.map((r) => ({
        name: r.data?.name,
        isLoading: r.isLoading,
        hasData: !!r.data,
      })),
    );

    results.forEach((query, index) => {
      if (!query.data || !chartRef.current) return;

      try {
        const series = chartRef.current.addSeries(AreaSeries, {
          lineColor: COLORS[index].line,
          topColor: COLORS[index].top,
          bottomColor: COLORS[index].bottom,
          lineWidth: 2,
          lineType: LineType.Simple,
          lastValueVisible: true, // Label in the sidebar
          priceLineVisible: true,
        });

        // Filtering logic based on your LineChart component
        const { week, life } = query.data;
        let filteredList: (GiftWeekDataInterface | GiftLifeDataInterface)[] = [];

        if (["24h", "1w"].includes(listType)) {
          filteredList = listType === "24h" ? week.slice(-48) : week;
        } else {
          const slices = { "1m": -30, "3m": -90, all: 0 };
          filteredList =
            slices[listType as keyof typeof slices] === 0
              ? life
              : life.slice(slices[listType as keyof typeof slices]);
        }

        const formattedData = filteredList
          .map((item) => {
            const dateParts = item.date.split("-");
            const day = parseInt(dateParts[0], 10);
            const month = parseInt(dateParts[1], 10) - 1;
            const year = parseInt(dateParts[2], 10);

            let hours = 0,
              minutes = 0;
            if ("time" in item && item.time) {
              const [h, m] = item.time.split(":").map(Number);
              hours = h;
              minutes = m;
            }

            const timestamp = Math.floor(
              new Date(year, month, day, hours, minutes).getTime() / 1000,
            );
            return { 
              time: timestamp as UTCTimestamp, 
              value: selectedPrice === "ton" ? item.priceTon : item.priceUsd 
            };
          })
          .filter((d) => !isNaN(d.time))
          .sort((a, b) => (a.time as number) - (b.time as number))
          .filter((item, i, self) => i === 0 || item.time !== self[i - 1].time);

        series.setData(formattedData);
        seriesRefs.current.push(series);
      } catch (error) {
        console.warn("Failed to create series for", query.data?.name, error);
      }
    });

    if (chartRef.current) {
      try {
        chartRef.current.timeScale().fitContent();
      } catch (error) {
        console.warn("Failed to fit content:", error);
      }
    }
  }, [results, listType, selectedGifts, selectedPrice]);

  const handleGiftSelect = (gift: GiftInterface) => {
    if (
      localSelection.length < 3 &&
      !localSelection.find((g) => g._id === gift._id)
    ) {
      setLocalSelection([
        ...localSelection,
        { _id: gift._id, name: gift.name, image: gift.image },
      ]);
      vibrate();
    }
  };

  const handleRemoveGift = (giftId: string) => {
    setLocalSelection(localSelection.filter((g) => g._id !== giftId));
    vibrate();
  };

  const handleRemoveSelectedGift = (giftId: string) => {
    setSelectedGifts(selectedGifts.filter((g) => g._id !== giftId));
    vibrate();
  };

  const clearSelection = () => {
    vibrate();
    setLocalSelection([]);
  };

  const applySelection = () => {
    console.log("applySelection called:", {
      localSelectionCount: localSelection.length,
      localSelection: localSelection.map(g => g.name),
    });
    
    vibrate();
    setSelectedGifts(localSelection);
    console.log("Setting modal open to false");
    setIsModalOpen(false);
  };

  const cancelSelection = () => {
    vibrate();
    setIsModalOpen(false);
  };

  const clearSearch = () => setSearchTerm("");

  const filteredGifts =
    allGiftsMinimal?.filter((gift: MinimalGift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase()),
    ).sort((a: MinimalGift, b: MinimalGift) => {
      // Selected gifts come first
      const aSelected = localSelection.find(g => g._id === a._id);
      const bSelected = localSelection.find(g => g._id === b._id);
      
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Both selected or both not selected - maintain original order
      return 0;
    }) || [];

  return (
    <div className='w-full'>
      {/* Header with Add Gift button */}
      <div className='flex justify-between items-center mb-5'>
        {selectedGifts.length < 3 && (
          <ModalBase
            trigger={
              <button className='w-full p-3 rounded-3xl bg-secondaryTransparent flex flex-row items-center justify-center gap-2'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-4'>
                  <path
                    fillRule='evenodd'
                    d='M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z'
                    clipRule='evenodd'
                  />
                </svg>

                {translate("addGift")}
              </button>
            }
            open={isModalOpen}
            onOpenChange={(open) => {
              console.log("ModalBase onOpenChange called with:", open);
              setIsModalOpen(open);
            }}>
            <div className='flex-1 overflow-hidden flex flex-col'>
              {/* HEADER */}
              <div className='w-full h-12 pb-3 flex justify-between items-center'>
                <div className='w-1/3'>
                  <button
                    onClick={clearSelection}
                    className={`flex items-center justify-center gap-x-1 h-8 px-3 bg-secondaryTransparent rounded-3xl transition-opacity ${
                      localSelection.length === 0 ? "opacity-50" : ""
                    }`}>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-5'>
                      <path
                        fillRule='evenodd'
                        d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z'
                        clipRule='evenodd'
                      />
                    </svg>
                    {translate("clear")}
                  </button>
                </div>

                <div className='w-1/3 text-center'>
                  <span
                    className={`text-sm font-medium ${localSelection.length > 0 ? "text-primary" : "text-secondaryText"}`}>
                    {localSelection.length} {translate("selected")}
                  </span>
                </div>

                <div className='w-1/3 flex justify-end'>
                  <button
                    onClick={cancelSelection}
                    className='p-2 bg-secondaryTransparent rounded-full'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 24 24'
                      fill='currentColor'
                      className='size-5'>
                      <path
                        fillRule='evenodd'
                        d='M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* SEARCH AND LIST */}
              <div className='flex-1 overflow-y-auto'>
                <div className='relative w-full my-2'>
                  <input
                    type='text'
                    placeholder={translateGeneral("searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='w-full h-12 pl-10 pr-10 bg-secondaryTransparent rounded-3xl text-foreground placeholder:text-secondaryText focus:outline-none'
                  />
                  <Search
                    className='absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none'
                    size={18}
                  />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText'>
                      <X size={16} />
                    </button>
                  )}
                </div>
                {filteredGifts.length > 0 ? (
                  filteredGifts.map((gift: MinimalGift) => {
                    const isSelected = localSelection.find(
                      (g) => g._id === gift._id,
                    );
                    const isDisabled = isSelected || localSelection.length >= 3;

                    // Convert MinimalGift to GiftInterface for FilterGiftItem
                    const giftForItem: GiftInterface = {
                      _id: gift._id,
                      name: gift.name,
                      image: gift.image,
                      supply: 0,
                      initSupply: 0,
                      upgradedSupply: 0,
                      releaseDate: "",
                      starsPrice: 0,
                      upgradePrice: 0,
                      initTonPrice: 0,
                      initUsdPrice: 0,
                      priceTon: 0,
                      priceUsd: 0,
                    };

                    return (
                      <div
                        key={gift._id}
                        className={
                          isDisabled && !isSelected ? "opacity-50" : ""
                        }>
                        <FilterGiftItem
                          gift={giftForItem}
                          selected={!!isSelected}
                          onClick={() => {
                            if (isSelected) {
                              // Remove from selection if already selected
                              handleRemoveGift(gift._id);
                            } else if (!isDisabled) {
                              // Add to selection if not selected and not at limit
                              handleGiftSelect(giftForItem);
                            }
                          }}
                        />
                      </div>
                    );
                  })
                ) : (
                  <div className='text-center py-8 text-secondaryText'>
                    No gifts matching "{searchTerm}"
                  </div>
                )}
                <div className='h-20' /> {/* Spacer for the button */}
              </div>
              <div className='absolute flex flex-row justify-between items-center gap-3 bottom-0 left-0 w-full lg:px-6 px-3 pt-3 pb-12 bg-secondaryLight backdrop-blur-lg rounded-3xl'>
                <button
                  onClick={cancelSelection}
                  className='w-full h-10 bg-secondary text-foreground font-bold rounded-3xl'>
                  {translateGeneral("close")}
                </button>
                <button
                  onClick={applySelection}
                  className='w-full h-10 bg-primary text-white font-bold rounded-3xl'>
                  {translateGeneral("save")}
                </button>
              </div>
            </div>
          </ModalBase>
        )}
      </div>

      {/* Selected gifts display */}
      {selectedGifts.length > 0 && (
        <div className='flex gap-2 mb-4 flex-wrap'>
          {selectedGifts.map((gift, index) => (
            <div
              key={gift._id}
              className='flex items-center gap-2 px-3 py-2 rounded-full '
              style={{
                backgroundColor: `${COLORS[index].top}`,
              }}>
              <Image
                src={`/gifts/${gift.image}.webp`}
                alt={gift.name}
                width={24}
                height={24}
                className='w-6 h-6'
              />
              <span className='text-sm font-medium'>{gift.name}</span>
              <button
                onClick={() => handleRemoveSelectedGift(gift._id)}
                className='p-1 rounded-full hover:bg-black/10 transition-colors'>
                <X className='w-3 h-3' />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Price selector - only show when gifts are selected */}
      {selectedGifts.length > 0 && (
        <div className='mb-2'>
          <div className='w-fit flex flex-row box-border bg-secondary rounded-3xl gap-x-1'>
            <button
              className={`text-sm h-8 px-3 box-border ${
                selectedPrice === "ton"
                  ? "rounded-3xl bg-primary font-bold"
                  : ""
              }`}
              onClick={() => {
                setSelectedPrice("ton");
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
                selectedPrice === "usd"
                  ? "rounded-3xl bg-primary font-bold"
                  : ""
              }`}
              onClick={() => {
                setSelectedPrice("usd");
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
      )}

      {/* No gifts selected message */}
      {selectedGifts.length === 0 && (
        <div className='text-center py-12'>
          <div className='text-secondaryText mb-4'>
            {translate("chooseAtLeastTwo")}
          </div>
        </div>
      )}

      {/* Chart - visible when at least 1 gift is selected */}
      {selectedGifts.length > 0 && (
        <div
          className={`relative w-full ${
            resolvedTheme === "dark"
              ? ""
              : "p-3 bg-secondaryTransparent rounded-3xl"
          }`}>
          {/* Loading skeleton while data is loading */}
          {results.some((r) => r.isLoading) ? (
            <div className='flex justify-center items-center w-full h-[300px] relative overflow-hidden'>
              {/* The 3-Wave Line */}
              <svg
                className=' w-full px-5 h-full'
                viewBox='0 0 1200 120'
                preserveAspectRatio='none'>
                <path
                  d='M0,60 
         C100,120 100,0 200,60 
         C300,120 300,0 400,60 
         C500,120 500,0 600,60'
                  transform='scale(2, 1)'
                  fill='transparent'
                  className='stroke-current text-secondaryTransparent'
                  strokeWidth='2'
                  strokeLinecap='round'
                />
              </svg>
            </div>
          ) : (
            <div ref={chartContainerRef} className='w-full' />
          )}

          <div className='w-full mt-2'>
            {/* Time range selector */}
            <div className='w-full flex flex-row overflow-x-scroll scrollbar-hide bg-secondaryTransparent rounded-3xl'>
              {TIME_RANGES.map(({ key, label }) => {
                const isActive = listType === key;
                return (
                  <button
                    key={key}
                    className={`w-full px-3 h-10 text-xs text-nowrap transition-colors rounded-3xl ${
                      isActive ? "bg-secondary font-bold" : "text-secondaryText"
                    }`}
                    onClick={() => {
                      setListType(key);
                      vibrate();
                    }}>
                    {label(translateTime)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
