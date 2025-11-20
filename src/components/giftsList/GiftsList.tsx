"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
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

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);

  const [isMounted, setIsMounted] = useState(false);
  const [selectedList, setSelectedList] = useState<"all" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const vibrate = useVibrate();

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

      // NEW: supply sorting
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
  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([e]) => setIsSticky(!e.isIntersecting),
      { threshold: [0] }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  const clearSearch = () => setSearchQuery("");

  if (!isMounted) return null;

  const hasActiveFilter = displayedGifts.length < giftsList.length;

  return (
    <div className='w-full flex flex-col items-center'>
      {giftsList ? (
        <>
          {/* Tabs */}
          <div className='w-full px-3'>
            <div className='relative flex mb-5'>
              <button
                onClick={() => {
                  setSelectedList("all");
                  vibrate();
                }}
                className={`w-1/2 pb-3 text-center transition ${
                  selectedList === "all"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}>
                All Gifts
              </button>
              <button
                onClick={() => {
                  setSelectedList("saved");
                  vibrate();
                }}
                className={`w-1/2 pb-3 text-center transition ${
                  selectedList === "saved"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}>
                Saved
              </button>
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-foreground rounded-full transition-all duration-300 ${
                  selectedList === "all" ? "w-1/2" : "translate-x-full w-1/2"
                }`}
              />
            </div>
          </div>

          <div ref={sentinelRef} />

          {/* Search + Sort/Filter bar */}
          {!(
            selectedList === "saved" &&
            (!user?.savedList || user.savedList.length === 0)
          ) && (
            <div
              className={`w-full sticky top-0 z-30 bg-background px-3 transition-all ${
                isSticky ? "pt-[105px] lg:pt-5" : "pt-0"
              }`}>
              <div className='flex gap-1 mb-2'>
                {/* Search */}
                <div className='relative flex-1'>
                  <input
                    type='text'
                    placeholder='Search gifts'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full h-11 pl-10 pr-10 bg-secondaryTransparent rounded-2xl text-foreground placeholder:text-secondaryText focus:outline-none'
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
                  <SortGiftsModal
                    trigger={
                      <button
                        onClick={() => vibrate()}
                        className='h-11 w-11 flex items-center justify-center bg-secondaryTransparent rounded-2xl'>
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

                  <div className='relative'>
                    <FilterGiftsModal
                      trigger={
                        <button
                          onClick={() => vibrate()}
                          className='h-11 w-11 flex items-center justify-center bg-secondaryTransparent rounded-2xl'>
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
                      list={displayedGifts}
                      setList={() => {}}
                    />
                    {hasActiveFilter && (
                      <div className='absolute top-[7px] right-[7px] w-2 h-2 bg-primary rounded-full' />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* List Content */}
          <div className='w-full pt-2'>
            <ScrollToTopButton />

            {giftsList.length === 0 && selectedList === "all" ? (
              <ListSkeleton
                type={giftType}
                count={giftType === "line" ? 15 : 20}
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
