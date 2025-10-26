"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { BrushCleaning, X } from "lucide-react";
import GiftInterface from "@/interfaces/GiftInterface";
import FilterGiftItem from "./FilterGiftItem";
import { useTranslations } from "next-intl";

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
    setSelected([]);
    setList(giftsList);
  };

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
                <div className='w-full h-10 pb-3 flex justify-between items-center'>
                  <button
                    className='flex flex-row items-center justify-center gap-x-1 text-red-500 h-8 px-3 bg-secondaryTransparent rounded-2xl'
                    onClick={clearSelection}>
                    <BrushCleaning size={14} /> {translate("clear")}
                  </button>

                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className='w-fit p-2 bg-secondaryTransparent rounded-full'>
                    <X size={18} />
                  </button>
                </div>

                <div className='flex-1 overflow-y-scroll'>
                  {sortedGifts.map((gift) => (
                    <FilterGiftItem
                      key={gift._id}
                      gift={gift}
                      selected={selected.some((el) => el._id === gift._id)}
                      onClick={handleSelection}
                    />
                  ))}
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
