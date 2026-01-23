// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { Search, X } from "lucide-react";
import ReactLoading from "react-loading";
import { useQuery } from "react-query";
import GiftModelInterface from "@/interfaces/GiftModelInterface";
import ModelItem from "./ModelItem";
import ModelModal from "./ModelModal";
import ModalBase from "@/utils/ui/ModalBase";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import { useAppSelector } from "@/redux/hooks";

interface MarketsModalProps {
  isOpen: boolean;
  giftName: string;
  giftId: string;
}

async function fetchGiftModels(giftId: string) {
  const { data } = await axios.get(
    `${process.env.NEXT_PUBLIC_API}/giftModels/${giftId}`,
  );
  return data[0].models;
}

export default function ModelsList({
  isOpen,
  giftName,
  giftId,
}: MarketsModalProps) {
  const user = useAppSelector((state) => state.user);

  const vibrate = useVibrate();

  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [selectedModel, setSelectedModel] = useState<GiftModelInterface | null>(
    null,
  );

  const {
    data: modelsList = [],
    isLoading,
    isError,
  } = useQuery(["giftModels", giftId], () => fetchGiftModels(giftId), {
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const clearSearch = () => setSearchQuery("");

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
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isMounted]);

  return (
    <>
      <div>
        <div className='w-full'>
          <div ref={sentinelRef} />
          {/* Search + Sort/Filter bar */}
          <div
            className={`w-full sticky px-3 pb-1 top-0 z-30 bg-background mb-2 transition-all duration-300 ${
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
                  value={searchQuery}
                  placeholder={`${giftName} models...`}
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
                </div>

                {/* <div className='relative'>
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
                </div> */}
              </div>
            </div>
          </div>
          <ScrollToTopButton />
          {!isLoading ? (
            <div className='w-full px-3 grid grid-cols-2 lg:grid-cols-5 gap-3'>
              {modelsList
                .sort((a: any, b: any) => b.priceTon - a.priceTon)
                .map((model: GiftModelInterface) => (
                  <ModalBase
                    key={model._id}
                    trigger={<ModelItem model={model} />}
                    onOpen={() => setSelectedModel(model)}
                    onClose={() => setSelectedModel(null)}>
                    <ModelModal model={selectedModel} giftId={giftId} />
                  </ModalBase>
                ))}
            </div>
          ) : (
            <div className='w-full flex justify-center mt-10'>
              <ReactLoading
                type='spin'
                color='var(--primary)'
                height={30}
                width={30}
                className='mt-5'
              />
            </div>
          )}

          <div className='h-10'></div>
        </div>
      </div>
    </>
  );
}
