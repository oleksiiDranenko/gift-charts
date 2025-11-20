"use client";

import GiftInterface from "@/interfaces/GiftInterface";
import { useAppSelector } from "@/redux/hooks";
import GiftItem from "./GiftItem";
import GiftListHeader from "./GiftListHeader";
import { useEffect, useRef, useState } from "react";
import { ArrowDownWideNarrow, Funnel, Search, X } from "lucide-react";
import FilterGiftsModal from "../filterGifts/FilterGiftsModal";
import SortGiftsModal from "../filterGifts/SortGiftsModal";
import InfoMessage from "../generalHints/InfoMessage";
import { useRouter } from "@/i18n/navigation";
import ListHandler from "../mainPage/ListHandler";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import useVibrate from "@/hooks/useVibrate";
import ListSkeleton from "./ListSkeleton";

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);

  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  const vibrate = useVibrate();

  const [selectedList, setSelectedList] = useState<"all" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState<GiftInterface[]>(giftsList);

  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ✅ Unified settings from localStorage
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

  const { currency, giftType, giftBackground } = settings;

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  useEffect(() => {
    let updatedList = [...giftsList];

    updatedList.sort((a, b) => b.priceUsd - a.priceUsd);

    if (selectedList === "saved" && user?.savedList?.length) {
      updatedList = updatedList.filter((gift) =>
        user.savedList.includes(gift._id)
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      updatedList = updatedList.filter((gift) =>
        gift.name?.toLowerCase().includes(q)
      );
    }

    setList(updatedList);
  }, [giftsList, selectedList, searchQuery, user?.savedList]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className='w-full h-auto flex flex-col items-center'>
      {giftsList !== undefined ? (
        <>
          <div className='w-full px-3'>
            <div className='relative w-full flex flex-row justify-between mb-5'>
              <button
                className={`w-full pb-3 text-center transition-colors duration-300  ${
                  selectedList === "all"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setSelectedList("all");
                  vibrate();
                }}>
                All Gifts
              </button>
              <button
                className={`w-full pb-3 text-center transition-colors duration-300  ${
                  selectedList === "saved"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}
                onClick={() => {
                  setSelectedList("saved");
                  vibrate();
                }}>
                Saved
              </button>

              <span
                className={`absolute bottom-0 h-[2px] rounded-2xl bg-foreground transition-all duration-300 ease-in-out ${
                  selectedList === "all" ? "left-0 w-1/2" : "left-1/2 w-1/2"
                }`}
              />
            </div>
          </div>
          <div ref={sentinelRef} />
          {selectedList === "saved" && user.savedList.length === 0 ? null : (
            <div
              className={`w-full sticky px-3 top-0 z-30 bg-background transition-all duration-300 ${
                isSticky ? "pt-[105px] lg:pt-5" : "pt-0"
              }`}>
              <div className='w-full flex flex-row gap-x-1 mb-2'>
                <div className='relative w-full'>
                  <input
                    className='w-full h-11 pl-10 pr-10 bg-secondaryTransparent text-foreground px-3 rounded-2xl focus:outline-none focus:bg-secondaryTransparent placeholder:text-secondaryText placeholder:text-sm'
                    placeholder='Search gifts'
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />

                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondaryText'
                    size={18}
                  />

                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondaryText hover:text-foreground transition-colors'>
                      <X size={16} />
                    </button>
                  )}
                </div>

                <div className='w-fit flex flex-row gap-x-1'>
                  <div className='h-full w-11 flex justify-center items-center bg-secondaryTransparent rounded-2xl'>
                    <SortGiftsModal
                      trigger={
                        <button
                          className='h-11 w-full flex items-center justify-center'
                          onClick={() => vibrate()}>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='currentColor'
                            className='size-4'>
                            <path
                              fillRule='evenodd'
                              d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </button>
                      }
                      giftsList={giftsList}
                      list={list}
                      setList={setList}
                    />
                  </div>

                  <div className='h-full relative w-11 flex justify-center items-center bg-secondaryTransparent rounded-2xl'>
                    <FilterGiftsModal
                      trigger={
                        <button
                          className='h-11  w-full flex items-center justify-center'
                          onClick={() => vibrate()}>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 24 24'
                            fill='currentColor'
                            className='size-4'>
                            <path
                              fillRule='evenodd'
                              d='M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z'
                              clipRule='evenodd'
                            />
                          </svg>
                          {list.length < giftsList.length && (
                            <div className='absolute bg-primary w-2 h-2 rounded-full top-[7px] right-[7px]' />
                          )}
                        </button>
                      }
                      giftsList={giftsList}
                      list={list}
                      setList={setList}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className='w-full pt-2'>
            <ScrollToTopButton />
            {giftsList.length === 0 && selectedList === "all" ? (
              <ListSkeleton
                type={giftType}
                count={giftType === "line" ? 15 : 20}
                hideHeader={false}
              />
            ) : selectedList === "saved" && user.savedList.length === 0 ? (
              <InfoMessage
                text='You dont have any gifts saved'
                buttonText='Add gifts to saved'
                onClick={() => router.push("/settings/edit-watchlist")}
              />
            ) : list.length > 0 ? (
              <ListHandler
                giftsList={list}
                type={giftType}
                background={giftBackground}
                currency={currency}
              />
            ) : (
              <InfoMessage
                text={`No gifts matching "${searchQuery}"`}
                buttonText='Clear the search'
                onClick={clearSearch}
              />
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
