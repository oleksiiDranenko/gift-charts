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
          {/* <div className='w-full px-3'>
            <div className='lg:w-80 w-full relative flex mb-5'>
              <button
                onClick={() => {
                  setSelectedList("all");
                  vibrate();
                }}
                className={`w-1/2 pb-2 text-center transition ${
                  selectedList === "all"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}>
                {translate("allGifts")}
              </button>
              <button
                onClick={() => {
                  setSelectedList("saved");
                  vibrate();
                }}
                className={`w-1/2 pb-2 text-center transition ${
                  selectedList === "saved"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}>
                {translate("saved")}
              </button>
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-foreground rounded-full transition-all duration-300 ${
                  selectedList === "all" ? "w-1/2" : "translate-x-full w-1/2"
                }`}
              />
            </div>
          </div> */}
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
            <div className='flex gap-1 mb-1'>
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
                <div className='relative'>
                  <SortGiftsModal
                    trigger={
                      <button
                        onClick={() => vibrate()}
                        className='h-12 w-12 flex items-center justify-center bg-secondaryTransparent rounded-3xl'>
                        <svg
                          className='size-5'
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

          {/* <div className='w-full pb-3 px-3 overflow-scroll scrollbar-hide flex flex-row items-center justify-start text-nowrap text-sm gap-x-1'>
            <button className='flex flex-row items-center justify-center gap-x-1 px-3 h-10 bg-primary rounded-3xl'>
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
