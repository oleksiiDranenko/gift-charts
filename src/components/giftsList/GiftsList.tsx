"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useEffect, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import FilterGiftsModal from "../filterGifts/FilterGiftsModal";
import SortGiftsModal from "../filterGifts/SortGiftsModal";
import InfoMessage from "../generalHints/InfoMessage";
import ListHandler from "../mainPage/ListHandler";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import useVibrate from "@/hooks/useVibrate";
import ListSkeleton from "./ListSkeleton";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import axios from "axios";
import { useInfiniteQuery, useQuery } from "react-query";
import { GiftListItemInterface } from "@/interfaces/GiftListItemInterface";
import { mapSortToApi } from "@/utils/sortMapping";

interface GiftsSearchResponse {
  data: GiftListItemInterface[];
  page: number;
  currency: "ton" | "usd";
  hasMore: boolean;
}

export default function GiftsList() {
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [selectedList, setSelectedList] = useState<
    "all" | "saved" | "gainers" | "losers"
  >("all");

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { resolvedTheme } = useTheme();
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const vibrate = useVibrate();
  const translate = useTranslations("mainPage");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const [settings] = useState(() => {
    if (typeof window === "undefined")
      return { currency: "ton", giftType: "line", giftBackground: "none" };
    const saved = localStorage.getItem("settings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return { currency: "ton", giftType: "line", giftBackground: "none" };
  });

  const { currency, giftType, giftBackground } = settings;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsSticky(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isMounted]);

  const clearSearch = () => {
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Inside your frontend component or a custom hook
  const { data: allGiftsMinimal } = useQuery(
    ["giftsMinimal"],
    async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/gifts/minimal`,
      );
      return res.data;
    },
    {
      staleTime: 1000 * 60 * 30, // Cache for 10 minutes since gift lists rarely change
      refetchOnWindowFocus: false,
    },
  );

  // 2. Infinite Query: Now uses 'debouncedSearch' in the key
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isLoading,
  } = useInfiniteQuery<GiftsSearchResponse>(
    [
      "giftsSearch",
      currency,
      debouncedSearch,
      selectedList,
      filters.sort,
      filters.chosenGifts,
      user.savedList,
    ],
    async ({ pageParam = 1 }) => {
      // 1. Get Sort from Modal (Redux)
      let { sortBy, order } = mapSortToApi(filters.sort);

      // 2. Override if we are in specific tabs (Gainers/Losers)
      if (selectedList === "gainers") {
        sortBy = "growth24hPercent";
        order = "desc";
      } else if (selectedList === "losers") {
        sortBy = "growth24hPercent";
        order = "asc";
      }

      // Determine which IDs to filter by
      let requestIds: string[] | undefined = undefined;

      if (selectedList === "saved") {
        // If user is on the "Saved" tab, use their personal list
        requestIds = user.savedList;
      } else if (filters.chosenGifts.length > 0) {
        // If user is on any other tab but has manual filters applied
        requestIds = filters.chosenGifts;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/gifts/search`,
        {
          page: pageParam,
          currency,
          search: debouncedSearch || undefined,
          ids: requestIds,
          sort: { sortBy, order },
        },
      );
      return res.data;
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.hasMore ? lastPage.page + 1 : undefined,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  );

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading || isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const giftsList = data?.pages.flatMap((page) => page.data) ?? [];
  const lastIndex = giftsList.length;

  if (!isMounted) return null;

  // Add 'type' as an argument here
  const getTabIcon = (type: "all" | "saved" | "gainers" | "losers") => {
    switch (type) {
      case "all":
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5 text-primary'>
            <path d='M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z' />
          </svg>
        );
      case "saved":
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5 text-primary'>
            <path
              fillRule='evenodd'
              d='M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z'
              clipRule='evenodd'
            />
          </svg>
        );
      case "gainers":
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5 text-green-500'>
            <path
              fillRule='evenodd'
              d='M15.22 6.268a.75.75 0 0 1 .968-.431l5.942 2.28a.75.75 0 0 1 .431.97l-2.28 5.94a.75.75 0 1 1-1.4-.537l1.63-4.251-1.086.484a11.2 11.2 0 0 0-5.45 5.173.75.75 0 0 1-1.199.19L9 12.312l-6.22 6.22a.75.75 0 0 1-1.06-1.061l6.75-6.75a.75.75 0 0 1 1.06 0l3.606 3.606a12.695 12.695 0 0 1 5.68-4.974l1.086-.483-4.251-1.632a.75.75 0 0 1-.432-.97Z'
              clipRule='evenodd'
            />
          </svg>
        );
      case "losers":
        return (
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            className='size-5 text-red-500'>
            <path
              fillRule='evenodd'
              d='M1.72 5.47a.75.75 0 0 1 1.06 0L9 11.69l3.756-3.756a.75.75 0 0 1 .985-.066 12.698 12.698 0 0 1 4.575 6.832l.308 1.149 2.277-3.943a.75.75 0 1 1 1.299.75l-3.182 5.51a.75.75 0 0 1-1.025.275l-5.511-3.181a.75.75 0 0 1 .75-1.3l3.943 2.277-.308-1.149a11.194 11.194 0 0 0-3.528-5.617l-3.809 3.81a.75.75 0 0 1-1.06 0L1.72 6.53a.75.75 0 0 1 0-1.061Z'
              clipRule='evenodd'
            />
          </svg>
        );
    }
  };

  return (
    <div className='w-full flex flex-col items-center'>
      {/* Navigation Tabs */}
      <div className='w-full mb-4 mt-1 px-3 overflow-scroll scrollbar-hide flex flex-row items-center justify-start text-nowrap '>
        {(["all", "saved", "gainers", "losers"] as const)
          .filter((list) => !(list === "saved" && user.username === "_guest"))
          .map((list) => (
            <button
              key={list}
              className={`flex flex-row items-center justify-center gap-x-2 px-3 h-10 transition-colors font-bold ${
                selectedList === list
                  ? "border-b-2 border-foreground"
                  : "border-b-2 border-secondaryTransparent text-secondaryText"
              }`}
              onClick={() => {
                vibrate();
                setSelectedList(list);
              }}>
              <div className={` `}>{getTabIcon(list)}</div>
              <div className=''>
                {translate(list === "all" ? "allGifts" : list)}
              </div>
            </button>
          ))}
      </div>

      <div ref={sentinelRef} />

      <div
        className={`w-full sticky px-3 top-0 z-30 bg-background transition-all duration-300 ${
          isSticky
            ? user.username === "_guest"
              ? "pt-5"
              : "pt-[105px] lg:pt-5"
            : "pt-0"
        }`}>
        <div className='flex gap-1 mb-1'>
          <div className='relative flex-1'>
            <input
              type='text'
              placeholder={translate("searchPlaceholder")}
              value={searchQuery} // Input is bound to instant state
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => vibrate()}
              className='w-full h-12 pl-10 bg-secondaryTransparent text-foreground px-3 rounded-3xl focus:outline-none placeholder:text-secondaryText placeholder:text-sm'
            />
            <Search
              className='absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText'
              size={18}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText'>
                <X size={18} />
              </button>
            )}
          </div>

          <div className='flex gap-1'>
            <SortGiftsModal
              trigger={
                <button
                  onClick={() => vibrate()}
                  className='h-12 w-12 flex items-center justify-center bg-secondaryTransparent rounded-3xl relative'>
                  <SortIcon />
                  {filters.sort !== "highFirst" && (
                    <span className='absolute top-[7px] right-[7px] w-2 h-2 bg-primary rounded-full' />
                  )}
                </button>
              }
            />
            <FilterGiftsModal
              giftsList={allGiftsMinimal}
              trigger={
                <button
                  onClick={() => vibrate()}
                  className='h-12 w-12 flex items-center justify-center bg-secondaryTransparent rounded-3xl'>
                  <FilterIcon />
                </button>
              }
            />
          </div>
        </div>
      </div>

      <div className='w-full pt-1'>
        <ScrollToTopButton />

        {isLoading || (isFetching && !isFetchingNextPage) ? (
          <ListSkeleton
            type={giftType}
            count={15}
            lastIndex={lastIndex}
            hideHeader={false}
          />
        ) : giftsList.length > 0 ? (
          <>
            <ListHandler
              giftsList={giftsList}
              type={giftType}
              background={giftBackground}
              currency={currency}
            />
            <div ref={lastElementRef} className='h-0 w-full' />
            {isFetchingNextPage && (
              <ListSkeleton
                type={giftType}
                count={15}
                lastIndex={lastIndex}
                hideHeader
              />
            )}
          </>
        ) : (
          <InfoMessage
            text={`No gifts matching "${debouncedSearch}"`}
            buttonText='Clear search'
            onClick={clearSearch}
          />
        )}
      </div>
    </div>
  );
}

// Icons remain the same as previous response...
const SortIcon = () => (
  <svg className='size-5' viewBox='0 0 24 24' fill='currentColor'>
    <path
      fillRule='evenodd'
      d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
      clipRule='evenodd'
    />
  </svg>
);

const FilterIcon = () => (
  <svg className='size-5' viewBox='0 0 24 24' fill='currentColor'>
    <path
      fillRule='evenodd'
      d='M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z'
      clipRule='evenodd'
    />
  </svg>
);
