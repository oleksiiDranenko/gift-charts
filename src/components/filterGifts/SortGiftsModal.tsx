"use client";

import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFilters } from "@/redux/slices/filterListSlice";
import SectionTransition from "./SelectTransition";
import { useTranslations } from "next-intl";
import { ChevronIcon, OptionButton } from "./ModalReusable";
import ModalBase from "@/utils/ui/ModalBase";

interface Props {
  trigger: ReactNode;
}

const SORT_LABELS = [
  "price",
  "growth",
  "volatility",
  "supply",
  "initSupply",
  "upgradedSupply",
  // "releaseDate",
  "alphabet",
] as const;

const HIGH_FIRST_SORTS = [
  // Price
  "highFirst",
  // Date
  "newest",
  // Alphabet
  "ztoa", // Z → A = по убыванию = High first
  // Supply
  "supplyHigh",
  "initSupplyHigh",
  "upgradedSupplyHigh",
  // 24h Change
  "changeGrowth",
  "changeGrowthTon",
  "changeAbsolute",
  "changeAbsoluteTon",
] as const;

type SortLabel = (typeof SORT_LABELS)[number];

export default function SortGiftsModal({ trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<
    "sort" | "order" | "priceRange" | null
  >(null);

  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);
  const t = useTranslations("filters");
  const vibrate = useVibrate();

  // Get user currency safely (client-side only)
  const userCurrency =
    typeof window !== "undefined"
      ? (() => {
          try {
            const saved = localStorage.getItem("settings");
            return saved ? JSON.parse(saved).currency || "ton" : "ton";
          } catch {
            return "ton";
          }
        })()
      : "ton";

  const isTon = userCurrency === "ton";

  // Current selected sort label
  const getCurrentLabel = (): SortLabel => {
    if (filters.sort.includes("changeGrowth")) return "growth";
    if (filters.sort.includes("changeAbsolute")) return "volatility";

    switch (filters.sort) {
      case "highFirst":
      case "lowFirst":
        return "price";
      case "supplyHigh":
      case "supplyLow":
        return "supply";
      case "initSupplyHigh":
      case "initSupplyLow":
        return "initSupply";
      case "upgradedSupplyHigh":
      case "upgradedSupplyLow":
        return "upgradedSupply";
      // case "newest":
      // case "oldest":
      //   return "releaseDate";
      case "atoz":
      case "ztoa":
        return "alphabet";
      default:
        return "price";
    }
  };

  const currentLabel = getCurrentLabel();
  const isHighFirst = HIGH_FIRST_SORTS.includes(filters.sort as any);

  const orderText = isHighFirst ? t("highFirst") : t("lowFirst");

  // Map label + order → final sort value
  const getSortValue = (label: SortLabel, highFirst: boolean): any => {
    switch (label) {
      case "price":
        return highFirst ? "highFirst" : "lowFirst";
      case "growth":
        return highFirst
          ? isTon
            ? "changeGrowthTon"
            : "changeGrowth"
          : isTon
          ? "changeGrowthTonAsc"
          : "changeGrowthAsc";
      case "volatility":
        return highFirst
          ? isTon
            ? "changeAbsoluteTon"
            : "changeAbsolute"
          : isTon
          ? "changeAbsoluteTonAsc"
          : "changeAbsoluteAsc";
      case "supply":
        return highFirst ? "supplyHigh" : "supplyLow";
      case "initSupply":
        return highFirst ? "initSupplyHigh" : "initSupplyLow";
      case "upgradedSupply":
        return highFirst ? "upgradedSupplyHigh" : "upgradedSupplyLow";
      // case "releaseDate":
      //   return highFirst ? "newest" : "oldest";
      case "alphabet":
        return highFirst ? "ztoa" : "atoz";
      default:
        return "highFirst";
    }
  };

  const handleSortSelect = (label: SortLabel) => {
    vibrate();
    const newSort = getSortValue(label, isHighFirst);
    dispatch(setFilters({ ...filters, sort: newSort }));
    setOpenSection(null);
  };

  const handleOrderToggle = () => {
    vibrate();
    const newSort = getSortValue(currentLabel, !isHighFirst);
    dispatch(setFilters({ ...filters, sort: newSort }));
  };

  const resetAll = () => {
    vibrate();
    dispatch(setFilters({ ...filters, sort: "highFirst" }));
  };

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
    setOpenSection(null);
  };

  return (
    <>
      <ModalBase trigger={trigger} open={isOpen} onOpenChange={setIsOpen}>
        {/* HEADER */}
        <div className='w-full h-10 pb-3 flex justify-between items-center'>
          <button
            onClick={resetAll}
            className={`flex flex-row items-center justify-center gap-x-1 h-8 px-3 bg-secondaryTransparent rounded-3xl transition-opacity ${
              filters.sort === "highFirst" ? "opacity-50" : "opacity-100"
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
            {t("reset")}
          </button>

          <button
            onClick={closeModal}
            className='w-fit p-2 bg-secondaryTransparent rounded-full'>
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

        {/* BODY */}
        <div className='flex-1 overflow-y-auto flex flex-col gap-3 pt-2'>
          <h1 className='flex flex-row items-center gap-x-1 text-xl mt-1 font-bold pl-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='currentColor'
              className='size-5 text-primary'>
              <path
                fillRule='evenodd'
                d='M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z'
                clipRule='evenodd'
              />
            </svg>
            Presets:
          </h1>
          <div className='w-full pb-2 overflow-scroll scrollbar-hide flex flex-row items-center justify-start text-nowrap text-sm gap-x-1'>
            <button className='flex flex-row items-center justify-center gap-x-1 px-3 h-10 bg-secondaryTransparent text-secondaryText rounded-3xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4'>
                <path
                  fillRule='evenodd'
                  d='M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z'
                  clipRule='evenodd'
                />
              </svg>
              Hot
            </button>
            <button className='flex flex-row items-center justify-center gap-x-1 px-3 h-10 bg-secondaryTransparent text-secondaryText rounded-3xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4'>
                <path
                  fillRule='evenodd'
                  d='M8.25 3.75H19.5a.75.75 0 0 1 .75.75v11.25a.75.75 0 0 1-1.5 0V6.31L5.03 20.03a.75.75 0 0 1-1.06-1.06L17.69 5.25H8.25a.75.75 0 0 1 0-1.5Z'
                  clipRule='evenodd'
                />
              </svg>
              Gainers
            </button>
            <button className='flex flex-row items-center justify-center gap-x-1 px-3 h-10 bg-secondaryTransparent text-secondaryText rounded-3xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4'>
                <path
                  fillRule='evenodd'
                  d='M3.97 3.97a.75.75 0 0 1 1.06 0l13.72 13.72V8.25a.75.75 0 0 1 1.5 0V19.5a.75.75 0 0 1-.75.75H8.25a.75.75 0 0 1 0-1.5h9.44L3.97 5.03a.75.75 0 0 1 0-1.06Z'
                  clipRule='evenodd'
                />
              </svg>
              Loosers
            </button>
            <button className='flex flex-row items-center justify-center gap-x-1 px-3 h-10 bg-secondaryTransparent text-secondaryText rounded-3xl'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-4'>
                <path
                  fillRule='evenodd'
                  d='M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 0 0-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 0 1 3.16 5.337a45.6 45.6 0 0 1 2.006-.343v.256Zm13.5 0v-.256c.674.1 1.343.214 2.006.343a5.265 5.265 0 0 1-2.863 3.207 6.72 6.72 0 0 0 .857-3.294Z'
                  clipRule='evenodd'
                />
              </svg>
              Floor
            </button>
          </div>
          {/* Sort By Section */}
          <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
            <button
              onClick={() => {
                vibrate();
                setOpenSection(openSection === "sort" ? null : "sort");
              }}
              className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
              <div className='flex flex-row items-center gap-x-3'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-7 text-primary'>
                  <path d='M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z' />
                </svg>

                <div className='flex flex-col items-start'>
                  <span className='text-lg font-bold'>{t("sortBy")}</span>
                  <span className='text-sm text-secondaryText'>
                    {t(currentLabel)}
                  </span>
                </div>
              </div>
              <ChevronIcon open={openSection === "sort"} />
            </button>

            <SectionTransition open={openSection === "sort"}>
              <div className='flex flex-col gap-1 px-4 pb-3'>
                <div className='h-[2px] w-full bg-secondary mb-1' />
                {SORT_LABELS.map((key) => (
                  <OptionButton
                    key={key}
                    label={t(key)}
                    selected={currentLabel === key}
                    onClick={() => handleSortSelect(key)}
                  />
                ))}
              </div>
            </SectionTransition>
          </div>

          {/* Order Section */}
          <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
            <button
              onClick={() => {
                vibrate();
                setOpenSection(openSection === "order" ? null : "order");
              }}
              className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
              <div className='flex flex-row items-center gap-x-3'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 24 24'
                  fill='currentColor'
                  className='size-7 text-primary'>
                  <path
                    fillRule='evenodd'
                    d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
                    clipRule='evenodd'
                  />
                </svg>

                <div className='flex flex-col items-start'>
                  <span className='text-lg font-bold'>{t("order")}</span>
                  <span className='text-sm text-secondaryText'>
                    {orderText}
                  </span>
                </div>
              </div>
              <ChevronIcon open={openSection === "order"} />
            </button>

            <SectionTransition open={openSection === "order"}>
              <div className='flex flex-col gap-1 px-4 pb-3'>
                <div className='h-[2px] w-full bg-secondary mb-1' />
                {[t("highFirst"), t("lowFirst")].map((order) => (
                  <OptionButton
                    key={order}
                    label={order}
                    selected={orderText === order}
                    onClick={handleOrderToggle}
                  />
                ))}
              </div>
            </SectionTransition>
          </div>

          {/* <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <div className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
                      <div className='flex flex-row items-center gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='size-7 text-primary'>
                          <path d='M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z' />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Price Range</span>
                          <span className='text-sm text-secondaryText'>
                            Select a price range
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='px-5 py-3'>
                      <DoubleSlider gifts={giftsList} />
                    </div>
                  </div> */}
        </div>
      </ModalBase>
    </>
  );
}
