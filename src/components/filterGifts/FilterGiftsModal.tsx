// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { BrushCleaning, Trash, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import GiftInterface from "@/interfaces/GiftInterface";
import { setGiftsList } from "@/redux/slices/giftsListSlice";
import { setFilters } from "@/redux/slices/filterListSlice";
import FilterGiftItem from "./FilterGiftItem";

interface Props {
  trigger: ReactNode;
}

export default function FilterGiftsModal({ trigger }: Props) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const vibrate = useVibrate();

  const dispatch = useAppDispatch();
  const giftsList = useAppSelector((state) => state.giftsList);
  const filters = useAppSelector((state) => state.filters);
  const list = useAppSelector((state) => state.filters.chosenGifts);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const sortedGifts = [...giftsList].sort(
      (a: GiftInterface, b: GiftInterface) => a.name.localeCompare(b.name)
    );

    if (JSON.stringify(sortedGifts) !== JSON.stringify(giftsList)) {
      dispatch(setGiftsList(sortedGifts));
    }
    setLoading(false);
  }, [dispatch, giftsList]);

  const handleSelection = (item: GiftInterface) => {
    if (list.includes(item)) {
      dispatch(
        setFilters({
          ...filters,
          chosenGifts: list.filter((el) => item._id !== el._id),
        })
      );
    } else {
      dispatch(setFilters({ ...filters, chosenGifts: [...list, item] }));
    }
  };

  return (
    <>
      {/* Clone the trigger element and attach onClick */}
      <span onClick={() => setIsOpen(true)} className='inline-block w-full'>
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setIsOpen(false)}>
          {/* Backdrop */}
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
              <Dialog.Panel className='w-full lg:w-5/6 h-5/6 p-3 rounded-t-xl bg-background border border-secondary shadow-xl flex flex-col'>
                <div className='w-full h-10 flex justify-between items-center'>
                  <div className='flex flex-row'>
                    <button
                      className='flex flex-row items-center justify-center gap-x-1 text-primary h-8 px-3 bg-secondaryTransparent rounded-xl'
                      onClick={() =>
                        dispatch(setFilters({ ...filters, chosenGifts: [] }))
                      }>
                      <BrushCleaning size={14} /> Clear
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className='w-fit p-2 bg-secondaryTransparent border border-secondary rounded-full'>
                    <X size={18} />
                  </button>
                </div>

                <div className='flex-1 overflow-y-scroll'>
                  {giftsList.map((gift) => {
                    return (
                      <FilterGiftItem
                        gift={gift}
                        selected={list.includes(gift) ? true : false}
                        onClick={handleSelection}
                        key={gift._id}
                      />
                    );
                  })}
                  <div className='h-10'></div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
