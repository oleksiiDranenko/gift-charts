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

export default function SortGiftsModal({
  trigger,
  giftsList,
  list,
  setList,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const vibrate = useVibrate();

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
                <div className='w-full h-10 pb-3 flex justify-end items-center'>
                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className='w-fit p-2 bg-secondaryTransparent rounded-full'>
                    <X size={18} />
                  </button>
                </div>

                <div className='w-full'></div>
                <div className='h-10' />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
