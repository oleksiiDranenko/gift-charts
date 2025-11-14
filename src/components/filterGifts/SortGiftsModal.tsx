"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import GiftInterface from "@/interfaces/GiftInterface";
import SectionTransition from "./SelectTransition";
import { useTranslations } from "next-intl";

interface Props {
  trigger: ReactNode;
  giftsList: GiftInterface[];
  list: GiftInterface[];
  setList: React.Dispatch<React.SetStateAction<GiftInterface[]>>;
}

const SORT_OPTIONS = [
  "Alphabet",
  "Supply",
  "Init Supply",
  "Upgraded Supply",
  "Release Date",
  "Stars Price",
  "Price (USD)",
  "Price (TON)",
];

export default function SortGiftsModal({
  trigger,
  giftsList,
  list,
  setList,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<"sort" | "order" | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>("Price (TON)");
  const [selectedOrder, setSelectedOrder] = useState<
    "High first" | "Low first"
  >("High first");

  const translate = useTranslations("general");
  const vibrate = useVibrate();

  const resetAll = () => {
    vibrate();
    setSelectedSort("Price (TON)");
    setSelectedOrder("High first");
    setOpenSection(null);
  };

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
    setOpenSection(null);
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
          onClose={() => {
            setIsOpen(false);
            setOpenSection(null);
          }}>
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
                {/* HEADER */}
                <div className='w-full h-10 pb-3 flex justify-between items-center'>
                  <button
                    className={`flex flex-row items-center justify-center gap-x-1 ${
                      selectedSort === "Price (TON)" &&
                      selectedOrder === "High first"
                        ? "opacity-50"
                        : ""
                    } h-8 px-3 bg-secondaryTransparent rounded-3xl`}
                    onClick={resetAll}>
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
                    {translate("reset")}
                  </button>

                  <button
                    onClick={closeModal}
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

                {/* BODY */}
                <div className='flex-1 overflow-y-auto flex flex-col gap-3 pt-2'>
                  {/* Sort By Section */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(openSection === "sort" ? null : "sort");
                      }}
                      className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
                      <div className='flex flex-row items-center gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='size-7 text-primary'>
                          <path d='M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z' />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Sort By</span>
                          <span className='text-sm text-secondaryText'>
                            {selectedSort}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "sort"} />
                    </button>

                    <SectionTransition open={openSection === "sort"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {SORT_OPTIONS.map((option) => (
                          <OptionButton
                            key={option}
                            label={option}
                            selected={selectedSort === option}
                            onClick={() => {
                              vibrate();
                              setSelectedSort(option);
                            }}
                          />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>

                  {/* Order Section */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(
                          openSection === "order" ? null : "order"
                        );
                      }}
                      className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
                      <div className='flex flex-row items-center gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='size-7 text-primary'>
                          <path
                            fillRule='evenodd'
                            d='M6.97 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06L8.25 4.81V16.5a.75.75 0 0 1-1.5 0V4.81L3.53 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5Zm9.53 4.28a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V7.5a.75.75 0 0 1 .75-.75Z'
                            clipRule='evenodd'
                          />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Order</span>
                          <span className='text-sm text-secondaryText'>
                            {selectedOrder}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "order"} />
                    </button>

                    <SectionTransition open={openSection === "order"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {["High first", "Low first"].map((order) => (
                          <OptionButton
                            key={order}
                            label={order}
                            selected={selectedOrder === order}
                            onClick={() => {
                              vibrate();
                              setSelectedOrder(order as any);
                            }}
                          />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

/* ————— Small reusable components ————— */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='currentColor'
      className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}>
      <path
        fillRule='evenodd'
        d='M12.53 16.28a.75.75 0 0 1-1.06 0l-7.5-7.5a.75.75 0 0 1 1.06-1.06L12 14.69l6.97-6.97a.75.75 0 1 1 1.06 1.06l-7.5 7.5Z'
        clipRule='evenodd'
      />
    </svg>
  );
}

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left px-3 py-3 rounded-3xl flex flex-row items-center gap-x-2 transition-colors ${
        selected
          ? "bg-secondary text-foreground font-bold"
          : "text-secondaryText hover:bg-secondaryTransparent"
      }`}>
      {selected ? (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-6 text-primary'>
          <path
            fillRule='evenodd'
            d='M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z'
            clipRule='evenodd'
          />
        </svg>
      ) : (
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 24 24'
          fill='currentColor'
          className='size-6 text-secondary'>
          <path
            fillRule='evenodd'
            d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z'
            clipRule='evenodd'
          />
        </svg>
      )}
      {label}
    </button>
  );
}
