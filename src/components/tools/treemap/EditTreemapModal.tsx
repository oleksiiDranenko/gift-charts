"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import useVibrate from "@/hooks/useVibrate";
import {
  ChevronIcon,
  OptionButton,
} from "@/components/filterGifts/ModalReusable";
import SectionTransition from "@/components/filterGifts/SelectTransition";
import { useTranslations } from "next-intl";

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

  const translate = useTranslations("filters");

  const closeModal = () => {
    vibrate();
    setIsOpen(false);
    setOpenSection(null);
  };

  const openModal = () => {
    vibrate();
    setIsOpen(true);
  };

  const resetFilters = () => {
    vibrate();

    if (hasChanges) {
      onListTypeChange("marketCap");
      onTimeGapChange("24h");
      onCurrencyChange("ton");
      onAmountChange(totalGifts);
    }
  };

  const hasChanges =
    listType !== "marketCap" ||
    timeGap !== "24h" ||
    currency !== "ton" ||
    amount !== totalGifts;

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
              <Dialog.Panel className='w-full lg:w-[98%] h-5/6 p-3 rounded-t-3xl bg-background flex flex-col'>
                {/* HEADER */}
                <div className='w-full h-10 pb-3 flex justify-between items-center'>
                  <button
                    onClick={resetFilters}
                    className={`flex items-center justify-center gap-x-1 h-8 px-3 bg-secondaryTransparent rounded-3xl transition-opacity ${
                      !hasChanges ? "opacity-50" : ""
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
                          <span className='text-lg font-bold'>
                            {translate("viewBy")}
                          </span>
                          <span className='text-sm text-secondaryText'>
                            {translate(listType)}
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
                          <span className='text-lg font-bold'>
                            {translate("timePeriod")}
                          </span>
                          <span className='text-sm text-secondaryText'>
                            {translate(timeGap)}
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
                            label={translate(gap)}
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
                          <span className='text-lg font-bold'>
                            {translate("currency")}
                          </span>
                          <span className='text-sm text-secondaryText'>
                            {translate(currency)}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "currency"} />
                    </button>

                    <SectionTransition open={openSection === "currency"}>
                      <div className='flex flex-col gap-1 px-4 pb-3'>
                        <div className='h-[2px] w-full bg-secondary mb-1' />
                        {(["ton", "usd"] as const).map((item) => (
                          <OptionButton
                            key={item}
                            label={translate(item)}
                            selected={currency === item}
                            onClick={() => {
                              vibrate();
                              onCurrencyChange(item);
                              setOpenSection(null);
                            }}
                          />
                        ))}
                      </div>
                    </SectionTransition>
                  </div>

                  {/* 4. Amount (Top N) */}

                  {/* 4. Amount (Top N) - Slider Version */}
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
                          <path d='M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z' />
                        </svg>

                        <div className='flex flex-col items-start'>
                          <span className='text-lg font-bold'>
                            {translate("displayAmount")}
                          </span>
                          <span className='text-sm text-secondaryText'>
                            {amount === totalGifts
                              ? translate("all")
                              : `${translate("top")} ${amount}`}
                          </span>
                        </div>
                      </div>
                      <ChevronIcon open={openSection === "amount"} />
                    </button>

                    <SectionTransition open={openSection === "amount"}>
                      <div className='px-6 pb-5 pt-3'>
                        {/* Slider Container */}
                        <div className='space-y-3'>
                          {/* Current Value Display */}
                          <div className='flex justify-center items-center'>
                            <span className='text-xl font-bold'>
                              {amount === totalGifts
                                ? translate("all")
                                : amount}
                            </span>
                          </div>

                          {/* Radix Slider */}
                          <Slider.Root
                            className='relative flex items-center select-none touch-none w-full h-10'
                            value={[amount]}
                            onValueChange={([value]) => {
                              vibrate();
                              onAmountChange(value);
                            }}
                            max={totalGifts}
                            min={10}
                            step={5}
                            aria-label='Top N gifts'>
                            <Slider.Track className='bg-secondary relative grow rounded-full h-1'>
                              <Slider.Range className='absolute bg-primary rounded-full h-full' />
                            </Slider.Track>
                            <Slider.Thumb className='block w-6 h-6 bg-primary rounded-full ' />
                          </Slider.Root>

                          {/* Min / Max Labels */}
                          <div className='flex justify-between text-xs text-secondaryText px-1'>
                            <span>10</span>
                            <span>
                              {totalGifts <= 100 ? totalGifts : "100+"}
                            </span>
                          </div>

                          {/* Optional: All Button */}
                          {amount !== totalGifts && (
                            <button
                              onClick={() => {
                                vibrate();
                                onAmountChange(totalGifts);
                                setOpenSection(null);
                              }}
                              className='w-full py-3 mt-4 bg-primary/10 hover:bg-primary/20 rounded-2xl text-primary font-semibold transition-colors'>
                              {translate("displayAll")} ({totalGifts})
                            </button>
                          )}
                        </div>
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
