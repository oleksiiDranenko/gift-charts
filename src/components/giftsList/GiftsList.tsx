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
import { useTheme } from "next-themes";

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedList, setSelectedList] = useState<
    "all" | "saved" | "gainers" | "losers"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { resolvedTheme } = useTheme();

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

  useEffect(() => {
    switch (selectedList) {
      case "all":
        dispatch(
          setFilters({ ...filters, sort: "highFirst", chosenGifts: [] })
        );
        return;
      case "saved":
        dispatch(
          setFilters({
            ...filters,
            sort: "highFirst",
            chosenGifts: user.savedList,
          })
        );
        return;
      case "gainers":
        dispatch(
          setFilters({
            ...filters,
            sort: currency === "ton" ? "changeGrowth" : "changeGrowthTon",
            chosenGifts: [],
          })
        );
        return;
      case "losers":
        dispatch(
          setFilters({
            ...filters,
            sort: currency === "ton" ? "changeGrowthTonAsc" : "changeGrowthAsc",
            chosenGifts: [],
          })
        );
        return;
    }
  }, [selectedList]);

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
      case "changeGrowthTonAsc":
        return { key: "priceChangeGrowthTon", order: "asc" };

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
          <div className='w-full mb-3 px-3 overflow-scroll scrollbar-hide flex flex-row items-center justify-start text-nowrap '>
            <button
              className={`flex flex-row items-center justify-center gap-x-1 px-3 h-10 ${
                selectedList === "all"
                  ? "border-b border-foreground"
                  : "border-b border-secondaryTransparent text-secondaryText"
              }`}
              onClick={() => {
                vibrate();
                setSelectedList("all");
                // dispatch(
                //   setFilters({ ...filters, sort: "highFirst", chosenGifts: [] })
                // );
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-5 text-primary mr-1'>
                <path d='M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z' />
              </svg>
              {translate("allGifts")}
            </button>
            <button
              className={`flex flex-row items-center justify-center gap-x-1 px-3 h-10 ${
                selectedList === "saved"
                  ? "border-b border-foreground"
                  : "border-b border-secondaryTransparent text-secondaryText"
              }`}
              onClick={() => {
                vibrate();
                setSelectedList("saved");
                // dispatch(
                //   setFilters({
                //     ...filters,
                //     sort: "highFirst",
                //     chosenGifts: user.savedList,
                //   })
                // );
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='currentColor'
                className='size-5 text-primary mr-1'>
                <path
                  fillRule='evenodd'
                  d='M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z'
                  clipRule='evenodd'
                />
              </svg>
              {translate("saved")}
            </button>
            <button
              className={`flex flex-row items-center justify-center gap-x-1 px-3 h-10 ${
                selectedList === "gainers"
                  ? "border-b border-foreground"
                  : "border-b border-secondaryTransparent text-secondaryText"
              }`}
              onClick={() => {
                vibrate();
                setSelectedList("gainers");
                // dispatch(
                //   setFilters({
                //     ...filters,
                //     sort:
                //       currency === "ton" ? "changeGrowth" : "changeGrowthTon",
                //     chosenGifts: [],
                //   })
                // );
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='size-5 text-primary mr-1'>
                <path
                  fillRule='evenodd'
                  d='M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z'
                  clipRule='evenodd'
                />
              </svg>

              {translate("gainers")}
            </button>
            <button
              className={`flex flex-row items-center justify-center gap-x-1 px-3 h-10 ${
                selectedList === "losers"
                  ? "border-b border-foreground"
                  : "border-b border-secondaryTransparent text-secondaryText"
              }`}
              onClick={() => {
                vibrate();
                setSelectedList("losers");
                // dispatch(
                //   setFilters({
                //     ...filters,
                //     sort:
                //       currency === "ton"
                //         ? "changeGrowthTonAsc"
                //         : "changeGrowthAsc",
                //     chosenGifts: [],
                //   })
                // );
              }}>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='size-5 text-primary mr-1'>
                <path
                  fillRule='evenodd'
                  d='M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-6.024L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z'
                  clipRule='evenodd'
                />
              </svg>

              {translate("losers")}
            </button>
          </div>
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
                  onFocus={() => {
                    vibrate();
                  }}
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
          {/* List Content */}
          <div className={`w-full ${resolvedTheme === "dark" ? "" : "pt-1"}`}>
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
