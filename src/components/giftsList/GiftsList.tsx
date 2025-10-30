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

interface PropsInterface {
  loading: boolean;
}

export default function GiftsList({ loading }: PropsInterface) {
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const user = useAppSelector((state) => state.user);

  const router = useRouter();

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
  }, []);

  useEffect(() => {
    let updatedList = [...giftsList];

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

  return (
    <div className='w-full h-auto flex flex-col items-center'>
      {giftsList !== undefined ? (
        <>
          <div className='w-full px-3'>
            <div className='relative w-full flex flex-row justify-between mb-5 '>
              <button
                className={`w-full text-sm pb-2 text-center transition-colors duration-300 ${
                  selectedList === "all"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}
                onClick={() => setSelectedList("all")}>
                All Gifts
              </button>
              <button
                className={`w-full text-sm pb-2 text-center transition-colors duration-300 ${
                  selectedList === "saved"
                    ? "text-foreground font-bold"
                    : "text-secondaryText"
                }`}
                onClick={() => setSelectedList("saved")}>
                Saved
              </button>

              <span
                className={`absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-in-out ${
                  selectedList === "all" ? "left-0 w-1/2" : "left-1/2 w-1/2"
                }`}
              />
            </div>
          </div>
          <div ref={sentinelRef} />
          {selectedList === "saved" && user.savedList.length === 0 ? null : (
            <div
              className={`w-full sticky px-3 top-0 z-30 bg-background transition-all duration-200 ${
                isSticky ? "pt-[110px] lg:pt-5" : "pt-0"
              }`}>
              <div className='w-full flex flex-row gap-x-1 mb-3'>
                <div className='relative w-full'>
                  <input
                    className='w-full h-11 pl-10 pr-10 bg-secondaryTransparent text-foreground px-3 rounded-2xl focus:outline-none focus:bg-secondaryTransparent placeholder:text-secondaryText placeholder:text-sm'
                    placeholder='Search gift'
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
                        <button className='h-11 w-full flex items-center justify-center'>
                          <ArrowDownWideNarrow size={16} />
                        </button>
                      }
                      giftsList={giftsList}
                      list={list}
                      setList={setList}
                    />
                  </div>

                  <div className='h-full w-11 flex justify-center items-center bg-secondaryTransparent rounded-2xl'>
                    <FilterGiftsModal
                      trigger={
                        <button className='h-11 w-full flex items-center justify-center'>
                          <Funnel size={16} />
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

          <div className='w-full'>
            {selectedList === "saved" && user.savedList.length === 0 ? (
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
