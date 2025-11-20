"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Search, X } from "lucide-react";
import GiftInterface from "@/interfaces/GiftInterface";
import FilterGiftItem from "./FilterGiftItem";
import { useTranslations } from "next-intl";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import InfoMessage from "../generalHints/InfoMessage";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setFilters, toggleGiftInFilter } from "@/redux/slices/filterListSlice";

interface Props {
  trigger: ReactNode;
  giftsList: GiftInterface[];
}

export default function FilterGiftsModal({ trigger, giftsList }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const dispatch = useAppDispatch();
  const chosenGifts = useAppSelector((state) => state.filters.chosenGifts);
  const filters = useAppSelector((state) => state.filters);

  const vibrate = useVibrate();
  const translate = useTranslations("general");

  const clearSelection = () => {
    vibrate();
    dispatch(setFilters({ ...filters, chosenGifts: [] }));
  };

  const clearSearch = () => setSearchTerm("");

  const handleSelection = (gift: GiftInterface) => {
    vibrate();
    dispatch(toggleGiftInFilter(gift._id));
  };

  const filteredGifts = [...giftsList]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((gift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = chosenGifts.includes(a._id);
      const bSelected = chosenGifts.includes(b._id);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });

  return (
    <>
      <span onClick={() => setIsOpen(true)} className='inline-block w-full'>
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'>
            <div className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 flex items-end justify-center'>
            <Transition.Child
              as={Fragment}
              enter='transform transition ease-out duration-300'
              enterFrom='translate-y-full opacity-0'
              enterTo='translate-y-0 opacity-100'
              leave='transform transition ease-in duration-200'
              leaveFrom='translate-y-0 opacity-100'
              leaveTo='translate-y-full opacity-0'>
              <Dialog.Panel className='w-full lg:w-11/12 h-5/6 p-3 rounded-t-xl bg-background flex flex-col'>
                <div className='w-full h-10 pb-3 flex justify-between items-center'>
                  <div className='w-1/3'>
                    <button
                      onClick={clearSelection}
                      className={`flex items-center justify-center gap-x-1 h-8 px-3 bg-secondaryTransparent rounded-2xl transition-opacity ${
                        chosenGifts.length === 0 ? "opacity-50" : ""
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
                      className={`text-sm font-medium ${
                        chosenGifts.length > 0
                          ? "text-primary"
                          : "text-secondaryText"
                      }`}>
                      {chosenGifts.length} Selected
                    </span>
                  </div>

                  <div className='w-1/3 flex justify-end'>
                    <button
                      onClick={() => {
                        vibrate();
                        setIsOpen(false);
                      }}
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

                <div className='flex-1 overflow-y-auto'>
                  <div className='relative w-full my-2'>
                    <input
                      type='text'
                      placeholder='Search gifts'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full h-11 pl-10 pr-10 bg-secondaryTransparent rounded-2xl text-foreground placeholder:text-secondaryText focus:outline-none'
                    />
                    <Search
                      className='absolute left-3 top-1/2 -translate-y-1/2 text-secondaryText pointer-events-none'
                      size={18}
                    />
                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText hover:text-foreground'>
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
                        selected={chosenGifts.includes(gift._id)}
                        onClick={() => handleSelection(gift)}
                      />
                    ))
                  ) : (
                    <InfoMessage
                      text={`No gifts matching "${searchTerm}"`}
                      buttonText='Clear search'
                      onClick={clearSearch}
                    />
                  )}

                  <div className='h-10' />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
