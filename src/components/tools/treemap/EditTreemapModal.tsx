"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import {
  ChevronIcon,
  OptionButton,
} from "@/components/filterGifts/ModalReusable";
import SectionTransition from "@/components/filterGifts/SelectTransition";

interface Props {
  trigger: ReactNode;
  // These callbacks will replace the local state setters you had on the page
  onListTypeChange: (type: "change" | "marketCap") => void;
  onTimeGapChange: (gap: "24h" | "1w" | "1m") => void;
  onCurrencyChange: (cur: "ton" | "usd") => void;
  onAmountChange: (amount: number) => void;

  // Current values – needed to show the selected option
  listType: "change" | "marketCap";
  timeGap: "24h" | "1w" | "1m";
  currency: "ton" | "usd";
  amount: number;
  totalGifts: number; // giftsList.length
}

export default function TreemapControlModal({
  trigger,
  onListTypeChange,
  onTimeGapChange,
  onCurrencyChange,
  onAmountChange,
  listType,
  timeGap,
  currency,
  amount,
  totalGifts,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<
    "type" | "time" | "currency" | "amount" | null
  >(null);

  const vibrate = useVibrate();

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
    setOpenSection(null);
  };

  const openModal = () => {
    vibrate();
    setIsOpen(true);
  };

  return (
    <>
      <span onClick={openModal} className='inline-block w-full'>
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
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
              <Dialog.Panel className='w-full lg:w-11/12 h-5/6 p-3 rounded-t-3xl bg-background flex flex-col'>
                {/* HEADER */}
                <div className='w-full h-10 pb-3 flex justify-end items-center'>
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
                  {/* 1. Type – Change vs Market Cap */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(openSection === "type" ? null : "type");
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
                            d='M2.25 4.5A.75.75 0 0 1 3 3.75h14.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Zm14.47 3.97a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 1 1-1.06 1.06L18 10.81V21a.75.75 0 0 1-1.5 0V10.81l-2.47 2.47a.75.75 0 1 1-1.06-1.06l3.75-3.75ZM2.25 9A.75.75 0 0 1 3 8.25h9.75a.75.75 0 0 1 0 1.5H3A.75.75 0 0 1 2.25 9Zm0 4.5a.75.75 0 0 1 .75-.75h5.25a.75.75 0 0 1 0 1.5H3a.75.75 0 0 1-.75-.75Z'
                            clipRule='evenodd'
                          />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>View by</span>
                          <span className='text-sm text-secondaryText'>
                            {listType === "change"
                              ? "Price Change"
                              : "Market Cap"}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "type"} />
                    </button>

                    <SectionTransition open={openSection === "type"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        <OptionButton
                          label='Price Change'
                          selected={listType === "change"}
                          onClick={() => {
                            vibrate();
                            onListTypeChange("change");
                            setOpenSection(null);
                          }}
                        />
                        <OptionButton
                          label='Market Cap'
                          selected={listType === "marketCap"}
                          onClick={() => {
                            vibrate();
                            onListTypeChange("marketCap");
                            setOpenSection(null);
                          }}
                        />
                      </div>
                    </SectionTransition>
                  </div>

                  {/* 2. Time Gap */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(openSection === "time" ? null : "time");
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
                            d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z'
                            clipRule='evenodd'
                          />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Time period</span>
                          <span className='text-sm text-secondaryText'>
                            {timeGap === "24h"
                              ? "24 hours"
                              : timeGap === "1w"
                              ? "1 week"
                              : "1 month"}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "time"} />
                    </button>

                    <SectionTransition open={openSection === "time"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {(["24h", "1w", "1m"] as const).map((gap) => (
                          <OptionButton
                            key={gap}
                            label={
                              gap === "24h"
                                ? "24 hours"
                                : gap === "1w"
                                ? "1 week"
                                : "1 month"
                            }
                            selected={timeGap === gap}
                            onClick={() => {
                              vibrate();
                              onTimeGapChange(gap);
                              setOpenSection(null);
                            }}
                          />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>

                  {/* 3. Currency */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(
                          openSection === "currency" ? null : "currency"
                        );
                      }}
                      className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
                      <div className='flex flex-row items-center gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='size-7 text-primary'>
                          <path d='M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z' />
                          <path
                            fillRule='evenodd'
                            d='M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z'
                            clipRule='evenodd'
                          />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Currency</span>
                          <span className='text-sm text-secondaryText'>
                            {currency.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "currency"} />
                    </button>

                    <SectionTransition open={openSection === "currency"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {(["ton", "usd"] as const).map((cur) => (
                          <OptionButton
                            key={cur}
                            label={cur.toUpperCase()}
                            selected={currency === cur}
                            onClick={() => {
                              vibrate();
                              onCurrencyChange(cur);
                              setOpenSection(null);
                            }}
                          />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>

                  {/* 4. Amount (Top N) */}
                  <div className='bg-secondaryTransparent rounded-3xl overflow-visible'>
                    <button
                      onClick={() => {
                        vibrate();
                        setOpenSection(
                          openSection === "amount" ? null : "amount"
                        );
                      }}
                      className='w-full flex justify-between items-center p-4 py-3 text-left text-foreground'>
                      <div className='flex flex-row items-center gap-x-3'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          viewBox='0 0 24 24'
                          fill='currentColor'
                          className='size-7 text-primary'>
                          <path d='M3.375 3C2.339 3 1.5 3.84 1.5 4.875v14.25c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875V4.875C22.5 3.839 21.66 3 20.625 3H3.375ZM18 4.5h-12v3h12v-3Zm0 4.5h-12v9h12v-9Z' />
                        </svg>
                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>Show</span>
                          <span className='text-sm text-secondaryText'>
                            {amount === totalGifts ? "All" : `Top ${amount}`}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "amount"} />
                    </button>

                    <SectionTransition open={openSection === "amount"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {[totalGifts, 50, 35, 25].map((num) => (
                          <OptionButton
                            key={num}
                            label={num === totalGifts ? "All" : `Top ${num}`}
                            selected={amount === num}
                            onClick={() => {
                              vibrate();
                              onAmountChange(num);
                              setOpenSection(null);
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
