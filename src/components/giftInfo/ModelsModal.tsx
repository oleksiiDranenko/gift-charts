// components/MarketsModal.tsx
"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useVibrate from "@/hooks/useVibrate";
import axios from "axios";
import { Gift, X } from "lucide-react";

interface MarketsModalProps {
  trigger: ReactNode;
  giftName: string;
  giftId: string;
}

export default function ModelsModal({
  trigger,
  giftName,
  giftId,
}: MarketsModalProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [modelsList, setModelsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const vibrate = useVibrate();

  useEffect(() => {
    (async () => {
      const giftRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/giftModels/${giftId}`
      );
      setModelsList(giftRes.data[0].models);
      setLoading(false);
    })();
  }, []);

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
                <div className="w-full h-10 mb-3 flex justify-end items-center">
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

                {/* Scrollable list */}
                <div className="flex-1 overflow-y-auto">
                  {!loading
                    ? modelsList.map((model) => (
                        <div
                          key={model.id}
                          className="w-full h-16 gap-x-2 mb-1 flex flex-row items-center justify-start focus:bg-secondaryTransparent rounded-lg"
                        >
                          <Image
                            src={model.image}
                            alt=""
                            width={50}
                            height={50}
                            className="w-[50px] h-[50px] p-[6px] !overflow-visible mr-3 ml-2 rounded-xl bg-secondaryTransparent border border-secondaryTransparent"
                          />
                          <span className="font-bold">{model.name}</span>
                          <span className="text-secondaryText">
                            {model.rarity}%
                          </span>
                        </div>
                      ))
                    : "loading"}
                </div>

                <div className="h-10"></div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
