"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import FilterGiftsModal from "../filterGifts/FilterGiftsModal";
import SortGiftsModal from "../filterGifts/SortGiftsModal";
import InfoMessage from "../generalHints/InfoMessage";
import { useRouter } from "@/i18n/navigation";
import ListHandler from "../mainPage/ListHandler";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import useVibrate from "@/hooks/useVibrate";
import ListSkeleton from "./ListSkeleton";
import { GiftSorter, SortKey } from "../filterGifts/GiftSorter";
import { useTranslations } from "next-intl";
import { setFilters } from "@/redux/slices/filterListSlice";

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedList, setSelectedList] = useState<"all" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const clearFilterRef = useRef<(() => void) | null>(null);
  const clearSortRef = useRef<(() => void) | null>(null);

  const router = useRouter();
  const vibrate = useVibrate();

  const translate = useTranslations("mainPage");
  const translateGeneral = useTranslations("general");

  // Settings from localStorage
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

  // Map UI sort option → actual sort key + order
  const getSortConfig = (): { key: SortKey; order: "asc" | "desc" } => {
    switch (filters.sort) {
      case "highFirst":
        return { key: "priceUsd", order: "desc" };
      case "lowFirst":
        return { key: "priceUsd", order: "asc" };
      case "newest":
        return { key: "releaseDate", order: "desc" };
      case "oldest":
        return { key: "releaseDate", order: "asc" };
      case "atoz":
        return { key: "name", order: "asc" };
      case "ztoa":
        return { key: "name", order: "desc" };

      // Supply
      case "supplyHigh":
        return { key: "supply", order: "desc" };
      case "supplyLow":
        return { key: "supply", order: "asc" };
      case "initSupplyHigh":
        return { key: "initSupply", order: "desc" };
      case "initSupplyLow":
        return { key: "initSupply", order: "asc" };
      case "upgradedSupplyHigh":
        return { key: "upgradedSupply", order: "desc" };
      case "upgradedSupplyLow":
        return { key: "upgradedSupply", order: "asc" };

      // NEW: 24h Change (Growth) — best gain first by default
      case "changeGrowth":
        return { key: "priceChangeGrowth", order: "desc" }; // +150% → -80%
      case "changeGrowthAsc":
        return { key: "priceChangeGrowth", order: "asc" }; // biggest losers first

      // NEW: Biggest Movers (Absolute Change) — biggest swing first
      case "changeAbsolute":
        return { key: "priceChangeAbsolute", order: "desc" }; // ±150% first
      case "changeAbsoluteAsc":
        return { key: "priceChangeAbsolute", order: "asc" }; // smallest movement first

      // Optional TON versions
      case "changeGrowthTon":
        return { key: "priceChangeGrowthTon", order: "desc" };
      case "changeAbsoluteTon":
        return { key: "priceChangeAbsoluteTon", order: "desc" };

      default:
        return { key: "priceUsd", order: "desc" };
    }
  };

  // Compute the final list ONCE per change — no stale state!
  const displayedGifts = useMemo(() => {
    if (!giftsList.length) return [];

    let result = [...giftsList];

    // 1. Saved tab
    if (selectedList === "saved" && user?.savedList?.length) {
      result = result.filter((g) => user.savedList.includes(g._id));
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((g) => g.name?.toLowerCase().includes(q));
    }

    // 3. Filter modal – chosen gifts (from Redux)
    if (filters.chosenGifts.length > 0) {
      result = result.filter((g) => filters.chosenGifts.includes(g._id));
    }

    // 4. Sorting
    const { key, order } = getSortConfig();
    const sorter = new GiftSorter(result);
    result = sorter.sortBy(key, order);

    return result;
  }, [
    giftsList,
    selectedList,
    searchQuery,
    user?.savedList,
    filters.sort,
    filters.chosenGifts,
  ]);

  // Mount effect
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sticky header sentinel
  // Sticky header sentinel — FIXED
  useEffect(() => {
    if (!isMounted) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMounted]);

  const clearSearch = () => setSearchQuery("");

  if (!isMounted) return null;

  const hasActiveFilter = displayedGifts.length < giftsList.length;

  return (
    <div className='w-full flex flex-col items-center'>
      {giftsList ? (
        <>
          <div ref={sentinelRef} />
          {/* Search + Sort/Filter bar */}
          <div
            className={`w-full sticky px-3 top-0 z-30 bg-background transition-all duration-300 ${
              isSticky
                ? user.username === "_guest"
                  ? "pt-5"
                  : "pt-[105px] lg:pt-5"
                : "pt-0"
            }`}>
            <div className='flex gap-1 mb-2'>
              {/* Search */}
              <div className='relative flex-1'>
                <input
                  type='text'
                  placeholder={translate("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='w-full h-12 pl-10 bg-secondaryTransparent text-foreground px-3 rounded-3xl focus:outline-none focus:bg-secondaryTransparent  placeholder:text-secondaryText placeholder:text-sm '
                />
                <Search
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText'
                  size={18}
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText hover:text-foreground'>
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Sort & Filter Buttons */}
              <div className='flex gap-1'>
                {/* Sort Button with active dot */}
                <div className='relative'>
                  <SortGiftsModal
                    trigger={
                      <button
                        onClick={() => vibrate()}
                        className='h-12 w-12 flex items-center justify-center bg-secondaryTransparent rounded-3xl'>
                        <svg
                          className='size-4'
                          viewBox='0 0 24 24'
                          fill='currentColor'>
                          <path
                            fillRule='evenodd'
                            d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    }
                  />
                  {/* Active dot when sort is not default */}
                  {filters.sort !== "highFirst" && (
                    <div className='absolute top-[7px] right-[7px] w-2 h-2 bg-primary rounded-full' />
                  )}
                </div>

                <div className='relative'>
                  <FilterGiftsModal
                    trigger={
                      <button
                        onClick={() => vibrate()}
                        className='h-12 w-12 flex items-center justify-center bg-secondaryTransparent rounded-3xl'>
                        <svg
                          className='size-4'
                          viewBox='0 0 24 24'
                          fill='currentColor'>
                          <path
                            fillRule='evenodd'
                            d='M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </button>
                    }
                    giftsList={giftsList}
                  />
                  {hasActiveFilter && (
                    <div className='absolute top-[7px] right-[7px] w-2 h-2 bg-primary rounded-full' />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* <div className='w-full border-b border-secondaryTransparent pb-3 px-3  mt-2 overflow-scroll scrollbar-hide flex flex-row items-center justify-between text-nowrap text-sm text-secondaryText'>
            <div className='flex flex-row gap-x-2'>
              <button
                onClick={() => {
                  vibrate();
                  setSelectedList("all");
                }}
                className={` ${
                  selectedList === "all"
                    ? "bg-primary text-white"
                    : "bg-secondaryTransparent"
                } transition-colors ease-in-out duration-300 px-3 py-2 rounded-3xl flex flex-row items-center gap-x-1`}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='size-4'>
                  <path
                    fillRule='evenodd'
                    d='M14 6a2.5 2.5 0 0 0-4-3 2.5 2.5 0 0 0-4 3H3.25C2.56 6 2 6.56 2 7.25v.5C2 8.44 2.56 9 3.25 9h6V6h1.5v3h6C17.44 9 18 8.44 18 7.75v-.5C18 6.56 17.44 6 16.75 6H14Zm-1-1.5a1 1 0 0 1-1 1h-1v-1a1 1 0 1 1 2 0Zm-6 0a1 1 0 0 0 1 1h1v-1a1 1 0 0 0-2 0Z'
                    clipRule='evenodd'
                  />
                  <path d='M9.25 10.5H3v4.75A2.75 2.75 0 0 0 5.75 18h3.5v-7.5ZM10.75 18v-7.5H17v4.75A2.75 2.75 0 0 1 14.25 18h-3.5Z' />
                </svg>
                {translate("allGifts")}
              </button>
              <button
                onClick={() => {
                  vibrate();
                  setSelectedList("saved");
                }}
                className={` ${
                  selectedList === "saved"
                    ? "bg-primary text-white"
                    : "bg-secondaryTransparent"
                } transition-colors ease-in-out duration-300 px-3 py-2 rounded-3xl flex flex-row items-center gap-x-1`}>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  className='size-4'>
                  <path
                    fillRule='evenodd'
                    d='M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z'
                    clipRule='evenodd'
                  />
                </svg>
                {translate("saved")}
              </button>
            </div>
            <div className='flex flex-row'>
              <button
                className={`py-2 px-3 bg-secondaryTransparent rounded-3xl ml-3 ${
                  hasActiveFilter || filters.sort !== "highFirst"
                    ? "text-primary"
                    : "text-secondaryText opacity-50"
                }`}
                onClick={() => {
                  dispatch(
                    setFilters({
                      ...filters,
                      sort: "highFirst",
                      chosenGifts: [],
                    })
                  );
                  clearSearch();
                }}>
                {translateGeneral("clear")}
              </button>
            </div>
          </div> */}

          {/* List Content */}
          <div className='w-full pt-2'>
            <ScrollToTopButton />

            {giftsList.length === 0 && selectedList === "all" ? (
              <ListSkeleton
                type={giftType}
                count={giftType === "line" ? 15 : 20}
                hideHeader={false}
              />
            ) : selectedList === "saved" &&
              (!user?.savedList || user.savedList.length === 0) ? (
              <InfoMessage
                text="You don't have any gifts saved"
                buttonText='Add gifts to saved'
                onClick={() => router.push("/settings/edit-watchlist")}
              />
            ) : displayedGifts.length > 0 ? (
              <ListHandler
                giftsList={displayedGifts}
                type={giftType}
                background={giftBackground}
                currency={currency}
              />
            ) : (
              <InfoMessage
                text={`No gifts matching "${searchQuery}"`}
                buttonText='Clear search'
                onClick={clearSearch}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
