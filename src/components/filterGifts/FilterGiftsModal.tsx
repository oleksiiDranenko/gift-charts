"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useMemo, useState, useEffect } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Search, X } from "lucide-react";
import GiftInterface from "@/interfaces/GiftInterface";
import FilterGiftItem from "./FilterGiftItem";
import { useTranslations } from "next-intl";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import InfoMessage from "../generalHints/InfoMessage";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFilters } from "@/redux/slices/filterListSlice";
import ModalBase from "@/utils/ui/ModalBase";

interface Props {
  trigger: ReactNode;
  giftsList: GiftInterface[];
}

export default function FilterGiftsModal({ trigger, giftsList }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Local state to track selections before saving
  const [localSelection, setLocalSelection] = useState<string[]>([]);

  const dispatch = useAppDispatch();
  const chosenGifts = useAppSelector((state) => state.filters.chosenGifts);
  const filters = useAppSelector((state) => state.filters);

  const vibrate = useVibrate();
  const translate = useTranslations("general");

  // Sync local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSelection(chosenGifts);
    }
  }, [isOpen, chosenGifts]);

  const clearSelection = () => {
    vibrate();
    setLocalSelection([]);
  };

  const clearSearch = () => setSearchTerm("");

  // Update local state instead of Redux
  const handleSelection = (giftId: string) => {
    vibrate();
    setLocalSelection((prev) =>
      prev.includes(giftId)
        ? prev.filter((id) => id !== giftId)
        : [...prev, giftId],
    );
  };

  // Final Save to Redux
  const applyFilters = () => {
    vibrate();
    dispatch(setFilters({ ...filters, chosenGifts: localSelection }));
    setIsOpen(false);
  };

  const filteredGifts = useMemo(() => {
    const list = giftsList || [];
    return [...list]
      .sort((a, b) => a.name.localeCompare(b.name))
      .filter((gift) =>
        gift.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        const aSelected = localSelection.includes(a._id);
        const bSelected = localSelection.includes(b._id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return 0;
      });
  }, [giftsList, searchTerm, localSelection]);

  return (
    <>
      <ModalBase trigger={trigger} open={isOpen} onOpenChange={setIsOpen}>
        {" "}
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
              onClick={() => setIsOpen(false)}
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
              placeholder={translate("searchPlaceholder")}
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
          <ScrollToTopButton />
          {filteredGifts.length > 0 ? (
            filteredGifts.map((gift) => (
              <FilterGiftItem
                key={gift._id}
                gift={gift}
                selected={localSelection.includes(gift._id)}
                onClick={() => handleSelection(gift._id)}
              />
            ))
          ) : (
            <InfoMessage
              text={`No gifts matching "${searchTerm}"`}
              buttonText='Clear search'
              onClick={clearSearch}
            />
          )}
          <div className='h-20' /> {/* Spacer for the button */}
        </div>
        <div className='absolute flex flex-row justify-between items-center gap-3 bottom-0 left-0 w-full lg:px-6 px-3 pt-3 pb-12 bg-secondaryLight backdrop-blur-lg rounded-3xl'>
          <button
            onClick={() => {
              setIsOpen(false);
              vibrate();
            }}
            className='w-full h-10 bg-secondary text-foreground font-bold rounded-3xl'>
            {translate("close")}
          </button>
          <button
            onClick={() => {
              applyFilters();
              vibrate();
            }}
            className='w-full h-10 bg-primary text-white font-bold rounded-3xl'>
            {translate("save")}
          </button>
        </div>
      </ModalBase>
    </>
  );
}
