// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useState } from "react";
import Image from "next/image";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { X } from "lucide-react";
import ReactLoading from "react-loading";
import { useQuery } from "react-query";

interface MarketsModalProps {
  trigger: ReactNode;
  giftName: string;
  giftId: string;
}

async function fetchGiftModels(giftId: string) {
  const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API}/giftModels/${giftId}`);
  return data[0].models;
}

export default function ModelsModal({
  trigger,
  giftName,
  giftId,
}: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const vibrate = useVibrate();

  const { data: modelsList = [], isLoading, isError } = useQuery(
    ['giftModels', giftId],
    () => fetchGiftModels(giftId),
    {
      enabled: !!giftId, // only run if giftId is defined
    }
  );

  return (
    <>
      {/* Clone the trigger element and attach onClick */}
      <span onClick={() => setIsOpen(true)} className="inline-block w-full">
        {trigger}
      </span>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          {/* Backdrop */}
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

          {/* Modal content */}
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
              <Dialog.Panel className="w-full lg:w-1/2 h-5/6 p-3 rounded-t-xl bg-background border border-secondary shadow-xl flex flex-col">
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

                <div className="flex-1 overflow-y-scroll">
                  {!isLoading ? (
                    modelsList
                      .sort((a: any, b: any) => b.priceTon - a.priceTon)
                      .map((model: any) => (
                        <div
                          key={model.id}
                          className="w-full h-16 mb-1 flex flex-row items-center justify-between focus:bg-secondaryTransparent rounded-lg"
                        >
                          <div className="h-full flex flex-row items-center justify-start">
                            <Image
                              src={model.image}
                              alt=""
                              width={50}
                              height={50}
                              className="w-[50px] h-[50px] p-[6px] !overflow-visible mr-2 rounded-xl bg-secondaryTransparent border border-secondaryTransparent"
                            />
                            <span className="font-bold mr-2">{model.name}</span>
                            <span className="text-xs font-bold text-primary p-1 bg-blue-500 bg-opacity-10 rounded-lg">
                              {model.rarity}%
                            </span>
                          </div>
                          <div className="flex flex-row items-center mr-4">
                            <Image
                              alt="ton logo"
                              src="/images/toncoin.webp"
                              width={15}
                              height={15}
                              className="mr-1"
                            />
                            <span className="font-bold">{model.priceTon}</span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="w-full flex justify-center mt-10">
                      <ReactLoading
                        type="spin"
                        color="var(--primary)"
                        height={30}
                        width={30}
                        className="mt-5"
                      />
                    </div>
                  )}
                  <div className="h-10"></div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
