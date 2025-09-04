// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import useVibrate from "@/hooks/useVibrate";
import { X } from "lucide-react";
import { useTheme } from "next-themes";

interface MarketsModalProps {
  trigger: ReactNode;
  preSale: boolean | undefined;
  selectedPrice: string;
  handleSelectedPrice: (value: "ton" | "usd" | "onSale" | "volume" | "salesCount") => void;
}

export default function SettingsModal({
  trigger,
  preSale,
  selectedPrice,
  handleSelectedPrice,
}: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const vibrate = useVibrate();
  const { resolvedTheme } = useTheme()

  return (
    <>
      <span onClick={() => setIsOpen(true)} className="inline-block w-fit">
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex items-end justify-center">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-y-full opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-full opacity-0"
            >
              <Dialog.Panel className="w-full lg:w-1/2 h-5/6 p-3 rounded-t-xl bg-background flex flex-col">
                <div className="w-full h-10 flex justify-end items-center">
                  <button
                    onClick={() => {
                      vibrate();
                      setIsOpen(false);
                    }}
                    className="w-fit p-2 bg-secondaryTransparent border border-secondary rounded-full"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="w-full">
                  <div className="p-3 mt-3 bg-secondaryTransparent rounded-xl">
                    <h1 className="font-bold mb-3">Displayed Value:</h1>
                  <div className={`w-full grid grid-cols-3 gap-1 rounded-xl bg-secondary`}>
                    <button
                      className={`w-full text-xs h-10 px-3  box-border ${
                        selectedPrice == "ton"
                          ? "rounded-xl bg-primary font-bold text-white"
                          : (resolvedTheme === 'dark' ? 'text-white' : 'text-secondaryText')
                      }`}
                      onClick={() => {
                        handleSelectedPrice("ton");
                        vibrate();
                      }}
                    >
                      Ton
                    </button>
                    <button
                      className={`w-full text-xs h-10 px-3  box-border ${
                        selectedPrice == "usd"
                          ? "rounded-xl bg-primary font-bold text-white"
                          : (resolvedTheme === 'dark' ? 'text-white' : 'text-secondaryText')
                      }`}
                      onClick={() => {
                        handleSelectedPrice("usd");
                        vibrate();
                      }}
                    >
                      Usd
                    </button>
                    {preSale ? null : <>
                      <button
                        className={`w-full text-xs h-10 px-3 box-border ${
                          selectedPrice == "onSale"
                            ? "rounded-xl bg-primary font-bold text-white"
                            : (resolvedTheme === 'dark' ? 'text-white' : 'text-secondaryText')
                        }`}
                        onClick={() => {
                          handleSelectedPrice("onSale");
                          vibrate();
                        }}
                      >
                        On Sale
                      </button>
                      {/* <button
                        className={`w-full text-xs h-10 px-3 box-border ${
                          selectedPrice == "volume"
                            ? "rounded-xl bg-primary font-bold text-white"
                            : (resolvedTheme === 'dark' ? 'text-white' : 'text-secondaryText')
                        }`}
                        onClick={() => {
                          handleSelectedPrice("volume");
                          vibrate();
                        }}
                      >
                        Volume
                      </button>
                      <button
                        className={`w-full text-xs h-10 px-3 box-border ${
                          selectedPrice == "salesCount"
                            ? "rounded-xl bg-primary font-bold text-white"
                            : (resolvedTheme === 'dark' ? 'text-white' : 'text-secondaryText')
                        }`}
                        onClick={() => {
                          handleSelectedPrice("salesCount");
                          vibrate();
                        }}
                      >
                        Sales Count
                      </button> */}
                    </>
                    }
                  </div>
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
