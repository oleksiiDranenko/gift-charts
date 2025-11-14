"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { Search, X } from "lucide-react";
import GiftInterface from "@/interfaces/GiftInterface";
import FilterGiftItem from "./FilterGiftItem";
import { useTranslations } from "next-intl";
import ScrollToTopButton from "../scrollControl/ScrollToTopButton";
import InfoMessage from "../generalHints/InfoMessage";

interface Props {
  trigger: ReactNode;
  giftsList: GiftInterface[];
  list: GiftInterface[];
  setList: React.Dispatch<React.SetStateAction<GiftInterface[]>>;
}

export default function FilterGiftsModal({
  trigger,
  giftsList,
  list,
  setList,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();
  const translate = useTranslations("general");

  const [sortedGifts, setSortedGifts] = useState<GiftInterface[]>([]);
  const [selected, setSelected] = useState<GiftInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const sorted = [...giftsList].sort((a, b) => a.name.localeCompare(b.name));
    setSortedGifts(sorted);
  }, [giftsList]);

  useEffect(() => {
    if (selected.length === 0) {
      setList(giftsList);
    } else {
      setList(selected);
    }
  }, [selected, giftsList, setList]);

  useEffect(() => {
    if (isOpen) {
      setSelected(list.length === giftsList.length ? [] : list);
      setSearchTerm("");
    }
  }, [isOpen, giftsList, list]);

  const handleSelection = (item: GiftInterface) => {
    setSelected((prev) =>
      prev.some((el) => el._id === item._id)
        ? prev.filter((el) => el._id !== item._id)
        : [...prev, item]
    );
  };

  const clearSelection = () => {
    if (selected.length > 0) {
      setSelected([]);
      setList(giftsList);
      vibrate();
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  // 🔍 Filter + sort gifts by search term
  const filteredGifts = [...sortedGifts]
    .filter((gift) =>
      gift.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aSelected = selected.some((el) => el._id === a._id);
      const bSelected = selected.some((el) => el._id === b._id);
      // ✅ Move selected gifts to top
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return a.name.localeCompare(b.name);
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
              <Dialog.Panel className='w-full lg:w-5/6 h-5/6 p-3 rounded-t-xl bg-background flex flex-col'>
                {/* Header */}
                <div className='w-full h-10 pb-3 flex justify-between items-center'>
                  <div className='w-1/3'>
                    <button
                      className={`flex flex-row items-center justify-center gap-x-1 ${
                        selected.length === 0 ? "opacity-50" : ""
                      } h-8 px-3 bg-secondaryTransparent rounded-3xl`}
                      onClick={clearSelection}>
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

                  <div className='w-1/3 flex justify-center'>
                    <span
                      className={`${
                        selected.length > 0
                          ? "text-primary"
                          : "text-secondaryText"
                      } text-sm`}>
                      {selected.length} Selected
                    </span>
                  </div>

                  <div className='w-1/3 flex flex-row justify-end'>
                    <button
                      onClick={() => {
                        vibrate();
                        setIsOpen(false);
                      }}
                      className='w-fit p-2 bg-secondaryTransparent rounded-full'>
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

                {/* Body */}
                <div className='flex-1 overflow-y-scroll'>
                  {/* Search Input */}
                  <div className='relative w-full my-1'>
                    <input
                      className='w-full h-11 pl-10 pr-10 bg-secondaryTransparent text-foreground px-3 rounded-3xl focus:outline-none placeholder:text-secondaryText placeholder:text-sm'
                      placeholder='Search gifts'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <Search
                      className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-secondaryText'
                      size={18}
                    />

                    {searchTerm && (
                      <button
                        onClick={clearSearch}
                        className='absolute right-3 top-1/2 transform -translate-y-1/2 text-secondaryText hover:text-foreground transition-colors'>
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <ScrollToTopButton />

                  {filteredGifts.map((gift) => (
                    <FilterGiftItem
                      key={gift._id}
                      gift={gift}
                      selected={selected.some((el) => el._id === gift._id)}
                      onClick={handleSelection}
                    />
                  ))}

                  {/* Empty State */}
                  {filteredGifts.length === 0 && (
                    <InfoMessage
                      text={`No gifts matching "${searchTerm}"`}
                      buttonText={"Clear the search"}
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
